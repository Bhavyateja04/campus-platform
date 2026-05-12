const mongoose = require("mongoose");

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

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
    },
    openingTime: {
      type: String,
      trim: true,
    },
    closingTime: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    menu: {
      type: [MenuItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("Canteen", CanteenSchema);
