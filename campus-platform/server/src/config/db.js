const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const MESSAGES = {
  CONNECTED:  "MongoDB connected successfully",
  ERROR:      "MongoDB connection error:",
};

// ─── Database Connection ──────────────────────────────────────────────────────

/**
 * @desc    Establishes a connection to MongoDB using MONGO_URI from the environment.
 *          Exits the process with code 1 if the connection fails,
 *          since the application cannot run without a database.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(MESSAGES.CONNECTED);
  } catch (error) {
    console.error(MESSAGES.ERROR, error);
    process.exit(1);
  }
};

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = connectDB;
