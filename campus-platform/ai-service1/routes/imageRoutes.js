const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  uploadValidation,
  analyzeValidation,
  getImageByIdValidation,
  deleteImageValidation,
  listImagesValidation,
} = require('../validations/imageValidation');

// POST /api/images/upload — Upload a new image
router.post(
  '/upload',
  auth,
  uploadLimiter,
  upload.single('image'),
  uploadValidation,
  validate,
  imageController.uploadImage
);

// POST /api/images/analyze — Analyze an uploaded image
router.post(
  '/analyze',
  auth,
  analyzeValidation,
  validate,
  imageController.analyzeImage
);

// GET /api/images — Get all images (paginated)
router.get(
  '/',
  auth,
  listImagesValidation,
  validate,
  imageController.getAllImages
);

// GET /api/images/:id — Get single image analysis
router.get(
  '/:id',
  auth,
  getImageByIdValidation,
  validate,
  imageController.getImageById
);

// DELETE /api/images/:id — Delete an image analysis
router.delete(
  '/:id',
  auth,
  deleteImageValidation,
  validate,
  imageController.deleteImage
);

module.exports = router;
