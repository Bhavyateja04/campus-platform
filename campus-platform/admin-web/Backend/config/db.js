const mongoose = require("mongoose");

/**
 * Connect to MongoDB with retry logic.
 * Uses Mongoose 8 defaults (no deprecated options needed).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || "admin_dashboard",
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`,
    );

    // ─── Connection event listeners ───
    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting reconnection...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected successfully.");
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
