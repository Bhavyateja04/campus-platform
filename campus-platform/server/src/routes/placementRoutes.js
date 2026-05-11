const express = require("express");
const router = express.Router();
const { createPlacementItem, updateItem, viewItems, deleteItem } = require("../controllers/PlacementController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
router.post("/createitem", protect, createPlacementItem);
router.get  ("/viewitems", protect, viewItems);
router.put ("/updateitem/:id", protect,updateItem);
router.delete("/deleteitem/:id", protect, adminOnly, deleteItem);

module.exports = router;