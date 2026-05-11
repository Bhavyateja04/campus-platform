const bcrypt = require('bcrypt');

const User           = require('../models/UserModel');
const { emitRealtime } = require('../realtime');

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_EMAIL_DOMAINS = /@(acet|aec|aus)\.ac\.in$/;
const SALT_ROUNDS           = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a plain user object with the password field removed.
 */
const toSafeUser = (user) => {
  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/admin/users
 * Create a new user. Only college email domains are permitted.
 */
const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!ALLOWED_EMAIL_DOMAINS.test(email)) {
      return res.status(400).json({
        message: 'Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user           = await User.create({ ...req.body, password: hashedPassword });
    const safeUser       = toSafeUser(user);

    emitRealtime('admin:users-changed', { action: 'created', user: safeUser });

    res.status(201).json({ message: 'User created successfully', data: safeUser });
  } catch (error) {
    console.error('[createUser]', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

/**
 * GET /api/admin/users
 * Retrieve all users (passwords excluded).
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({ message: 'Users retrieved successfully', data: users });
  } catch (error) {
    console.error('[getUsers]', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user by ID.
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    emitRealtime('admin:users-changed', { action: 'deleted', userId: req.params.id });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[deleteUser]', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

/**
 * PUT /api/admin/users/:id
 * Update a user by ID (password excluded from response).
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    emitRealtime('admin:users-changed', { action: 'updated', user });

    res.status(200).json({ message: 'User updated successfully', data: user });
  } catch (error) {
    console.error('[updateUser]', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { createUser, getUsers, deleteUser, updateUser };
