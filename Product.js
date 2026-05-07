const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String, // URL or base64 of the product image
      required: true,
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
      detections: { type: mongoose.Schema.Types.Mixed, default: null },
      summary: { type: String, default: null },
      similarProducts: { type: [String], default: [] },
      cachedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
