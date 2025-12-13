// controllers/messageController.js
import { v4 as uuidv4 } from "uuid";
import Message from "../models/Message.js";
import User from "../models/User.js";
import ConversationParticipant from "../models/ConversationParticipant.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/Notification.js";
import { io } from "../server.js";
import { Op } from "sequelize";

/**
 * Create a conversation or return an existing one between two users
 */
export const createConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "participantId is required" });
    }
    if (participantId === userId) {
      return res
        .status(400)
        .json({ message: "You cannot create a chat with yourself" });
    }

    // Check if a conversation already exists between the two users
    const existingConversation = await Conversation.findOne({
      include: [
        {
          model: ConversationParticipants,
          where: { userId: { [Op.in]: [userId, participantId] } },
          required: true,
        },
      ],
      group: ["Conversations.conversationId"],
      having: Sequelize.literal("COUNT(*) = 2"), // both participants included
    });

    if (existingConversation) {
      return res.json({ conversation: existingConversation });
    }

    // Create a new conversation
    const conversationId = uuidv4();

    const conversation = await Conversation.create({
      conversationId,
    });

    await ConversationParticipant.bulkCreate([
      {
        participantId: uuidv4(),
        conversationId,
        userId,
      },
      {
        participantId: uuidv4(),
        conversationId,
        userId: participantId,
      },
    ]);

    return res.status(201).json({ conversation });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserConversations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const conversations = await Conversation.findAll({
      include: [
        {
          model: ConversationParticipant,
          include: [
            { model: User, attributes: ["userId", "firstName", "lastName"] },
          ],
        },
        {
          model: Message,
          limit: 10,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    const formatted = conversations.map((conv) => {
      const participants = conv.ConversationParticipants.map((p) =>
        p.User.toJSON()
      );
      const messages = conv.Messages.map((m) => m.toJSON());

      const otherParticipants = participants.filter((p) => p.userId !== userId);
      const latestMessage = conv.Messages[0] || {};

      // Count unread messages for this user
      const unreadCount = messages.filter(
        (m) => !m.isRead && m.senderId !== userId
      ).length;

      return {
        conversationId: conv.conversationId,
        participants: otherParticipants,
        participantsName: otherParticipants.map((p) => p.firstName).join(", "),
        latestMessage,
        unreadCount,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

/**
 * Get all messages in a conversation
 */
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify user belongs to this conversation
    const isParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId },
    });

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
    });

    // Add isOwnMessage
    const formatted = messages.map((m) => ({
      ...m.toJSON(),
      isOwnMessage: m.senderId === userId,
    }));

    res.json({ messages: formatted });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Send a message
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.conversationId;
    const { content } = req.body;

    if (!conversationId || !content) {
      return res
        .status(400)
        .json({ message: "conversationId and content are required" });
    }

    // Ensure user belongs to this conversation
    const isParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId },
    });

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      messageId: uuidv4(),
      conversationId,
      senderId: userId,
      messageContent: content,
      isRead: false,
    });

    // update conversation updatedAt for sorting
    await Conversation.update(
      { updatedAt: new Date() },
      { where: { conversationId } }
    );

    // Emit message to all participants in the room
    io.to(conversationId).emit("newMessage", message);

    // --- CREATE NOTIFICATIONS ---
    const participants = await ConversationParticipant.findAll({
      where: { conversationId, userId: { [Op.ne]: userId } },
    });

    for (let p of participants) {
      const notification = await Notification.create({
        recipientId: p.userId,
        type: "message",
        notificationContent: `New message from ${req.user.firstName || "User"}`,
        relatedConversationId: conversationId,
        relatedMessageId: message.messageId,
      });

      // Emit real-time notification
      io.to(p.userId).emit("notification", notification);
    }

    res.status(201).json({ message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark all messages in a conversation as read by the user
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Only messages NOT sent by this user should be marked as read
    await Messages.update(
      { isRead: true },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: userId },
        },
      }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
