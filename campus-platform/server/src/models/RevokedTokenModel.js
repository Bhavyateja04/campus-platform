const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION = {
  MESSAGES: {
    JTI_REQUIRED:       "JWT ID (jti) is required",
    EXPIRES_AT_REQUIRED: "Expiry date is required",
  },
};

// ─── Schema ───────────────────────────────────────────────────────────────────

/**
 * Stores the `jti` (JWT ID) of explicitly revoked tokens (e.g. via logout)
 * so subsequent requests presenting them are rejected even though the JWT
 * itself is still cryptographically valid.
 *
 * Design decisions:
 * - Only the random `jti` is stored — never the full token — so this
 *   collection contains no signing-secret-derived material and no PII.
 * - `expiresAt` mirrors the JWT's own `exp` claim. The TTL index below
 *   instructs MongoDB to auto-purge each document once it expires,
 *   keeping the collection bounded without a cron job.
 * - `mongoose.models.RevokedToken ||` guards against model recompilation
 *   errors in hot-reload environments (e.g. Next.js, nodemon).
 */
const RevokedTokenSchema = new mongoose.Schema(
  {
    jti: {
      type:     String,
      required: [true, VALIDATION.MESSAGES.JTI_REQUIRED],
      unique:   true,
      index:    true,
      trim:     true,
    },
    userId: {
      type:  mongoose.Schema.Types.ObjectId,
      ref:   "User",
      index: true,
    },
    expiresAt: {
      type:     Date,
      required: [true, VALIDATION.MESSAGES.EXPIRES_AT_REQUIRED],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// `expireAfterSeconds: 0` means "delete the document when `expiresAt` is in the past".
RevokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports =
  mongoose.models.RevokedToken ||
  mongoose.model("RevokedToken", RevokedTokenSchema);
