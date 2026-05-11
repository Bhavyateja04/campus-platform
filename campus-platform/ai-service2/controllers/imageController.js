const fs = require('fs');
const path = require('path');
const ImageAnalysis = require('../models/ImageAnalysis');
const aiVisionService = require('../services/aiVisionService');
const imageValidationService = require('../services/imageValidationService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const config = require('../config');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const { ANALYSIS_STATUS } = require('../utils/constants');

// Valid categories — only these get saved to MongoDB
const VALID_CATEGORIES = ['stationery', 'electronics', 'books', 'accessories'];

/**
 * Upload + Auto-Analyze in a single step.
 * Validates image → sends to AI → checks category → saves to DB (or rejects).
 * Items NOT in stationery/electronics/books/accessories are rejected and NOT saved.
 */
exports.uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image file provided.', 400));
  }

  const filePath = req.file.path;
  const startTime = Date.now();

  // Step 1: Validate image quality (blur, corruption, size)
  const validation = await imageValidationService.validateImage(filePath);
  if (!validation.isValid) {
    fs.unlinkSync(filePath);
    return next(new AppError(`Image validation failed: ${validation.errors.join('; ')}`, 422));
  }

  // Step 2: AI Analysis (OpenRouter → Gemini)
  console.log(`🤖 Analyzing image: ${req.file.filename}...`);
  let aiResult;
  try {
    aiResult = await aiVisionService.analyzeImage(filePath);
  } catch (error) {
    console.error(`❌ AI analysis error:`, error.message);
    fs.unlinkSync(filePath);
    return next(new AppError(`AI analysis failed: ${error.message}`, 500));
  }

  // ─── DEBUG: Log full AI response ─────────────────────────────
  console.log(`\n📋 AI ANALYSIS RESULT:`);
  console.log(`   isValidItem  : ${aiResult.isValidItem}`);
  console.log(`   category     : ${aiResult.imageCategory}`);
  console.log(`   summary      : ${aiResult.aiSummary}`);
  console.log(`   detections   : ${aiResult.detections?.length || 0} items`);
  console.log(`   tags         : ${(aiResult.tags || []).join(', ')}`);
  console.log(`   condition    : ${aiResult.itemCondition}`);
  if (aiResult.rejectionReason) {
    console.log(`   rejection    : ${aiResult.rejectionReason}`);
  }
  console.log('');
  // ─────────────────────────────────────────────────────────────

  // Step 3: Check NSFW
  if (aiResult.isNSFW) {
    console.log(`🚫 REJECTED: NSFW content`);
    fs.unlinkSync(filePath);
    return res.status(422).json({
      status: 'fail',
      message: 'Image rejected: NSFW content detected.',
      errors: ['Image contains inappropriate content.'],
    });
  }

  // Step 4: Check if item is valid (belongs to our 4 categories)
  if (!aiResult.isValidItem) {
    console.log(`🚫 REJECTED: Not a valid item — ${aiResult.rejectionReason}`);
    fs.unlinkSync(filePath);
    return res.status(422).json({
      status: 'fail',
      message: 'Image rejected: item does not match any valid category.',
      errors: [aiResult.rejectionReason || 'Only stationery, electronics, books, and accessories are accepted.'],
      validCategories: VALID_CATEGORIES,
    });
  }

  // Step 5: Validate category
  const category = (aiResult.imageCategory || 'unknown').toLowerCase();
  if (!VALID_CATEGORIES.includes(category)) {
    console.log(`🚫 REJECTED: Category "${category}" not in valid list [${VALID_CATEGORIES.join(', ')}]`);
    fs.unlinkSync(filePath);
    return res.status(422).json({
      status: 'fail',
      message: `Image rejected: category "${category}" is not accepted.`,
      errors: [`Only ${VALID_CATEGORIES.join(', ')} items are accepted.`],
      validCategories: VALID_CATEGORIES,
    });
  }

  // Step 6: Filter low-confidence detections
  const filtered = aiResult.detections.filter(
    (d) => d.confidence >= config.matching.minConfidence
  );

  // Step 7: Upload to cloudinary or keep local
  let imageUrl = `/uploads/${req.file.filename}`;
  let cloudinaryPublicId = null;

  if (config.useCloudinary) {
    try {
      const cloudResult = await uploadToCloudinary(filePath);
      imageUrl = cloudResult.url;
      cloudinaryPublicId = cloudResult.publicId;
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Cloudinary upload failed, keeping local:', err.message);
    }
  }

  // Step 8: Save to MongoDB (only valid items reach here)
  const analysis = await ImageAnalysis.create({
    imageUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    cloudinaryPublicId,
    uploadedBy: req.user._id,
    status: ANALYSIS_STATUS.COMPLETED,
    imageMetadata: {
      width: validation.metadata.width,
      height: validation.metadata.height,
      format: validation.metadata.format,
      sizeBytes: validation.metadata.sizeBytes,
    },
    detections: filtered,
    imageCategory: category,
    aiSummary: aiResult.aiSummary,
    tags: aiResult.tags || [],
    processingTime: Date.now() - startTime,
    roboflowRaw: aiResult,
  });

  console.log(`✅ ${category.toUpperCase()}: ${filtered.length} items detected in ${Date.now() - startTime}ms`);

  res.status(201).json({
    status: 'success',
    message: `Item analyzed and saved as "${category}".`,
    data: {
      analysis: {
        _id: analysis._id,
        imageUrl: analysis.imageUrl,
        filename: analysis.filename,
        detections: analysis.detections,
        detectedObjectsCount: analysis.detectedObjectsCount,
        uniqueClasses: analysis.uniqueClasses,
        aiSummary: analysis.aiSummary,
        imageCategory: analysis.imageCategory,
        tags: analysis.tags,
        status: analysis.status,
        processingTime: analysis.processingTime,
        createdAt: analysis.createdAt,
      },
    },
  });
});

/**
 * Analyze an already-uploaded image (kept for backward compatibility).
 * Now just re-runs AI on an existing record.
 */
exports.analyzeImage = catchAsync(async (req, res, next) => {
  const { imageId } = req.body;

  const analysis = await ImageAnalysis.findById(imageId);
  if (!analysis) return next(new AppError('Image not found.', 404));

  if (analysis.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to analyze this image.', 403));
  }

  if (analysis.status === ANALYSIS_STATUS.COMPLETED) {
    return res.status(200).json({
      status: 'success',
      message: 'Image already analyzed.',
      data: {
        analysis: {
          _id: analysis._id,
          imageUrl: analysis.imageUrl,
          filename: analysis.filename,
          detections: analysis.detections,
          detectedObjectsCount: analysis.detectedObjectsCount,
          uniqueClasses: analysis.uniqueClasses,
          aiSummary: analysis.aiSummary,
          imageCategory: analysis.imageCategory,
          tags: analysis.tags,
          status: analysis.status,
          processingTime: analysis.processingTime,
          createdAt: analysis.createdAt,
        },
      },
    });
  }

  return next(new AppError('Use the upload endpoint — analysis is automatic.', 400));
});

/**
 * Get all images with pagination, filtering, sorting, search.
 */
exports.getAllImages = catchAsync(async (req, res) => {
  // Build query — regular users see only their own images
  let baseQuery = {};
  if (req.user.role !== 'admin') {
    baseQuery.uploadedBy = req.user._id;
  }

  // Count total for pagination metadata
  const filterQuery = { ...baseQuery };
  if (req.query.status) filterQuery.status = req.query.status;
  if (req.query.imageCategory) filterQuery.imageCategory = req.query.imageCategory;

  const total = await ImageAnalysis.countDocuments(filterQuery);

  const features = new APIFeatures(ImageAnalysis.find(baseQuery), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const analyses = await features.query.populate('uploadedBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: analyses.length,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      totalPages: Math.ceil(total / features.limit),
    },
    data: { analyses },
  });
});

/**
 * Get a single image analysis by ID.
 */
exports.getImageById = catchAsync(async (req, res, next) => {
  const analysis = await ImageAnalysis.findById(req.params.id).populate('uploadedBy', 'name email');

  if (!analysis) return next(new AppError('Image analysis not found.', 404));

  if (analysis.uploadedBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this analysis.', 403));
  }

  res.status(200).json({ status: 'success', data: { analysis } });
});

/**
 * Delete an image analysis.
 */
exports.deleteImage = catchAsync(async (req, res, next) => {
  const analysis = await ImageAnalysis.findById(req.params.id);
  if (!analysis) return next(new AppError('Image analysis not found.', 404));

  if (analysis.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this analysis.', 403));
  }

  // Delete local file
  const localPath = path.join(__dirname, '..', 'uploads', analysis.filename);
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

  // Delete from Cloudinary
  if (analysis.cloudinaryPublicId) {
    try { await deleteFromCloudinary(analysis.cloudinaryPublicId); } catch (e) { console.error('Cloudinary delete error:', e.message); }
  }

  await ImageAnalysis.findByIdAndDelete(req.params.id);

  res.status(200).json({ status: 'success', message: 'Image analysis deleted successfully.' });
});
