const express = require("express");
const router = express.Router();

const {
  addCanteen,
  getCanteens,
  getCanteenById,
  updateCanteen,
  deleteCanteen,
} = require("../controllers/canteensController");

// @route   POST    /api/canteens
router.post("/", addCanteen);

// @route   GET     /api/canteens
router.get("/", getCanteens);

// @route   GET     /api/canteens/:canteenId
router.get("/:canteenId", getCanteenById);

// @route   PATCH   /api/canteens/:canteenId
router.patch("/:canteenId", updateCanteen);

// @route   DELETE  /api/canteens/:canteenId
router.delete("/:canteenId", deleteCanteen);

module.exports = router;
