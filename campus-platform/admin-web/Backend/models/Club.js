const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
      unique: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
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

// ─── Virtual: member count ───
clubSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

// ─── Indexes ───
clubSchema.index({ isActive: 1 });
clubSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Club', clubSchema);
