const mongoose = require("mongoose");

const MarketplaceSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      trim: true,
      enum: {
        values: ["new", "like new", "good", "fair", "poor"],
        message: "Condition must be one of: new, like new, good, fair, poor",
      },
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    contactNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"],
    },
    status: {
      type: String,
      enum: {
        values: ["available", "sold"],
        message: "Status must be either: available or sold",
      },
      default: "available",
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("MarketplaceItem", MarketplaceSchema);
