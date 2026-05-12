const express = require("express");

const router = express.Router();

const OutcomerExam = require("../models/OutcomerExam");



// SEARCH ROUTE
router.get("/exam-search", async (req, res) => {

   try {

      const { rollNo, buildingName } = req.query;

      let searchQuery = {};



      // 🔥 STRICT ROLL MATCH ONLY
      if (rollNo) {

         searchQuery.rollNo = {
            $regex: `^${rollNo}$`,
            $options: "i",
         };

      }



      // BUILDING SEARCH (can stay partial)
      if (buildingName) {

         searchQuery.buildingName = {
            $regex: buildingName,
            $options: "i",
         };

      }



      const students = await OutcomerExam.find(searchQuery);

      res.status(200).json(students);

   } catch (error) {

      console.log(error);

      res.status(500).json({
         message: "Server Error",
      });

   }
});


module.exports = router;