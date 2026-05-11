<<<<<<< HEAD:campus-platform/server/src/controllers/adminController.js
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { emitRealtime } = require("../realtime");
// CREATE USER
const createUser = async (req, res) => {
  try {
    //only college mail is being allowed
    const { email } = req.body;
    const allowedDomains = /@(acet|aec|aus)\.ac\.in$/;
    if (!allowedDomains.test(email)) {
      return res.status(400).json({
        message:
          "Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains",
      });
    }
    const { password } = req.body;
    const hashePassword = await bcrypt.hash(password, 10);
    req.body.password = hashePassword;
    const user = await User.create(req.body);
    const safeUser = user.toObject();
    delete safeUser.password;
    emitRealtime("admin:users-changed", {
      action: "created",
      user: safeUser,
    });
    res.status(201).json({
      message: "User created successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating user",
    });
  }
};

// GET ALL USERS
const getUsers = async (req, res) => {
  const users = await User.find().select("-password");

  res.json({
    message: "Users retrieved successfully",
    data: users,
  });
};

// DELETE USER
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  emitRealtime("admin:users-changed", {
    action: "deleted",
    userId: req.params.id,
  });

  res.json({
    message: "User deleted successfully",
  });
};

// UPDATE USER
const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  const safeUser = user ? user.toObject() : null;
  if (safeUser) {
    delete safeUser.password;
  }

  emitRealtime("admin:users-changed", {
    action: "updated",
    user: safeUser,
  });

  res.json({
    message: "User updated successfully",
    data: safeUser,
  });
};
// view all lost items
const getAllLostItems = async (req, res) => {
  const items = await LostItem.find();
  res.json(items);
};

// view all goods
const getAllGoods = async (req, res) => {
  const items = await Goods.find();
  res.json(items);
};

module.exports = {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
};
=======
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
>>>>>>> 42497444c3dfa972ccb0e3bbcafe0428cec6335a:server/src/controllers/adminController.js
