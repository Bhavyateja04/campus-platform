const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES    = ["Academic", "Events", "Clubs", "System"];
const NOTIFICATION_AUDIENCES = ["all", "user"];

const NOTIFICATION_DEFAULTS = {
  TYPE:     "System",
  ICON:     "notifications-outline",
  COLOR:    "#4A6FA5",
  AUDIENCE: "all",
};

const VALIDATION = {
  MESSAGES: {
    TITLE_REQUIRED:    "Title is required",
    BODY_REQUIRED:     "Body is required",
    TYPE_INVALID:      `Type must be one of: ${NOTIFICATION_TYPES.join(", ")}`,
    AUDIENCE_INVALID:  `Audience must be one of: ${NOTIFICATION_AUDIENCES.join(", ")}`,
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
    body: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.BODY_REQUIRED],
      trim:     true,
    },
    type: {
      type:    String,
      enum:    {
        values:  NOTIFICATION_TYPES,
        message: VALIDATION.MESSAGES.TYPE_INVALID,
      },
      default: NOTIFICATION_DEFAULTS.TYPE,
    },
    icon: {
      type:    String,
      trim:    true,
      default: NOTIFICATION_DEFAULTS.ICON,
    },
    color: {
      type:    String,
      trim:    true,
      default: NOTIFICATION_DEFAULTS.COLOR,
    },
    audience: {
      type:    String,
      enum:    {
        values:  NOTIFICATION_AUDIENCES,
        message: VALIDATION.MESSAGES.AUDIENCE_INVALID,
      },
      default: NOTIFICATION_DEFAULTS.AUDIENCE,
    },
    audienceUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    readBy: {
      type:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

NotificationSchema.index({ audience: 1, audienceUserId: 1, createdAt: -1 });

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = mongoose.model("Notification", NotificationSchema);
