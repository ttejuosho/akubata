/**
 * Message Model
 * -------------
 * Represents an individual message sent in a conversation.
 *
 * Significance:
 * - Stores the message content, sender, read status, and timestamp.
 * - Linked to conversation for history retrieval.
 * - Supports marking messages as read/unread.
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Message = sequelize.define(
  "Message",
  {
    messageId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    messageContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

export default Message;
