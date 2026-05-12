const mongoose = require("mongoose");

const OutcomerModelSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },

   rollNo: {
      type: String,
      required: true,
   },

   buildingName: {
      type: String,
      required: true,
   },

   roomNo: {
      type: String,
      required: true,
   },
});

module.exports = mongoose.model(
   "OutcomerExam",
   OutcomerModelSchema
);