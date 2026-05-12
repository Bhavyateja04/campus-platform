const express = require("express");
const router  = express.Router();

const {
  createLostFoundItem,
  updateItem,
  viewItems,
  deleteItem,
} = require("../controllers/LostFoundController");

const protect = require("../middleware/authMiddleware");

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post  ("/",    protect, createLostFoundItem);
router.get   ("/",    protect, viewItems);
router.put   ("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
