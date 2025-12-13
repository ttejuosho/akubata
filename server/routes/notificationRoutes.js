// routes/notificationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";
import { io } from "../../server.js"; // Import Socket.IO instance

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

/**
 * Create a new notification
 * Body: { recipientId, type, message, relatedConversationId?, relatedMessageId? }
 * Emits real-time event to recipient via Socket.IO
 */
router.post("/", async (req, res, next) => {
  try {
    const notification = await createNotification(req, res);

    // Emit real-time notification to recipient
    const recipientId = req.body.recipientId;
    io.to(recipientId).emit("notification", notification);

    return notification;
  } catch (err) {
    next(err);
  }
});

// Get all notifications for the authenticated user
router.get("/", getUserNotifications);

// Mark a single notification as read
router.put("/:notificationId/read", markNotificationAsRead);

// Mark all notifications as read
router.put("/read/all", markAllNotificationsAsRead);

export default router;
