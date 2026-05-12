const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION = {
  MESSAGES: {
    TITLE_REQUIRED:     "Title is required",
    MESSAGE_REQUIRED:   "Message is required",
    POSTED_BY_REQUIRED: "Posted by user is required",
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.TITLE_REQUIRED],
      trim:     true,
    },
    message: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.MESSAGE_REQUIRED],
      trim:     true,
    },
    postedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, VALIDATION.MESSAGES.POSTED_BY_REQUIRED],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("Notification", NotificationSchema);
