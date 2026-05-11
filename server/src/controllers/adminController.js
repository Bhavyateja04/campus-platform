const User = require('../models/UserModel');
const bcrypt = require('bcrypt');

// ─── Allowed college email domains ───────────────────────────────────────────

const ALLOWED_DOMAINS = /@(acet|aec|aus)\.ac\.in$/;

// ─── Create a new user ────────────────────────────────────────────────────────

const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!ALLOWED_DOMAINS.test(email)) {
      return res.status(400).json({
        message: 'Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ ...req.body, password: hashedPassword });

    res.status(201).json({
      message: 'User created successfully',
      data: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// ─── Get all users ────────────────────────────────────────────────────────────

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// ─── Delete a user ────────────────────────────────────────────────────────────

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// ─── Update a user ────────────────────────────────────────────────────────────

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

module.exports = { createUser, getUsers, deleteUser, updateUser };
