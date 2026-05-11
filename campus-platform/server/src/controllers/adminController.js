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
