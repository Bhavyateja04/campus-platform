const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { adminAuth } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const LostFound = require("../models/LostFound");
const Marketplace = require("../models/Marketplace");
const Canteen = require("../models/Canteen");
const FoodItem = require("../models/FoodItem");
const Memory = require("../models/Memory");
const Club = require("../models/Club");
const PlacementExperience = require("../models/PlacementExperience");
const Notification = require("../models/Notification");
const ExamHall = require("../models/ExamHall");
const ExamSchedule = require("../models/ExamSchedule");

const router = express.Router();

const wrap = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toObjectId = (value) => (isObjectId(value) ? value : undefined);

const toObjectIdArray = (value) => {
  if (!value) return undefined;
  const list = Array.isArray(value) ? value : String(value).split(",");
  const ids = list.map((item) => item && String(item).trim()).filter(Boolean);
  const validIds = ids.filter(isObjectId);
  return validIds.length ? validIds : undefined;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return fallback;
};

const toNumber = (value, fallback = undefined) => {
  if (value === "" || value == null) return fallback;
  const number = Number(value);
  return Number.isNaN(number) ? fallback : number;
};

const sendList = (res, data) => res.json({ success: true, data });

function registerCrudRoutes(basePath, Model, mapBody) {
  const isUserRoute = basePath === "/users";

  router.get(
    basePath,
    adminAuth,
    wrap(async (_req, res) => {
      const items = await Model.find().sort({ createdAt: -1 }).lean();
      sendList(res, items);
    }),
  );

  router.post(
    basePath,
    adminAuth,
    wrap(async (req, res) => {
      const payload = mapBody(req.body || {});

      if (isUserRoute) {
        const normalizedEmail = String(payload.email || "")
          .toLowerCase()
          .trim();

        if (!normalizedEmail) {
          return res.status(400).json({
            success: false,
            message: "Email is required.",
          });
        }

        const existingUser = await Model.findOne({
          email: normalizedEmail,
        }).lean();

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "A user with this email already exists.",
          });
        }

        const rawPassword =
          String(payload.password || "").trim() ||
          crypto.randomBytes(5).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 12);

        const created = await Model.create({
          ...payload,
          email: normalizedEmail,
          password: hashedPassword,
        });

        try {
          await sendEmail({
            to: created.email,
            subject: "Welcome to Campus Platform",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
                <h2 style="margin-bottom: 16px;">Welcome to Campus Platform</h2>
                <p>Hello ${created.name || "there"},</p>
                <p>Your Campus Platform account is ready.</p>
                <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin: 24px 0;">
                  <p style="margin: 0 0 8px;"><strong>Email:</strong> ${created.email}</p>
                  <p style="margin: 0;"><strong>Temporary Password:</strong> ${rawPassword}</p>
                </div>
                <p>Please sign in and change your password after logging in for the first time.</p>
              </div>
            `,
            text: [
              "Welcome to Campus Platform",
              `Email: ${created.email}`,
              `Temporary Password: ${rawPassword}`,
              "Please sign in and change your password after logging in for the first time.",
            ].join("\n\n"),
          });
        } catch (error) {
          console.error(
            "Failed to send welcome email:",
            error.message || error,
          );
        }

        const safeCreated = await Model.findById(created._id).lean();
        return res.status(201).json({ success: true, data: safeCreated });
      }

      const created = await Model.create(payload);
      res.status(201).json({ success: true, data: created });
    }),
  );

  router.put(
    `${basePath}/:id`,
    adminAuth,
    wrap(async (req, res) => {
      const payload = mapBody(req.body || {});
      const updated = await Model.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Record not found" });
      }
      res.json({ success: true, data: updated });
    }),
  );

  router.delete(
    `${basePath}/:id`,
    adminAuth,
    wrap(async (req, res) => {
      const deleted = await Model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Record not found" });
      }
      res.json({ success: true, data: deleted });
    }),
  );
}

registerCrudRoutes("/users", User, (body) => ({
  name: body.name,
  email: body.email,
  role: body.role || "user",
  isBlocked: toBoolean(body.isBlocked, false),
  avatar: body.avatar || "",
  password: body.password,
}));

registerCrudRoutes("/lost-found", LostFound, (body) => ({
  itemName: body.itemName || body.title,
  category: body.category || body.type || "General",
  status: body.status || "active",
  reportedBy: toObjectId(body.reportedBy || body.reportedById),
  description: body.description || body.details || "",
  location: body.location || "",
}));

registerCrudRoutes("/marketplace", Marketplace, (body) => ({
  productName: body.productName || body.name,
  price: toNumber(body.price, 0),
  seller: toObjectId(body.seller || body.sellerId),
  status: body.status || "active",
  description: body.description || "",
  images: Array.isArray(body.images)
    ? body.images
    : body.image
      ? [body.image]
      : [],
  category: body.category || "",
}));

registerCrudRoutes("/canteens", Canteen, (body) => ({
  name: body.name,
  location: body.location || "Campus",
  isActive: toBoolean(body.isActive, true),
  menu: Array.isArray(body.menu)
    ? body.menu
    : body.menu
      ? JSON.parse(body.menu)
      : [],
}));

registerCrudRoutes("/food-items", FoodItem, (body) => ({
  name: body.name,
  price: toNumber(body.price, 0),
  category: body.category || "Snacks",
  available: toBoolean(body.available, true),
  badge: body.badge || "Fresh",
  image: body.image || "",
  canteenId: toObjectId(body.canteenId || body.canteen),
}));

registerCrudRoutes("/memories", Memory, (body) => ({
  title: body.title || body.caption,
  images: Array.isArray(body.images)
    ? body.images
    : body.image
      ? [body.image]
      : [],
  uploadedBy: toObjectId(body.uploadedBy || body.userId),
  isActive: toBoolean(body.isActive, true),
  description: body.description || body.complaint || "",
}));

registerCrudRoutes("/clubs", Club, (body) => ({
  clubName: body.clubName || body.name,
  members: toObjectIdArray(body.members || body.memberIds),
  isActive: toBoolean(body.isActive, true),
  description: body.description || body.event || "",
}));

registerCrudRoutes("/placements", PlacementExperience, (body) => ({
  companyName: body.companyName || body.company,
  role: body.role,
  createdBy: toObjectId(body.createdBy || body.createdById),
  description: body.description || body.desc || "",
  package: body.package || "",
  tips: body.tips || "",
}));

registerCrudRoutes("/notifications", Notification, (body) => ({
  title: body.title,
  body: body.body || body.message || "",
  priority: body.priority || body.type || "Medium",
  audience: body.audience || "All Students",
  unread: toBoolean(body.unread, true),
  sentBy: toObjectId(body.sentBy || body.sentById),
}));

registerCrudRoutes("/exam-halls", ExamHall, (body) => ({
  hallName: body.hallName || body.name,
  capacity: toNumber(body.capacity, 0),
  location: body.location || "Campus",
  availability: body.availability || "Available",
  floor: body.floor || "Ground",
  seatsPerRow: toNumber(body.seatsPerRow, 0),
  totalRows: toNumber(body.totalRows, 0),
  facilities: Array.isArray(body.facilities)
    ? body.facilities
    : body.facilities
      ? String(body.facilities)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  examsScheduled: toNumber(body.examsScheduled, 0),
}));

registerCrudRoutes("/exams", ExamSchedule, (body) => ({
  name: body.name || body.subject,
  code: body.code || body.examCode,
  date: body.date,
  time: body.time,
  hallId: toObjectId(body.hallId || body.hall || body.examHallId),
  studentsCount: toNumber(body.studentsCount, 0),
  duration: toNumber(body.duration, 120),
  proctors: toNumber(body.proctors, 0),
  status: body.status || "Scheduled",
}));

module.exports = router;
