const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./src/config/db");
const { initRealtime } = require("./src/realtime");
dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const authRoutes = require("./src/routes/authRoutes");

app.use("/api/auth", authRoutes);

// routes
const userRoutes = require("./src/routes/UserRoutes");

app.use("/api/users", userRoutes);

//adminRoutes
const adminRoutes = require("./src/routes/adminRoutes");

app.use("/api/admin", adminRoutes);
//lost items routes
const lostRoutes = require("./src/routes/LostFoundRoutes");

app.use("/api/lostitems", lostRoutes);
//goods routes
const goodsRoutes = require("./src/routes/GoodsRoutes");

app.use("/api/goods", goodsRoutes);

//collegeMemoriesRoutes
const collegeMemoriesRoutes = require("./src/routes/collegeMemoriesRoutes");

app.use("/api/college-memories", collegeMemoriesRoutes);

//clubsRoutes
const clubsRoutes = require("./src/routes/clubsRoutes");
app.use("/api/clubs", clubsRoutes);

//placement routes
const placementRoutes = require("./src/routes/placementRoutes");
app.use("/api/placements", placementRoutes);

//canteens routes
const canteensRoutes = require("./src/routes/canteensRoute");
app.use("/api/canteens", canteensRoutes);

// notifications routes
const notificationsRoutes = require("./src/routes/notificationsRoutes");
app.use("/api/notifications", notificationsRoutes);

// content moderation proxy (delegates to ai-service when reachable)
const moderationRoutes = require("./src/routes/moderationRoutes");
app.use("/api/moderate", moderationRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "campus-platform-server" });
});

// 404 catch-all so the client always gets a JSON shape it can parse.
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
initRealtime(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
