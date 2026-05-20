const mongoose = require('mongoose');

const placementExperienceSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
    },
    package: {
      type: String,
      trim: true,
    },
    tips: {
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
placementExperienceSchema.index({ createdAt: -1 });
placementExperienceSchema.index({ companyName: 1 });

module.exports = mongoose.model('PlacementExperience', placementExperienceSchema);
