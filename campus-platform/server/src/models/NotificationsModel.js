const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Posted by user is required"],
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
