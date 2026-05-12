const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation } = require('../validations/authValidation');

// POST /api/auth/register
router.post('/register', authLimiter, registerValidation, validate, authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, validate, authController.login);

// GET /api/auth/profile
router.get('/profile', auth, authController.getProfile);

module.exports = router;
