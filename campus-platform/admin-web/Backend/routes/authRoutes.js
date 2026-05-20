const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || "",
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "")
      .toLowerCase()
      .trim();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Contact admin.",
      });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/dev-token", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Dev token generation is disabled in production.",
      });
    }

    const email = String(
      req.body?.email || process.env.DEV_ADMIN_EMAIL || "admin@campus.local",
    ).toLowerCase();
    const name = req.body?.name || process.env.DEV_ADMIN_NAME || "Campus Admin";

    let adminUser = await User.findOne({ email });
    if (!adminUser) {
      adminUser = await User.create({
        name,
        email,
        role: "admin",
        isBlocked: false,
        avatar: process.env.DEV_ADMIN_AVATAR || "",
      });
    } else if (adminUser.role !== "admin") {
      adminUser.role = "admin";
      adminUser.isBlocked = false;
      await adminUser.save();
    }

    const token = signToken(adminUser);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          ...sanitizeUser(adminUser),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
