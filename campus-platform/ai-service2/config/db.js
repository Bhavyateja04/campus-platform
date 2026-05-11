const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connect to MongoDB with retry logic and event logging.
 */
const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(config.mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB Error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB Disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB Reconnected');
      });

      return conn;
    } catch (error) {
      retries++;
      console.error(
        `❌ MongoDB Connection Failed (Attempt ${retries}/${MAX_RETRIES}): ${error.message}`
      );

      if (retries >= MAX_RETRIES) {
        console.error('💀 Max retries reached. Exiting...');
        process.exit(1);
      }

      // Exponential backoff
      const delay = Math.min(1000 * 2 ** retries, 30000);
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
