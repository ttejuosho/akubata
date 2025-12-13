// controllers/notificationController.js
import { Notifications } from "../models/Notifications.js";

/**
 * Create a notification
 */
export const createNotification = async (req, res) => {
  try {
    const {
      recipientId,
      type,
      message,
      relatedConversationId,
      relatedMessageId,
    } = req.body;

    if (!recipientId || !type || !message) {
      return res
        .status(400)
        .json({ message: "recipientId, type, and message are required" });
    }

    const notification = await Notifications.create({
      recipientId,
      type,
      message,
      relatedConversationId: relatedConversationId || null,
      relatedMessageId: relatedMessageId || null,
    });

    res.status(201).json({ notification });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all notifications for the authenticated user
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notifications.findAll({
      where: { recipientId: userId },
      order: [["createdAt", "DESC"]],
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const notification = await Notifications.findOne({
      where: { notificationId, recipientId: userId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Mark notification as read error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notifications.update(
      { isRead: true },
      { where: { recipientId: userId, isRead: false } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
