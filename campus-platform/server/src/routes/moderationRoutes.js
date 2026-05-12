const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  moderateText,
  moderateMemory,
} = require("../controllers/moderationController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/text", moderateText);
router.post("/memory", upload.single("image"), moderateMemory);

module.exports = router;
