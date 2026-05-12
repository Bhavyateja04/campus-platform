const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION = {
  MESSAGES: {
    TITLE_REQUIRED:          "Title is required",
    DESCRIPTION_REQUIRED:    "Description is required",
    AUTHOR_REQUIRED:         "Author is required",
    REPORT_COUNT_NEGATIVE:   "Report count cannot be negative",
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const MemoriesSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.TITLE_REQUIRED],
      trim:     true,
    },
    description: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.DESCRIPTION_REQUIRED],
      trim:     true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    reportCount: {
      type:    Number,
      default: 0,
      min:     [0, VALIDATION.MESSAGES.REPORT_COUNT_NEGATIVE],
    },
    authorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, VALIDATION.MESSAGES.AUTHOR_REQUIRED],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("Memory", MemoriesSchema);
