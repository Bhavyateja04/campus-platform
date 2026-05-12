const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { compareValidation } = require('../validations/imageValidation');

// POST /api/compare/:imageId1/:imageId2
router.post(
  '/:imageId1/:imageId2',
  auth,
  compareValidation,
  validate,
  comparisonController.compareImages
);

module.exports = router;
