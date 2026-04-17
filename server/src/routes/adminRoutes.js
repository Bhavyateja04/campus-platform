const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  deleteUser,
  updateUser
} = require("../controllers/adminController");
const protect = require("../middleware/adminMiddleware");
 const adminOnly = require("../middleware/authMiddleware");

// CREATE USER
router.post("/createuser", protect, adminOnly, createUser);

// GET USERS
router.get("/viewusers",protect, adminOnly, getUsers);

// UPDATE USER
router.put("/users/:id", protect, adminOnly, updateUser);

// DELETE USER
router.delete("/deleteuser/:id", protect, adminOnly, deleteUser);


module.exports = router;