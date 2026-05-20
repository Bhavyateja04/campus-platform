const mongoose = require('mongoose');

const marketplaceSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'removed'],
      default: 'active',
    },
    description: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───
marketplaceSchema.index({ status: 1 });
marketplaceSchema.index({ createdAt: -1 });
marketplaceSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Marketplace', marketplaceSchema);
