/**
 * Conversation Model
 * -----------------
 * Represents a chat conversation between one or multiple users.
 * Can be a group or a 1-on-1 conversation.
 *
 * Significance:
 * - Holds the basic conversation metadata.
 * - Linked to participants and messages for querying.
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import ConversationParticipant from "./ConversationParticipant.js";
import Message from "./Message.js";

const Conversation = sequelize.define(
  "Conversation",
  {
    conversationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
  }
);

export default Conversation;
