const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'claimed'],
      default: 'active',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
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
lostFoundSchema.index({ status: 1 });
lostFoundSchema.index({ category: 1 });
lostFoundSchema.index({ createdAt: -1 });
lostFoundSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('LostFound', lostFoundSchema);
