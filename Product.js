const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true, // Ensures consistent SKU formatting e.g. "SKU-001"
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },
    imageBase64: {
      type: String, // Optional: store base64 directly
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Extra product data (price, stock, etc.)
      default: {},
    },
    lastAnalyzed: {
      type: Date,
      default: null,
    },
    analysisCache: {
      detections:      { type: mongoose.Schema.Types.Mixed, default: null },
      summary:         { type: String, default: null },
      similarProducts: { type: [String], default: [] },
      cachedAt:        { type: Date, default: null },
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("Product", productSchema);
