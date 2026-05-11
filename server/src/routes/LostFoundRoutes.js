const express = require("express");
const router = express.Router();

const {
  createLostFoundItem,
  updateItem,
  viewItems,
  deleteItem,
} = require("../controllers/LostFoundController");
const protect = require("../middleware/authMiddleware");

// @route   POST    /api/lostfound
router.post("/", protect, createLostFoundItem);

// @route   GET     /api/lostfound
router.get("/", protect, viewItems);

// @route   PUT     /api/lostfound/:id
router.put("/:id", protect, updateItem);

// @route   DELETE  /api/lostfound/:id
router.delete("/:id", protect, deleteItem);

module.exports = router;
