const express = require('express');
const router = express.Router();

const protect   = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const {
  listNotifications,
  createNotification,
  markRead,
  markAllRead,
  removeNotification,
} = require('../controllers/notificationsController');

router.get('/',          protect,             listNotifications);
router.put('/read-all',  protect,             markAllRead);
router.put('/:id/read',  protect,             markRead);
router.post('/',         protect, adminOnly,  createNotification);
router.delete('/:id',    protect, adminOnly,  removeNotification);

module.exports = router;
