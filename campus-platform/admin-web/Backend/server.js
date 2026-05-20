require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminCrudRoutes = require("./routes/adminCrudRoutes");
const { globalErrorHandler } = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");
const User = require("./models/User");
const LostFound = require("./models/LostFound");
const Marketplace = require("./models/Marketplace");
const Canteen = require("./models/Canteen");
const FoodItem = require("./models/FoodItem");
const Notification = require("./models/Notification");
const Memory = require("./models/Memory");
const Club = require("./models/Club");
const PlacementExperience = require("./models/PlacementExperience");
const ExamHall = require("./models/ExamHall");
const ExamSchedule = require("./models/ExamSchedule");
const initialData = require("./seed/initialData");

// ─── Initialize Express ───
const app = express();

// ─── Security Middleware ───
app.use(helmet());

// Restrictive CORS: allow only the frontend origin in development
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser requests like curl or server-side requests
      if (!origin) return callback(null, true);
      if (FRONTEND_ORIGIN === "*" || origin === FRONTEND_ORIGIN) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: This origin is not allowed."));
    },
    credentials: true,
  }),
);
app.options("*", cors({ origin: FRONTEND_ORIGIN, credentials: true }));

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

// ─── Body Parsing ───
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check ───
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin Dashboard API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin", adminCrudRoutes);

// ─── Handle undefined routes ───
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ─── Global Error Handler ───
app.use(globalErrorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedInitialData();
  const server = app.listen(PORT, () => {
    console.log(
      `\n🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
    );
    console.log(
      `📊 Dashboard API: http://localhost:${PORT}/api/admin/dashboard\n`,
    );
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${PORT} is already in use. Stop the other backend instance or change PORT in Backend/.env.`,
      );
      process.exit(1);
    }

    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
};

async function seedCollection(Model, records) {
  const count = await Model.countDocuments();
  if (count === 0 && records.length) {
    try {
      // insertMany with ordered:false so one duplicate doesn't abort the whole batch
      await Model.insertMany(records, { ordered: false });
    } catch (err) {
      // Ignore duplicate-key errors during seeding, log others
      if (err && err.code === 11000) {
        console.warn(
          "Warning: duplicate key encountered while seeding",
          err.message,
        );
      } else {
        console.error("Error while seeding collection", err);
        throw err;
      }
    }
  }
}

async function seedInitialData() {
  await Promise.all([
    seedCollection(User, initialData.users),
    seedCollection(LostFound, initialData.lostFound),
    seedCollection(Marketplace, initialData.marketplace),
    seedCollection(Canteen, initialData.canteens),
    seedCollection(FoodItem, initialData.foodItems),
    seedCollection(Notification, initialData.notifications),
    seedCollection(Memory, initialData.memories),
    seedCollection(Club, initialData.clubs),
    seedCollection(PlacementExperience, initialData.placements),
    seedCollection(ExamHall, initialData.examHalls),
  ]);

  const hall = await ExamHall.findOne().lean();
  await seedCollection(
    ExamSchedule,
    initialData.exams.map((exam) => ({
      name: exam.name,
      code: exam.code,
      date: exam.date,
      time: exam.time,
      hallId: hall?._id,
      studentsCount: exam.studentsCount,
      duration: exam.duration,
      status: exam.status,
    })),
  );
}

startServer();

module.exports = app;
