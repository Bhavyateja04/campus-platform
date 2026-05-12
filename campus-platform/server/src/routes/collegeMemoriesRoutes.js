const express = require("express");
const router  = express.Router();

const {
  addMemory,
  getMemories,
  editMemory,
  deleteMemory,
} = require("../controllers/collegeMemoriesController");

const protect = require("../middleware/authMiddleware");

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get   ("/all-memories",              getMemories);
router.post  ("/add-memory",                protect, addMemory);
router.put   ("/edit-memory/:memoryId",     protect, editMemory);
router.delete("/delete-memory/:memoryId",   protect, deleteMemory);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
