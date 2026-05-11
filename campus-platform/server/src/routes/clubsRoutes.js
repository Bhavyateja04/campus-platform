const express = require("express");
const router = express.Router();

const {
  addClub,
  getClubs,
  getClubById,
  updateClub,
  deleteClub,
} = require("../controllers/clubsController");

// @route   POST    /api/clubs
router.post("/", addClub);

// @route   GET     /api/clubs
router.get("/", getClubs);

// @route   GET     /api/clubs/:clubId
router.get("/:clubId", getClubById);

// @route   PATCH   /api/clubs/:clubId
router.patch("/:clubId", updateClub);

// @route   DELETE  /api/clubs/:clubId
router.delete("/:clubId", deleteClub);

module.exports = router;
