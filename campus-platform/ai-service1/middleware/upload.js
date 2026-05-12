const multer = require('multer');
const path = require('path');
const { ALLOWED_IMAGE_TYPES } = require('../utils/constants');
const config = require('../config');
const AppError = require('../utils/AppError');

// Storage configuration — save files locally to uploads/ directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhex.ext
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `campus-${uniqueSuffix}${ext}`);
  },
});

// File filter — only allow image types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        400
      ),
      false
    );
  }
};

/**
 * Multer upload middleware configured for single image uploads.
 * - Max file size: configured via env (default 10MB)
 * - Allowed types: JPEG, PNG, WebP, BMP
 * - Storage: local disk
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.imageValidation.maxSizeMB * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
