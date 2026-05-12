const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_STATUSES = ["lost", "found", "resolved"];

const VALIDATION = {
  MOBILE_REGEX: /^\d{10}$/,
  MESSAGES: {
    ITEM_NAME_REQUIRED:     "Item name is required",
    POSTED_BY_REQUIRED:     "Posted by user is required",
    STATUS_INVALID:         `Status must be one of: ${ITEM_STATUSES.join(", ")}`,
    CONTACT_INVALID:        "Contact number must be exactly 10 digits",
    FINDER_CONTACT_INVALID: "Finder contact number must be exactly 10 digits",
  },
};

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

/**
 * Populated when someone finds the item (status → "found").
 */
const FoundBySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type:  String,
      trim:  true,
      match: [VALIDATION.MOBILE_REGEX, VALIDATION.MESSAGES.FINDER_CONTACT_INVALID],
    },
  },
  { _id: false },
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const LostItemSchema = new mongoose.Schema(
  {
    itemName: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.ITEM_NAME_REQUIRED],
      trim:     true,
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
      type:  String,
      trim:  true,
      match: [VALIDATION.MOBILE_REGEX, VALIDATION.MESSAGES.CONTACT_INVALID],
    },
    status: {
      type:    String,
      enum:    {
        values:  ITEM_STATUSES,
        message: VALIDATION.MESSAGES.STATUS_INVALID,
      },
      default: "lost",
    },
    postedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, VALIDATION.MESSAGES.POSTED_BY_REQUIRED],
    },
    foundBy: {
      type:    FoundBySchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("LostItem", LostItemSchema);
