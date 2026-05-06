const express = require("express");
const router = express.Router();

const { updatePassword } = require("../controllers/UserController");
const protect = require("../middleware/authMiddleware"); 

router.put("/update-password", protect, updatePassword);

module.exports = router;