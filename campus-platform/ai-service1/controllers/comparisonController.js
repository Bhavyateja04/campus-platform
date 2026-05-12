const ImageAnalysis = require('../models/ImageAnalysis');
const comparisonService = require('../services/comparisonService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { ANALYSIS_STATUS } = require('../utils/constants');

exports.compareImages = catchAsync(async (req, res, next) => {
  const { imageId1, imageId2 } = req.params;

  if (imageId1 === imageId2) {
    return next(new AppError('Cannot compare an image with itself.', 400));
  }

  const [analysis1, analysis2] = await Promise.all([
    ImageAnalysis.findById(imageId1),
    ImageAnalysis.findById(imageId2),
  ]);

  if (!analysis1) return next(new AppError(`Image analysis ${imageId1} not found.`, 404));
  if (!analysis2) return next(new AppError(`Image analysis ${imageId2} not found.`, 404));

  if (analysis1.status !== ANALYSIS_STATUS.COMPLETED) {
    return next(new AppError(`Image ${imageId1} has not been analyzed yet.`, 400));
  }
  if (analysis2.status !== ANALYSIS_STATUS.COMPLETED) {
    return next(new AppError(`Image ${imageId2} has not been analyzed yet.`, 400));
  }

  const comparison = comparisonService.compareAnalyses(analysis1, analysis2);

  res.status(200).json({ status: 'success', data: { comparison } });
});
