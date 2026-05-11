const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI defined in environment variables.
 * Call this function once at app startup (e.g., in server.js / app.js).
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,      // Use the new URL string parser
      useUnifiedTopology: true,   // Use the new Server Discovery and Monitoring engine
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure code if connection fails
  }
};

module.exports = connectDB;
