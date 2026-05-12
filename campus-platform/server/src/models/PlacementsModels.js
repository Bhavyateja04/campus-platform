const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION = {
  MESSAGES: {
    USER_REQUIRED:          "User is required",
    USERNAME_REQUIRED:      "Username is required",
    COMPANY_REQUIRED:       "Company name is required",
    POSITION_REQUIRED:      "Position is required",
    SALARY_NEGATIVE:        "Salary cannot be negative",
    LIKES_COUNT_NEGATIVE:   "Likes count cannot be negative",
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const PlacementSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, VALIDATION.MESSAGES.USER_REQUIRED],
    },
    username: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.USERNAME_REQUIRED],
      trim:     true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    company: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.COMPANY_REQUIRED],
      trim:     true,
    },
    position: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.POSITION_REQUIRED],
      trim:     true,
    },
    salary: {
      type: Number,
      min:  [0, VALIDATION.MESSAGES.SALARY_NEGATIVE],
    },
    description: {
      type: String,
      trim: true,
    },
    likesCount: {
      type:    Number,
      default: 0,
      min:     [0, VALIDATION.MESSAGES.LIKES_COUNT_NEGATIVE],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("Placement", PlacementSchema);
