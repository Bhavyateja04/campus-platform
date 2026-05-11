const mongoose = require("mongoose");

const CanteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Canteen name is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"],
    },
    openingTime: {
      type: String,
      trim: true,
    },
    closingTime: {
      type: String,
      trim: true,
    },
    foodItems: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("Canteen", CanteenSchema);
