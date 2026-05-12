const mongoose = require("mongoose");

// Stores the `jti` (JWT ID) of tokens that have been explicitly revoked
// (e.g. via /api/auth/logout) so subsequent requests presenting them are
// rejected even though the JWT itself is still cryptographically valid.
//
// We deliberately store ONLY the random `jti`, never the full token, so this
// collection contains no signing-secret-derived material and no PII.
//
// `expiresAt` is set to the JWT's own `exp` claim. With the TTL index below
// MongoDB will automatically purge each document when its expiry passes,
// keeping the collection bounded without a cron job.
const RevokedTokenSchema = new mongoose.Schema(
  {
    jti:       { type: String, required: true, unique: true, index: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// `expireAfterSeconds: 0` means "delete when `expiresAt` is in the past".
RevokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =
  mongoose.models.RevokedToken ||
  mongoose.model("RevokedToken", RevokedTokenSchema);
