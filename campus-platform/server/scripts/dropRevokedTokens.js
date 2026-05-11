// One-shot dev cleanup: drops the `revokedtokens` collection so it gets
// recreated with the new schema (jti instead of token).
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mongoose = require("mongoose");

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI missing in server/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await mongoose.connection.db.dropCollection("revokedtokens");
    console.log("Dropped collection 'revokedtokens'.");
  } catch (err) {
    if (err && err.codeName === "NamespaceNotFound") {
      console.log("Collection 'revokedtokens' did not exist (nothing to drop).");
    } else {
      throw err;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
