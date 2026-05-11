const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

// Load environment variables first before anything else
dotenv.config();

const app = express();

// Database connection
connectDB();

// Body parser middleware
app.use(express.json());

// Routes
const authRoutes            = require("./src/routes/authRoutes");
const userRoutes            = require("./src/routes/UserRoutes");
const adminRoutes           = require("./src/routes/adminRoutes");
const lostRoutes            = require("./src/routes/LostFoundRoutes");
const goodsRoutes           = require("./src/routes/GoodsRoutes");
const collegeMemoriesRoutes = require("./src/routes/collegeMemoriesRoutes");
const clubsRoutes           = require("./src/routes/clubsRoutes");
const placementRoutes       = require("./src/routes/placementRoutes");

app.use("/api/auth",             authRoutes);
app.use("/api/users",            userRoutes);
app.use("/api/admin",            adminRoutes);
app.use("/api/lostitems",        lostRoutes);
app.use("/api/goods",            goodsRoutes);
app.use("/api/college-memories", collegeMemoriesRoutes);
app.use("/api/clubs",            clubsRoutes);
app.use("/api/placements",       placementRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
