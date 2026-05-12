/**
 * Seeds a single test user so the Login flow can be exercised end-to-end.
 *
 * Run from the server/ directory:
 *   node scripts/seedTestUser.js
 *
 * Override defaults via environment variables:
 *   SEED_EMAIL=test@aus.ac.in SEED_PASSWORD='SomeStrongPassword!23' node scripts/seedTestUser.js
 *
 * Notes:
 *   - Uses MONGO_URI from server/.env.
 *   - The User schema enforces an @acet.ac.in / @aec.ac.in / @aus.ac.in email domain,
 *     so the default seed email is test@aus.ac.in.
 *   - If a user with the same email already exists, the password is reset to the seed value.
 */

const path   = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");
const User     = require("../src/models/UserModel");

// ─── Constants ────────────────────────────────────────────────────────────────

const BCRYPT_SALT_ROUNDS = 10;

const SEED_CONFIG = {
  email:    process.env.SEED_EMAIL    || "test@aus.ac.in",
  password: process.env.SEED_PASSWORD || "TestPass!23",
  roll:     process.env.SEED_ROLL     || "TEST-0001",
  name:     process.env.SEED_NAME     || "Test Student",
  role:     process.env.SEED_ROLE     || "student", // "student" | "admin"
};

const MESSAGES = {
  MONGO_URI_MISSING: "MONGO_URI missing in server/.env",
  CONNECTED:         "Connected to MongoDB.",
  SEED_FAILED:       "Seed failed:",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const disconnectSafely = async () => {
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors during error recovery
  }
};

const printLoginCredentials = () => {
  console.log("");
  console.log("Login with:");
  console.log(`  email:    ${SEED_CONFIG.email}`);
  console.log(`  password: ${SEED_CONFIG.password}`);
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

const updateExistingUser = async (user, hashedPassword) => {
  user.password   = hashedPassword;
  user.role       = SEED_CONFIG.role;
  user.firstLogin = true;
  await user.save();
  console.log(`Updated existing user (id=${user._id}).`);
};

const createNewUser = async (hashedPassword) => {
  const created = await User.create({
    rollNumber: SEED_CONFIG.roll,
    name:       SEED_CONFIG.name,
    email:      SEED_CONFIG.email,
    password:   hashedPassword,
    role:       SEED_CONFIG.role,
  });
  console.log(`Created user (id=${created._id}).`);
};

const seedTestUser = async () => {
  if (!process.env.MONGO_URI) {
    console.error(MESSAGES.MONGO_URI_MISSING);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(MESSAGES.CONNECTED);

  const hashedPassword = await bcrypt.hash(SEED_CONFIG.password, BCRYPT_SALT_ROUNDS);
  const existingUser   = await User.findOne({ email: SEED_CONFIG.email });

  if (existingUser) {
    await updateExistingUser(existingUser, hashedPassword);
  } else {
    await createNewUser(hashedPassword);
  }

  printLoginCredentials();
  await mongoose.disconnect();
};

// ─── Run ──────────────────────────────────────────────────────────────────────

seedTestUser().catch(async (err) => {
  console.error(MESSAGES.SEED_FAILED, err);
  await disconnectSafely();
  process.exit(1);
});
