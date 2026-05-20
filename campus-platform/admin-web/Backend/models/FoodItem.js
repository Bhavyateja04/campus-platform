const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food item name is required"],
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      default: "Snacks",
    },
    available: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
      trim: true,
      default: "Fresh",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    canteenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

foodItemSchema.index({ category: 1 });
foodItemSchema.index({ available: 1 });
foodItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model("FoodItem", foodItemSchema);
