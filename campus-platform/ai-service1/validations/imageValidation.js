const { body, param, query } = require('express-validator');

const uploadValidation = [
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const analyzeValidation = [
  body('imageId')
    .notEmpty()
    .withMessage('Image ID is required')
    .isMongoId()
    .withMessage('Invalid image ID format'),
];

const getImageByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Image ID is required')
    .isMongoId()
    .withMessage('Invalid image ID format'),
];

const deleteImageValidation = [
  param('id')
    .notEmpty()
    .withMessage('Image ID is required')
    .isMongoId()
    .withMessage('Invalid image ID format'),
];

const listImagesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'rejected']).withMessage('Invalid status'),
  query('imageCategory').optional().isString().withMessage('Category must be a string'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('search').optional().isString().isLength({ max: 200 }).withMessage('Search query too long'),
];

const compareValidation = [
  param('imageId1').notEmpty().isMongoId().withMessage('Invalid image ID 1'),
  param('imageId2').notEmpty().isMongoId().withMessage('Invalid image ID 2'),
];

module.exports = {
  uploadValidation,
  analyzeValidation,
  getImageByIdValidation,
  deleteImageValidation,
  listImagesValidation,
  compareValidation,
};
