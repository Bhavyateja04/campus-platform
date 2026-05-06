const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

// routes
const userRoutes = require("./src/routes/UserRoutes");

app.use("/api/users", userRoutes);


//adminRoutes
const adminRoutes = require("./src/routes/adminRoutes");

app.use("/api/admin", adminRoutes);




//collegeMemoriesRoutes
const collegeMemoriesRoutes = require("./src/routes/collegeMemoriesRoutes");

app.use("/api/college-memories", collegeMemoriesRoutes);

//clubsRoutes
const clubsRoutes = require("./src/routes/clubsRoutes");
app.use("/api/clubs", clubsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});