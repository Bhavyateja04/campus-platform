const express = require("express");
const router = express.Router();

const {
  createGoodsItem,
  updateItem,
  viewItems,
  deleteItem,
  markAsSold,
} = require("../controllers/GoodsController");
const protect = require("../middleware/authMiddleware");

// @route   POST    /api/goods
router.post("/", protect, createGoodsItem);

// @route   GET     /api/goods
router.get("/", protect, viewItems);

// @route   PUT     /api/goods/:id
router.put("/:id", protect, updateItem);

// @route   DELETE  /api/goods/:id
router.delete("/:id", protect, deleteItem);

// @route   PATCH   /api/goods/:id/sold
router.patch("/:id/sold", protect, markAsSold);

module.exports = router;
