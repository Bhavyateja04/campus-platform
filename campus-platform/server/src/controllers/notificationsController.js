const Notification = require("../models/NotificationModel");
const { emitRealtime } = require("../realtime");

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  NOTIFICATIONS_RETRIEVED: "Notifications retrieved",
  NOTIFICATION_CREATED: "Notification created",
  NOTIFICATION_MARKED_READ: "Notification marked read",
  ALL_NOTIFICATIONS_MARKED_READ: "All notifications marked read",
  NOTIFICATION_DELETED: "Notification deleted",
  NOTIFICATION_NOT_FOUND: "Notification not found",
  MISSING_FIELDS: "title and body are required",
  ERROR_RETRIEVING: "Error retrieving notifications",
  ERROR_CREATING: "Error creating notification",
  ERROR_MARKING_READ: "Error marking notification read",
  ERROR_MARKING_ALL_READ: "Error marking all read",
  ERROR_DELETING: "Error deleting notification",
};

const REALTIME_EVENTS = {
  NOTIFICATIONS_CHANGED: "notifications:changed",
};

const NOTIFICATION_DEFAULTS = {
  TYPE: "System",
  ICON: "notifications-outline",
  COLOR: "#4A6FA5",
  AUDIENCE: "all",
  LIST_LIMIT: 200,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sendSuccess = (res, statusCode, data = {}) => {
  res.status(statusCode).json({ success: true, ...data });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message });
};

const buildAudienceQuery = (userId) => ({
  $or: [
    { audience: "all" },
    { audience: "user", audienceUserId: userId },
  ],
});

const hasUserRead = (notification, userId) => {
  return notification.readBy.some((u) => String(u) === String(userId));
};

const formatNotification = (notification, userId) => ({
  id: String(notification._id),
  title: notification.title,
  body: notification.body,
  type: notification.type,
  icon: notification.icon,
  color: notification.color,
  createdAt: notification.createdAt,
  unread: !hasUserRead(notification, userId),
});

const emitNotificationEvent = (action, payload = {}) => {
  emitRealtime(REALTIME_EVENTS.NOTIFICATIONS_CHANGED, { action, ...payload });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    List notifications for the current user
 * @route   GET /api/notifications
 * @access  Private
 */
const listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification
      .find(buildAudienceQuery(userId))
      .sort({ createdAt: -1 })
      .limit(NOTIFICATION_DEFAULTS.LIST_LIMIT);

    const data = notifications.map((n) => formatNotification(n, userId));

    sendSuccess(res, HTTP_STATUS.OK, {
      message: MESSAGES.NOTIFICATIONS_RETRIEVED,
      data,
    });
  } catch (error) {
    console.error("listNotifications error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_RETRIEVING);
  }
};

/**
 * @desc    Create a new notification
 * @route   POST /api/notifications
 * @access  Admin
 */
const createNotification = async (req, res) => {
  try {
    const { title, body, type, icon, color, audience, audienceUserId } = req.body || {};

    if (!title || !body) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const notification = await Notification.create({
      title,
      body,
      type:            type     || NOTIFICATION_DEFAULTS.TYPE,
      icon:            icon     || NOTIFICATION_DEFAULTS.ICON,
      color:           color    || NOTIFICATION_DEFAULTS.COLOR,
      audience:        audience || NOTIFICATION_DEFAULTS.AUDIENCE,
      audienceUserId:  audience === "user" ? audienceUserId : undefined,
    });

    emitNotificationEvent("created", { notification });

    sendSuccess(res, HTTP_STATUS.CREATED, {
      message: MESSAGES.NOTIFICATION_CREATED,
      data: notification,
    });
  } catch (error) {
    console.error("createNotification error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_CREATING);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.NOTIFICATION_NOT_FOUND);
    }

    if (!hasUserRead(notification, userId)) {
      notification.readBy.push(userId);
      await notification.save();

      emitNotificationEvent("read", {
        notificationId: String(notification._id),
        userId,
      });
    }

    sendSuccess(res, HTTP_STATUS.OK, { message: MESSAGES.NOTIFICATION_MARKED_READ });
  } catch (error) {
    console.error("markRead error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_MARKING_READ);
  }
};

/**
 * @desc    Mark all notifications as read for the current user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { ...buildAudienceQuery(userId), readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    emitNotificationEvent("read-all", { userId });

    sendSuccess(res, HTTP_STATUS.OK, { message: MESSAGES.ALL_NOTIFICATIONS_MARKED_READ });
  } catch (error) {
    console.error("markAllRead error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_MARKING_ALL_READ);
  }
};

/**
 * @desc    Delete a notification by ID
 * @route   DELETE /api/notifications/:id
 * @access  Admin
 */
const removeNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.NOTIFICATION_NOT_FOUND);
    }

    emitNotificationEvent("deleted", { notificationId: String(notification._id) });

    sendSuccess(res, HTTP_STATUS.OK, { message: MESSAGES.NOTIFICATION_DELETED });
  } catch (error) {
    console.error("removeNotification error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_DELETING);
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  listNotifications,
  createNotification,
  markRead,
  markAllRead,
  removeNotification,
};
