const express = require("express");
const router = express.Router();

const { updatePassword } = require("../controllers/UserController");
const protect = require("../middleware/authMiddleware");

// @route   PATCH   /api/users/password
router.patch("/password", protect, updatePassword);

module.exports = router;
