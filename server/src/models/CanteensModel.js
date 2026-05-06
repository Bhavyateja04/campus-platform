const mongoose = require("mongoose");

const CanteenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  location: {
    type: String
  },

  contactNumber: {
    type: String
  },

  openingTime: {
    type: String
  },

  closingTime: {
    type: String
  },

  foodItems: [
    {
      type: String
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Canteen", CanteenSchema);