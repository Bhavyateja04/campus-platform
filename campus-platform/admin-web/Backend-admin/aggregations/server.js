require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { globalErrorHandler } = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// ─── Initialize Express ───
const app = express();

// ─── Security Middleware ───
app.use(helmet());
app.use(cors());

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // limit each IP to 200 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// ─── Body Parsing ───
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───
app.use('/api/admin/dashboard', dashboardRoutes);

// ─── Handle undefined routes ───
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ─── Global Error Handler ───
app.use(globalErrorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/admin/dashboard\n`);
  });
};

startServer();

module.exports = app;
