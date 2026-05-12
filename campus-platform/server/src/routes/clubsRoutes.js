const express = require("express");
const router  = express.Router();

const {
  addClub,
  getClubs,
  getClubById,
  updateClub,
  deleteClub,
} = require("../controllers/clubsController");

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post  ("/",        addClub);
router.get   ("/",        getClubs);
router.get   ("/:clubId", getClubById);
router.patch ("/:clubId", updateClub);
router.delete("/:clubId", deleteClub);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
