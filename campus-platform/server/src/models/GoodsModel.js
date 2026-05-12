const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_CONDITIONS = ["new", "like new", "good", "fair", "poor"];
const ITEM_STATUSES   = ["available", "sold"];

const VALIDATION = {
  MOBILE_REGEX: /^\d{10}$/,
  MESSAGES: {
    ITEM_NAME_REQUIRED:     "Item name is required",
    PRICE_REQUIRED:         "Price is required",
    PRICE_NEGATIVE:         "Price cannot be negative",
    SELLER_REQUIRED:        "Seller is required",
    CONTACT_INVALID:        "Contact number must be exactly 10 digits",
    CONDITION_INVALID:      `Condition must be one of: ${ITEM_CONDITIONS.join(", ")}`,
    STATUS_INVALID:         `Status must be either: ${ITEM_STATUSES.join(" or ")}`,
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const MarketplaceSchema = new mongoose.Schema(
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
    price: {
      type:     Number,
      required: [true, VALIDATION.MESSAGES.PRICE_REQUIRED],
      min:      [0, VALIDATION.MESSAGES.PRICE_NEGATIVE],
    },
    category: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      trim: true,
      enum: {
        values:  ITEM_CONDITIONS,
        message: VALIDATION.MESSAGES.CONDITION_INVALID,
      },
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    sellerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, VALIDATION.MESSAGES.SELLER_REQUIRED],
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
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("MarketplaceItem", MarketplaceSchema);
