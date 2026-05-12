const express = require("express");
const router  = express.Router();

const {
  addCanteen,
  getCanteens,
  getCanteenById,
  updateCanteen,
  deleteCanteen,
} = require("../controllers/canteensController");

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post  ("/",            addCanteen);
router.get   ("/",            getCanteens);
router.get   ("/:canteenId",  getCanteenById);
router.patch ("/:canteenId",  updateCanteen);
router.delete("/:canteenId",  deleteCanteen);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = router;
