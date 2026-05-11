const mongoose = require("mongoose");

const CanteenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  location: {
    type: String,
  },

  contactNumber: {
    type: String,
  },

  openingTime: {
    type: String,
  },

  closingTime: {
    type: String,
  },

  image: {
    type: String,
  },

  menu: [
    {
      name: { type: String },
      title: { type: String },
      price: { type: Number },
      available: { type: Boolean, default: true },
      image: { type: String },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Canteen", CanteenSchema);
