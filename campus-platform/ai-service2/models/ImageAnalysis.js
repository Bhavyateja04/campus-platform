const mongoose = require('mongoose');
const { ANALYSIS_STATUS, IMAGE_CATEGORIES } = require('../utils/constants');

/**
 * Detection sub-schema for individual object detections.
 */
const detectionSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    bbox: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
  },
  { _id: false }
);

/**
 * ImageAnalysis schema — stores the result of AI analysis on an uploaded image.
 */
const imageAnalysisSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by user is required'],
      index: true,
    },
    detections: [detectionSchema],
    detectedObjectsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueClasses: {
      type: [String],
      default: [],
    },
    aiSummary: {
      type: String,
      default: '',
    },
    imageCategory: {
      type: String,
      enum: Object.values(IMAGE_CATEGORIES),
      default: IMAGE_CATEGORIES.UNKNOWN,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ANALYSIS_STATUS),
      default: ANALYSIS_STATUS.PENDING,
      index: true,
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    imageMetadata: {
      width: Number,
      height: Number,
      format: String,
      sizeBytes: Number,
    },
    validationErrors: {
      type: [String],
      default: [],
    },
    roboflowRaw: {
      type: mongoose.Schema.Types.Mixed,
      select: false, // excluded from queries by default
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

// Compound index for common query patterns
imageAnalysisSchema.index({ status: 1, createdAt: -1 });
imageAnalysisSchema.index({ uploadedBy: 1, createdAt: -1 });
imageAnalysisSchema.index({ imageCategory: 1, status: 1 });

// Text index for search
imageAnalysisSchema.index(
  { aiSummary: 'text', tags: 'text', uniqueClasses: 'text' },
  { weights: { tags: 3, uniqueClasses: 2, aiSummary: 1 } }
);

// ─── Pre-save Hook ───────────────────────────────────────────────────────────

imageAnalysisSchema.pre('save', function (next) {
  if (this.isModified('detections')) {
    this.detectedObjectsCount = this.detections.length;
    this.uniqueClasses = [
      ...new Set(this.detections.map((d) => d.className)),
    ];
  }
  next();
});

// ─── Virtual ─────────────────────────────────────────────────────────────────

imageAnalysisSchema.virtual('averageConfidence').get(function () {
  if (!this.detections || this.detections.length === 0) return 0;
  const sum = this.detections.reduce((acc, d) => acc + d.confidence, 0);
  return Math.round((sum / this.detections.length) * 100) / 100;
});

// ─── Static Methods ──────────────────────────────────────────────────────────

/**
 * Get aggregate statistics for the dashboard.
 */
imageAnalysisSchema.statics.getDashboardStats = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        totalUploads: [{ $count: 'count' }],
        statusBreakdown: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        categoryBreakdown: [
          {
            $match: { status: ANALYSIS_STATUS.COMPLETED },
          },
          { $group: { _id: '$imageCategory', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        totalDetections: [
          {
            $match: { status: ANALYSIS_STATUS.COMPLETED },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$detectedObjectsCount' },
              avgConfidence: {
                $avg: {
                  $avg: '$detections.confidence',
                },
              },
              avgProcessingTime: { $avg: '$processingTime' },
            },
          },
        ],
        recentUploads: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              filename: 1,
              imageCategory: 1,
              status: 1,
              detectedObjectsCount: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

  return stats[0];
};

const ImageAnalysis = mongoose.model('ImageAnalysis', imageAnalysisSchema);

module.exports = ImageAnalysis;
