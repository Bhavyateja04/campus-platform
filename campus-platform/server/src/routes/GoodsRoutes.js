const express = require("express");
const router  = express.Router();

const {
  createGoodsItem,
  updateItem,
  viewItems,
  deleteItem,
  markAsSold,
} = require("../controllers/GoodsController");

const protect = require("../middleware/authMiddleware");

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post  ("/",          protect, createGoodsItem);
router.get   ("/",          protect, viewItems);
router.put   ("/:id",       protect, updateItem);
router.delete("/:id",       protect, deleteItem);
router.patch ("/:id/sold",  protect, markAsSold);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
