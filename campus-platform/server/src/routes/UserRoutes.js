const express = require("express");
const router = express.Router();

const { getMe, updateMe, updatePassword } = require("../controllers/UserController");
const protect = require("../middleware/authMiddleware");

router.get("/me",                protect, getMe);
router.put("/me",                protect, updateMe);
router.put("/update-password",   protect, updatePassword);

module.exports = router;
