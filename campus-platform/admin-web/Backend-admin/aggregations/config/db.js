```js id="wnjlwm"
// ======================================================
// IMPORTS
// ======================================================

const mongoose = require("mongoose");


// ======================================================
// DATABASE CONNECTION
// ======================================================

/**
 * Establish MongoDB connection
 * Includes:
 * - automatic connection logging
 * - error handling
 * - reconnection listeners
 */
const connectDB = async () => {
  try {
    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    const connection = await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      `✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`
    );

    // ==========================================
    // CONNECTION EVENT LISTENERS
    // ==========================================

    mongoose.connection.on("error", (error) => {
      console.error(
        `❌ MongoDB Error: ${error.message}`
      );
    });

    mongoose.connection.on(
      "disconnected",
      () => {
        console.warn(
          "⚠️ MongoDB disconnected. Attempting reconnection..."
        );
      }
    );

    mongoose.connection.on(
      "reconnected",
      () => {
        console.log(
          "✅ MongoDB reconnected successfully."
        );
      }
    );

    mongoose.connection.on("connected", () => {
      console.log(
        "✅ MongoDB connection established."
      );
    });

  } catch (error) {

    // ==========================================
    // CONNECTION FAILURE
    // ==========================================

    console.error(
      `❌ MongoDB Connection Failed: ${error.message}`
    );

    process.exit(1);
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = connectDB;
```
