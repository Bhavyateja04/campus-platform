// One-shot dev cleanup: drops the `revokedtokens` collection so it gets
// recreated with the new schema (jti instead of token).

const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose = require("mongoose");

// ─── Constants ────────────────────────────────────────────────────────────────

const COLLECTION_NAME = "revokedtokens";

const MESSAGES = {
  MONGO_URI_MISSING:  "MONGO_URI missing in server/.env",
  DROPPED:            `Dropped collection '${COLLECTION_NAME}'.`,
  NOT_FOUND:          `Collection '${COLLECTION_NAME}' did not exist (nothing to drop).`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isNamespaceNotFound = (err) => err?.codeName === "NamespaceNotFound";

// ─── Main ─────────────────────────────────────────────────────────────────────

const dropRevokedTokens = async () => {
  if (!process.env.MONGO_URI) {
    console.error(MESSAGES.MONGO_URI_MISSING);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    await mongoose.connection.db.dropCollection(COLLECTION_NAME);
    console.log(MESSAGES.DROPPED);
  } catch (err) {
    if (isNamespaceNotFound(err)) {
      console.log(MESSAGES.NOT_FOUND);
    } else {
      throw err;
    }
  } finally {
    await mongoose.disconnect();
  }
};

// ─── Run ──────────────────────────────────────────────────────────────────────

dropRevokedTokens().catch((err) => {
  console.error(err);
  process.exit(1);
});
