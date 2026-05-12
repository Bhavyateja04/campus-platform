/**
 * Seeds sample notifications so AlertsScreen has live content.
 *
 * Idempotent: clears any previously seeded entries (matched by title)
 * before inserting, so re-running is always safe.
 *
 * Run from the server/ directory:
 *   node scripts/seedNotifications.js
 */

const path   = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose     = require("mongoose");
const Notification = require("../src/models/NotificationModel");

// ─── Constants ────────────────────────────────────────────────────────────────

const MESSAGES = {
  MONGO_URI_MISSING: "MONGO_URI missing in server/.env",
  CONNECTED:         "Connected to MongoDB.",
  SEED_FAILED:       "Seed failed:",
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_NOTIFICATIONS = [
  {
    title: "Mid Semester Exams",
    body:  "Mid semester exams scheduled from Nov 18–24. Hall tickets available in Exam Locator.",
    type:  "Academic",
    icon:  "book-outline",
    color: "#4A6FA5",
  },
  {
    title: "Hackathon 2026 — Registration Open",
    body:  "Register before Nov 15 for the Annual University Hackathon. Prizes worth ₹2 Lakh.",
    type:  "Events",
    icon:  "trophy-outline",
    color: "#E07B3A",
  },
  {
    title: "Coding Club — Weekly Meet",
    body:  "This Saturday at 10AM in Lab 3. Topic: Competitive Programming with C++.",
    type:  "Clubs",
    icon:  "people-outline",
    color: "#6A1B9A",
  },
  {
    title: "Library Hours Extended",
    body:  "Library will remain open till 10 PM during exam season (Nov 14–24).",
    type:  "Academic",
    icon:  "library-outline",
    color: "#4A6FA5",
  },
  {
    title: "Campix v1.1.0 Available",
    body:  "New version 1.1.0 ships with Campus Memories and an improved Lost & Found.",
    type:  "System",
    icon:  "settings-outline",
    color: "#00796B",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getSeedTitles = () => SEED_NOTIFICATIONS.map((n) => n.title);

const toNotificationDocument = (seed) => ({
  ...seed,
  audience: "all",
  readBy:   [],
});

const disconnectSafely = async () => {
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors during error recovery
  }
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seedNotifications = async () => {
  if (!process.env.MONGO_URI) {
    console.error(MESSAGES.MONGO_URI_MISSING);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(MESSAGES.CONNECTED);

  const removed = await Notification.deleteMany({
    title:    { $in: getSeedTitles() },
    audience: "all",
  });
  console.log(`Removed ${removed.deletedCount} existing seed notifications.`);

  const created = await Notification.insertMany(
    SEED_NOTIFICATIONS.map(toNotificationDocument),
  );
  console.log(`Inserted ${created.length} notifications.`);

  await mongoose.disconnect();
};

// ─── Run ──────────────────────────────────────────────────────────────────────

seedNotifications().catch(async (err) => {
  console.error(MESSAGES.SEED_FAILED, err);
  await disconnectSafely();
  process.exit(1);
});
