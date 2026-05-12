const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');
const cleanupJob = require('./jobs/cleanupJob');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

/**
 * Kill any existing process on the target port (prevents EADDRINUSE crash).
 */
const killPort = (port) => {
  try {
    execSync(`fuser -k ${port}/tcp 2>/dev/null`, { stdio: 'ignore' });
    // Small delay to let the OS release the port
    execSync('sleep 0.5', { stdio: 'ignore' });
    console.log(`🔄 Cleared port ${port}`);
  } catch (e) {
    // No process was using the port — that's fine
  }
};

// Start server
const startServer = async () => {
  try {
    // Kill anything already on our port
    killPort(config.port);

    // Connect to MongoDB
    await connectDB();

    // Start cleanup job
    cleanupJob.start();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`\n🚀 Campus Image Analysis API`);
      console.log(`   Environment : ${config.nodeEnv}`);
      console.log(`   Port        : ${config.port}`);
      console.log(`   AI Vision   : ${config.openrouter.apiKey ? '✅ OpenRouter (' + config.openrouter.model + ')' : '⚠️  Not configured'}`);
      console.log(`   Cloudinary  : ${config.useCloudinary ? '✅ Enabled' : '📁 Local uploads'}`);
      console.log(`   API Base    : http://localhost:${config.port}/api\n`);
    });

    // Handle port-in-use error gracefully
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.port} is in use. Retrying...`);
        killPort(config.port);
        setTimeout(() => {
          server.listen(config.port);
        }, 1000);
      } else {
        console.error('❌ Server error:', err.message);
        process.exit(1);
      }
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      cleanupJob.stop();
      server.close(() => {
        console.log('💤 Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions (but NOT EADDRINUSE — we handle that above)
    process.on('uncaughtException', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.port} busy. Kill it with: fuser -k ${config.port}/tcp`);
        return; // Don't exit — nodemon will retry
      }
      console.error('❌ Uncaught Exception:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
