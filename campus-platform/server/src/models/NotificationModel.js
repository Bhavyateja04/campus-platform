const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body:  { type: String, required: true },
    type:  {
      type: String,
      enum: ['Academic', 'Events', 'Clubs', 'System'],
      default: 'System',
    },
    icon:  { type: String, default: 'notifications-outline' },
    color: { type: String, default: '#4A6FA5' },

    // Audience: if `audience === 'all'` every authenticated user sees it.
    // If `audience === 'user'` only the user in `audienceUserId` sees it.
    audience:        { type: String, enum: ['all', 'user'], default: 'all' },
    audienceUserId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // List of user ids that have already marked this notification as read.
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

NotificationSchema.index({ audience: 1, audienceUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
