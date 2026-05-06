const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
dotenv.config();

const app = express();

connectDB();

app.use(express.json());

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

app.use("/api/goods",goodsRoutes);



//collegeMemoriesRoutes
const collegeMemoriesRoutes = require("./src/routes/collegeMemoriesRoutes");

app.use("/api/college-memories", collegeMemoriesRoutes);

//clubsRoutes
const clubsRoutes = require("./src/routes/clubsRoutes");
app.use("/api/clubs", clubsRoutes);

const PORT = process.env.PORT || 5000;
//placement routes
const placementRoutes = require("./src/routes/placementRoutes");

app.use("/api/placements", placementRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});