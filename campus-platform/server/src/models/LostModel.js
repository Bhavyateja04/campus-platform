const mongoose = require("mongoose");

const LostItemSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    dateLost: {
      type: Date,
    },
    contactNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"],
    },
    status: {
      type: String,
      enum: {
        values: ["lost", "found", "resolved"],
        message: "Status must be one of: lost, found, resolved",
      },
      default: "lost",
    },

    // User who reported the lost item
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Posted by user is required"],
    },

    // Filled when someone finds the item (status → "found")
    foundBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rollNumber: {
        type: String,
        trim: true,
      },
      contactNumber: {
        type: String,
        trim: true,
        match: [/^\d{10}$/, "Finder contact number must be exactly 10 digits"],
      },
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("LostItem", LostItemSchema);
