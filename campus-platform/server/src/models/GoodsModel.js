const mongoose = require("mongoose");

const MarketplaceSchema = new mongoose.Schema({
  itemname: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  price: {
    type: Number,
    required: true
  },

  category: {
    type: String
  },

  condition: {
    type: String
  },

  imageUrl: {
    type: String
  },

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  contactNumber: {
    type: String
  },

  status: {
    type: String,
    enum: ["available", "sold"],
    default: "available"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MarketplaceItem", MarketplaceSchema);