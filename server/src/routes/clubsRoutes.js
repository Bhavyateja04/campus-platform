const express = require("express");
const router = express.Router();

const { addClub, getClubs, getClubById, updateClub, deleteClub } = require("../controllers/clubsController");

router.post("/add-club", addClub);
router.get("/all-clubs", getClubs);
router.get("/club/:clubId", getClubById);
router.put("/edit-club/:clubId", updateClub);
router.delete("/delete-club/:clubId", deleteClub);

module.exports = router;