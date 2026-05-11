const bcrypt = require('bcrypt');

const User = require('../models/UserModel');

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Fields a user is allowed to update on their own profile.
 *
 * Excludes:
 * - email      → used as identity
 * - rollNumber → used as identity
 * - role       → privilege escalation risk
 * - password   → handled by the dedicated update-password endpoint
 */
const SELF_EDITABLE_FIELDS = ['name', 'phone', 'department', 'course', 'college'];

const PASSWORD_MIN_LENGTH = 6;
const SALT_ROUNDS         = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a safe public-facing user object (no sensitive fields).
 */
const toPublicUser = (user) => {
  if (!user) return null;

  return {
    id:         String(user._id),
    name:       user.name,
    email:      user.email,
    rollNumber: user.rollNumber,
    role:       user.role,
    college:    user.college    || '',
    course:     user.course     || '',
    department: user.department || '',
    phone:      user.phone      || '',
    firstLogin: !!user.firstLogin,
    createdAt:  user.createdAt,
  };
};

/**
 * Extracts and trims only the allowed editable fields from the request body.
 */
const extractEditableFields = (body = {}) => {
  const updates = {};

  for (const field of SELF_EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field) && typeof body[field] === 'string') {
      updates[field] = body[field].trim();
    }
  }

  return updates;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/users/me
 * Returns the authenticated user's profile.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('[getMe]', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

/**
 * PUT /api/users/me
 * Updates allowed profile fields for the authenticated user.
 */
const updateMe = async (req, res) => {
  try {
    const updates = extractEditableFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: `No editable fields supplied. Allowed: ${SELF_EDITABLE_FIELDS.join(', ')}`,
      });
    }

    if (updates.name !== undefined && updates.name.length === 0) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated', user: toPublicUser(user) });
  } catch (error) {
    console.error('[updateMe]', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

/**
 * PUT /api/users/me/password
 * Updates the authenticated user's password after verifying the old one.
 */
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password   = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.firstLogin = false;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[updatePassword]', error);
    res.status(500).json({ message: 'Error updating password' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { getMe, updateMe, updatePassword };
