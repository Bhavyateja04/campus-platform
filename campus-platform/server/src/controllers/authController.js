const crypto = require('crypto');

const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');

const User         = require('../models/UserModel');
const RevokedToken = require('../models/RevokedTokenModel');

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_EMAIL_DOMAINS = /@(acet|aec|aus)\.ac\.in$/;
const SALT_ROUNDS           = 10;
const PASSWORD_MIN_LENGTH   = 6;
const FALLBACK_TTL_SECONDS  = 24 * 60 * 60; // 1 day

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reads JWT_SECRET from the environment.
 * Throws early if missing so the server fails loudly at startup.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
};

/**
 * Signs a JWT for the given user.
 * Includes a unique `jti` so individual tokens can be revoked without
 * storing the raw token string.
 */
const signAuthToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    getJwtSecret(),
    { expiresIn: '1d', jwtid: crypto.randomUUID() }
  );

/**
 * Returns the minimal public user payload included in auth responses.
 */
const toAuthUser = (user) => ({
  id:         user._id,
  name:       user.name,
  email:      user.email,
  rollNumber: user.rollNumber,
  role:       user.role,
  firstLogin: user.firstLogin,
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Authenticates a user and returns a signed JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = signAuthToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      user: toAuthUser(user),
    });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ message: 'Login error' });
  }
};

/**
 * POST /api/auth/register
 * Registers a new student account.
 * Public registration is locked to the 'student' role only.
 */
const register = async (req, res) => {
  try {
    const { email, password, name, rollNumber, role, college, course, department, phone } = req.body || {};

    if (!email || !password || !name || !rollNumber) {
      return res.status(400).json({ message: 'email, password, name, and rollNumber are required' });
    }

    if (!ALLOWED_EMAIL_DOMAINS.test(email)) {
      return res.status(400).json({
        message: 'Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains',
      });
    }

    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      });
    }

    if (role && role !== 'student') {
      return res.status(400).json({ message: "Public registration only allows the 'student' role" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email or roll number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      rollNumber,
      role:       'student',
      college,
      course,
      department,
      phone,
      firstLogin: true,
    });

    const token = signAuthToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      role:  user.role,
      user:  toAuthUser(user),
    });
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ message: 'Registration error' });
  }
};

/**
 * POST /api/auth/logout  (requires auth)
 *
 * JWTs are stateless, so logout works by recording the token's `jti` as
 * revoked. The auth middleware then rejects any future request presenting it.
 * A TTL index on RevokedToken auto-deletes entries once the JWT itself expires.
 *
 * Idempotent: a second call with the same token returns 401 ("Token has been
 * revoked"), which the client can handle transparently.
 */
const logout = async (req, res) => {
  try {
    const jti = req.user?.jti;

    // Pre-jti tokens (issued before this code shipped) cannot be individually
    // revoked. The client should still clear local credentials.
    if (!jti) {
      return res.status(200).json({ message: 'Logged out (token not tracked)' });
    }

    // Use the verified exp from authMiddleware; fall back to 1 day from now
    // so the RevokedToken entry still self-cleans via the TTL index.
    const expSeconds =
      (typeof req.user.exp === 'number' && req.user.exp) ||
      Math.floor(Date.now() / 1000) + FALLBACK_TTL_SECONDS;

    const expiresAt = new Date(expSeconds * 1000);

    // Token already expired — nothing to revoke.
    if (expiresAt.getTime() <= Date.now()) {
      return res.status(200).json({ message: 'Logged out' });
    }

    await RevokedToken.updateOne(
      { jti },
      { $setOnInsert: { jti, userId: req.user.id, expiresAt } },
      { upsert: true }
    );

    return res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    console.error('[logout]', error);
    return res.status(500).json({ message: 'Logout error' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { login, register, logout };
