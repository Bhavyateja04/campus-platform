const mongoose = require("mongoose");

const canteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Canteen name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    menu: [
      {
        itemName: String,
        price: Number,
        image: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ───
canteenSchema.index({ isActive: 1 });

module.exports = mongoose.model("Canteen", canteenSchema);
