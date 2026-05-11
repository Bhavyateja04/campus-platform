const express = require("express");
const router = express.Router();

const {
  createPlacementItem,
  updateItem,
  viewItems,
  deleteItem,
} = require("../controllers/PlacementController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// @route   POST    /api/placements
router.post("/", protect, createPlacementItem);

// @route   GET     /api/placements
router.get("/", protect, viewItems);

// @route   PATCH   /api/placements/:id
router.patch("/:id", protect, updateItem);

// @route   DELETE  /api/placements/:id  (admin only)
router.delete("/:id", protect, adminOnly, deleteItem);

module.exports = router;
