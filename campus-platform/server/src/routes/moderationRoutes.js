const express = require("express");
const multer  = require("multer");
const router  = express.Router();

const {
  moderateText,
  moderateMemory,
} = require("../controllers/moderationController");

// ─── Upload Middleware ────────────────────────────────────────────────────────

const uploadSingleImage = multer({ storage: multer.memoryStorage() }).single("image");

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post("/text",   moderateText);
router.post("/memory", uploadSingleImage, moderateMemory);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
