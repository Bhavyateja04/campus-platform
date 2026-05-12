const express = require("express");
const router = express.Router();

router.get("/clubs", async (req, res) => {
  res.json({
    message: "Future AI club recommendation endpoint",
  });
});

module.exports = router;