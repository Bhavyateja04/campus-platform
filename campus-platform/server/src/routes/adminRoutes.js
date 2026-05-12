const express = require("express");
const router  = express.Router();

const {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
} = require("../controllers/adminController");

const protect   = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post  ("/createuser",       protect, adminOnly, createUser);
router.get   ("/viewusers",        protect, adminOnly, getUsers);
router.put   ("/users/:id",        protect, adminOnly, updateUser);
router.delete("/deleteuser/:id",   protect, adminOnly, deleteUser);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
