const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// @route   POST    /api/admin/users
router.post("/users", protect, adminOnly, createUser);

// @route   GET     /api/admin/users
router.get("/users", protect, adminOnly, getUsers);

// @route   PATCH   /api/admin/users/:id
router.patch("/users/:id", protect, adminOnly, updateUser);

// @route   DELETE  /api/admin/users/:id
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
