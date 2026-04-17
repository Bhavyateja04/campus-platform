const express = require("express");
const router = express.Router();
const { createGoodsItem, updateItem, viewItems, deleteItem } = require("../controllers/GoodsController");
const protect = require("../middleware/authMiddleware");
router.post("/createitem", protect, createGoodsItem);
router.get  ("/viewitems", protect, viewItems);
router.put ("/updateitem/:id", protect, updateItem);
router.delete("/deleteitem/:id", protect, deleteItem);

module.exports = router;