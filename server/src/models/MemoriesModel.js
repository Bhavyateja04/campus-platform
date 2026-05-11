const mongoose = require("mongoose");

const MemoriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: [0, "Report count cannot be negative"],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("Memory", MemoriesSchema);
