// routes/messageRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markAsRead,
} from "../controllers/messageControllers.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Create a new conversation (or return existing between 2 users)
router.post("/conversations", createConversation);

// Get all conversations for the authenticated user
router.get("/", getUserConversations);

// Get all messages in a conversation
router.get("/:conversationId", getConversationMessages);

// Send a message
router.post("/:conversationId", sendMessage);

// Mark conversation messages as read
router.put("/:conversationId/read", markAsRead);

export default router;
