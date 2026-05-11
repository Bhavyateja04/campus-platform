const express = require("express");
const router = express.Router();

const { login, register, logout } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/login",    login);
router.post("/register", register);
router.post("/logout",   protect, logout);

module.exports = router;
