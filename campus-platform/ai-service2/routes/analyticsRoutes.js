const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All analytics routes require admin access
router.use(auth, roleCheck('admin'));

// GET /api/analytics/dashboard
router.get('/dashboard', analyticsController.getDashboard);

// GET /api/analytics/trends?days=30
router.get('/trends', analyticsController.getTrends);

// GET /api/analytics/objects?limit=20
router.get('/objects', analyticsController.getTopObjects);

module.exports = router;
