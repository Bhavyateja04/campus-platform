const express = require("express");
const router  = express.Router();

const protect   = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createPlacementItem,
  updateItem,
  viewItems,
  deleteItem,
} = require("../controllers/PlacementController");

// ─── Routes ───────────────────────────────────────────────────────────────────

// User routes
router.post ("/",    protect,             createPlacementItem);
router.get  ("/",    protect,             viewItems);
router.patch("/:id", protect,             updateItem);

// Admin routes
router.delete("/:id", protect, adminOnly, deleteItem);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
