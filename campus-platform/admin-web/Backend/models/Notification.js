const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    body: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    audience: {
      type: String,
      trim: true,
      default: "All Students",
    },
    unread: {
      type: Boolean,
      default: true,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ unread: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
