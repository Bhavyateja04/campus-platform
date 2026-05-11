const crypto = require("crypto");

const User = require("../models/UserModel");
const RevokedToken = require("../models/RevokedTokenModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
}

// Issues a signed JWT with a unique `jti` so two tokens issued in the same
// second for the same user are still distinct (and so we can revoke them
// individually without storing the raw token).
function signAuthToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    jwtSecret(),
    { expiresIn: "1d", jwtid: crypto.randomUUID() }
  );
}

const ALLOWED_EMAIL_DOMAINS = /@(acet|aec|aus)\.ac\.in$/;

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = signAuthToken(user);

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
        firstLogin: user.firstLogin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, rollNumber, role, college, course, department, phone } = req.body || {};

    if (!email || !password || !name || !rollNumber) {
      return res.status(400).json({ message: "email, password, name, rollNumber are required" });
    }
    if (!ALLOWED_EMAIL_DOMAINS.test(email)) {
      return res.status(400).json({
        message: "Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains",
      });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (role && role !== "student") {
      return res.status(400).json({ message: "Public registration only allows the 'student' role" });
    }

    const existing = await User.findOne({ $or: [{ email }, { rollNumber }] });
    if (existing) {
      return res.status(409).json({ message: "User with this email or roll number already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      name,
      rollNumber,
      role: "student",
      college,
      course,
      department,
      phone,
      firstLogin: true,
    });

    const token = signAuthToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
        firstLogin: user.firstLogin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration error" });
  }
};

// POST /api/auth/logout (auth required)
//
// JWTs are stateless, so logout means: record this token's `jti` as revoked
// and let authMiddleware reject any future request that presents it. The TTL
// index on RevokedToken cleans entries up automatically when the JWT itself
// would have expired.
//
// Idempotent: hitting it twice with the same token returns 200 the first
// time and 401 ("Token has been revoked") thereafter, which the client
// handles transparently.
const logout = async (req, res) => {
  try {
    const jti = req.user && req.user.jti;
    if (!jti) {
      // Pre-jti tokens (issued before this code shipped) can't be revoked
      // by id; the client will still clear local credentials. Nothing more
      // to do server-side.
      return res.json({ message: "Logged out (token not tracked)" });
    }

    // We trust req.user.exp because authMiddleware just verified the token's
    // signature. Fall back to 1 day from now so the entry still self-cleans.
    const expSeconds =
      (typeof req.user.exp === "number" && req.user.exp) ||
      Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const expiresAt = new Date(expSeconds * 1000);

    if (expiresAt.getTime() <= Date.now()) {
      return res.json({ message: "Logged out" });
    }

    await RevokedToken.updateOne(
      { jti },
      {
        $setOnInsert: {
          jti,
          userId: req.user.id,
          expiresAt,
        },
      },
      { upsert: true }
    );

    return res.json({ message: "Logged out" });
  } catch (error) {
    console.error("logout error", error);
    return res.status(500).json({ message: "Logout error" });
  }
};

module.exports = { login, register, logout };