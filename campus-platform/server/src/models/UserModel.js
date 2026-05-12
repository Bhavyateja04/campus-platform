const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_ROLES = ["student", "admin"];

const VALIDATION = {
  MOBILE_REGEX: /^\d{10}$/,
  EMAIL_REGEX:  /@(acet|aec|aus)\.ac\.in$/,
  PASSWORD_MIN_LENGTH: 6,
  MESSAGES: {
    ROLL_NUMBER_REQUIRED: "Roll number is required",
    NAME_REQUIRED:        "Name is required",
    EMAIL_REQUIRED:       "Email is required",
    EMAIL_INVALID:        "Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains",
    PASSWORD_REQUIRED:    "Password is required",
    PASSWORD_TOO_SHORT:   `Password must be at least ${6} characters`,
    PHONE_INVALID:        "Phone number must be exactly 10 digits",
    ROLE_INVALID:         `Role must be one of: ${USER_ROLES.join(", ")}`,
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    rollNumber: {
      type:      String,
      required:  [true, VALIDATION.MESSAGES.ROLL_NUMBER_REQUIRED],
      unique:    true,
      trim:      true,
      uppercase: true,
    },
    name: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.NAME_REQUIRED],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, VALIDATION.MESSAGES.EMAIL_REQUIRED],
      unique:    true,
      trim:      true,
      lowercase: true,
      match:     [VALIDATION.EMAIL_REGEX, VALIDATION.MESSAGES.EMAIL_INVALID],
    },
    password: {
      type:      String,
      required:  [true, VALIDATION.MESSAGES.PASSWORD_REQUIRED],
      minlength: [VALIDATION.PASSWORD_MIN_LENGTH, VALIDATION.MESSAGES.PASSWORD_TOO_SHORT],
    },
    role: {
      type:    String,
      enum:    {
        values:  USER_ROLES,
        message: VALIDATION.MESSAGES.ROLE_INVALID,
      },
      default: "student",
    },
    college: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type:  String,
      trim:  true,
      match: [VALIDATION.MOBILE_REGEX, VALIDATION.MESSAGES.PHONE_INVALID],
    },
    profileImage: {
      type: String,
      trim: true,
    },
    firstLogin: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("User", UserSchema);
