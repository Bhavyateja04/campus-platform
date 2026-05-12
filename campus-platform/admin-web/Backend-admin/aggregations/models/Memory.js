const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Memory title is required'],
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
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
memorySchema.index({ isActive: 1 });
memorySchema.index({ createdAt: -1 });
memorySchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Memory', memorySchema);
