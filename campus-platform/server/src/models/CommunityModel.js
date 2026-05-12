const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION = {
  MESSAGES: {
    TITLE_REQUIRED:  "Title is required",
    AUTHOR_REQUIRED: "Author is required",
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const CommunitySchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.TITLE_REQUIRED],
      trim:     true,
    },
    content: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
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

module.exports = mongoose.model("Community", CommunitySchema);
