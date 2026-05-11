/**
 * Seed a single test user so the Login flow can be exercised end-to-end.
 *
 * Run from the `server/` directory:
 *   node scripts/seedTestUser.js
 *   # or, with env-driven credentials:
 *   SEED_EMAIL=test@aus.ac.in SEED_PASSWORD='SomeStrongPassword!23' node scripts/seedTestUser.js
 *
 * Notes:
 *  - Uses MONGO_URI from server/.env.
 *  - The User schema enforces an @acet.ac.in / @aec.ac.in / @aus.ac.in email domain,
 *    so the default seed email is test@aus.ac.in.
 *  - If a user with the same email already exists, the password is reset to the seed value.
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../src/models/UserModel");

const SEED_EMAIL = process.env.SEED_EMAIL || "test@aus.ac.in";
const SEED_PASSWORD = process.env.SEED_PASSWORD || "TestPass!23";
const SEED_ROLL = process.env.SEED_ROLL || "TEST-0001";
const SEED_NAME = process.env.SEED_NAME || "Test Student";
const SEED_ROLE = process.env.SEED_ROLE || "student"; // "student" | "admin"

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI missing in server/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const hashed = await bcrypt.hash(SEED_PASSWORD, 10);

  const existing = await User.findOne({ email: SEED_EMAIL });
  if (existing) {
    existing.password = hashed;
    existing.role = SEED_ROLE;
    existing.firstLogin = true;
    await existing.save();
    console.log(`Updated existing user (id=${existing._id}).`);
  } else {
    const created = await User.create({
      rollNumber: SEED_ROLL,
      name: SEED_NAME,
      email: SEED_EMAIL,
      password: hashed,
      role: SEED_ROLE,
    });
    console.log(`Created user (id=${created._id}).`);
  }

  console.log("");
  console.log("Login with:");
  console.log("  email:    " + SEED_EMAIL);
  console.log("  password: " + SEED_PASSWORD);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
