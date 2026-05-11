const Notification = require("../models/NotificationModel");
const { emitRealtime } = require("../realtime");

// GET /api/notifications  (auth)
// Returns notifications visible to the current user, plus an `unread` flag.
async function listNotifications(req, res) {
  try {
    const userId = req.user.id;
    const items = await Notification.find({
      $or: [{ audience: "all" }, { audience: "user", audienceUserId: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(200);

    const data = items.map((n) => ({
      id: String(n._id),
      title: n.title,
      body: n.body,
      type: n.type,
      icon: n.icon,
      color: n.color,
      createdAt: n.createdAt,
      unread: !n.readBy.some((u) => String(u) === String(userId)),
    }));

    res.json({ message: "Notifications retrieved", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving notifications" });
  }
}

// POST /api/notifications  (admin)
async function createNotification(req, res) {
  try {
    const { title, body, type, icon, color, audience, audienceUserId } =
      req.body || {};
    if (!title || !body) {
      return res.status(400).json({ message: "title and body are required" });
    }
    const created = await Notification.create({
      title,
      body,
      type: type || "System",
      icon: icon || "notifications-outline",
      color: color || "#4A6FA5",
      audience: audience || "all",
      audienceUserId: audience === "user" ? audienceUserId : undefined,
    });
    emitRealtime("notifications:changed", {
      action: "created",
      notification: created,
    });
    res.status(201).json({ message: "Notification created", data: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating notification" });
  }
}

// PUT /api/notifications/:id/read  (auth)
async function markRead(req, res) {
  try {
    const userId = req.user.id;
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ message: "Notification not found" });

    if (!n.readBy.some((u) => String(u) === String(userId))) {
      n.readBy.push(userId);
      await n.save();
      emitRealtime("notifications:changed", {
        action: "read",
        notificationId: String(n._id),
        userId,
      });
    }
    res.json({ message: "Notification marked read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking notification read" });
  }
}

// PUT /api/notifications/read-all  (auth)
async function markAllRead(req, res) {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      {
        $or: [
          { audience: "all" },
          { audience: "user", audienceUserId: userId },
        ],
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } },
    );
    emitRealtime("notifications:changed", {
      action: "read-all",
      userId,
    });
    res.json({ message: "All notifications marked read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking all read" });
  }
}

// DELETE /api/notifications/:id  (admin)
async function removeNotification(req, res) {
  try {
    const n = await Notification.findByIdAndDelete(req.params.id);
    if (!n) return res.status(404).json({ message: "Notification not found" });
    emitRealtime("notifications:changed", {
      action: "deleted",
      notificationId: String(n._id),
    });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting notification" });
  }
}

module.exports = {
  listNotifications,
  createNotification,
  markRead,
  markAllRead,
  removeNotification,
};
