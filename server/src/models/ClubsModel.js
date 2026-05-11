const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coordinatorName: {
      type: String,
      required: [true, "Coordinator name is required"],
      trim: true,
    },
    coordinatorEmail: {
      type: String,
      required: [true, "Coordinator email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("Club", ClubSchema);
