const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
      uppercase: true, // Ensures consistent formatting e.g. "21CS001"
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /@(acet|aec|aus)\.ac\.in$/,
        "Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["student", "admin"],
        message: "Role must be either: student or admin",
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
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    profileImage: {
      type: String,
      trim: true,
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);
