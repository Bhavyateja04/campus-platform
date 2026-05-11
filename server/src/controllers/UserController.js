const User = require('../models/UserModel');
const bcrypt = require('bcrypt');

// ─── Update user password ─────────────────────────────────────────────────────

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the old password' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password   = await bcrypt.hash(newPassword, 10);
    user.firstLogin = false;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('updatePassword error:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
};

module.exports = { updatePassword };
