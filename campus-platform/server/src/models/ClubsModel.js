const mongoose = require("mongoose");

// ─── Schema ───────────────────────────────────────────────────────────────────

const VALIDATION = {
  EMAIL_REGEX: /^\S+@\S+\.\S+$/,
  MOBILE_REGEX: /^\d{10}$/,
  MESSAGES: {
    CLUB_NAME_REQUIRED:        "Club name is required",
    DESCRIPTION_TRIM:          "Description cannot have leading/trailing spaces",
    COORDINATOR_NAME_REQUIRED: "Coordinator name is required",
    COORDINATOR_EMAIL_REQUIRED:"Coordinator email is required",
    COORDINATOR_EMAIL_INVALID: "Please provide a valid email address",
    MOBILE_REQUIRED:           "Mobile number is required",
    MOBILE_INVALID:            "Mobile number must be exactly 10 digits",
  },
};

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.CLUB_NAME_REQUIRED],
      trim:     true,
    },
    description: {
      type: String,
      trim: true,
    },
    coordinatorName: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.COORDINATOR_NAME_REQUIRED],
      trim:     true,
    },
    coordinatorEmail: {
      type:      String,
      required:  [true, VALIDATION.MESSAGES.COORDINATOR_EMAIL_REQUIRED],
      trim:      true,
      lowercase: true,
      match:     [VALIDATION.EMAIL_REGEX, VALIDATION.MESSAGES.COORDINATOR_EMAIL_INVALID],
    },
    mobileNumber: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.MOBILE_REQUIRED],
      trim:     true,
      match:    [VALIDATION.MOBILE_REGEX, VALIDATION.MESSAGES.MOBILE_INVALID],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("Club", ClubSchema);
