const express = require("express");
const router = express.Router();

const {
  createLostFoundItem,
  updateItem,
  viewItems,
  deleteItem,
  markItemAsFound,
  markItemAsResolved,
} = require("../controllers/LostFoundController");
const protect = require("../middleware/authMiddleware");

// @route   POST    /api/lostfound
router.post("/", protect, createLostFoundItem);

// @route   GET     /api/lostfound
router.get("/", protect, viewItems);

// @route   PUT     /api/lostfound/:id
router.put("/:id", protect, updateItem);

// @route   PATCH   /api/lostfound/:id/found
router.patch("/:id/found", protect, markItemAsFound);

// @route   PATCH   /api/lostfound/:id/resolved
router.patch("/:id/resolved", protect, markItemAsResolved);

// @route   DELETE  /api/lostfound/:id
router.delete("/:id", protect, deleteItem);

module.exports = router;
