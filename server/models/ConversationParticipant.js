/**
 * ConversationParticipant Model
 * -----------------------------
 * Represents a user participating in a conversation.
 *
 * Significance:
 * - Tracks which users belong to which conversations.
 * - Supports querying participants and conversation membership.
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ConversationParticipant = sequelize.define(
  "ConversationParticipant",
  {
    participantId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "conversationParticipants",
    timestamps: true,
  }
);

export default ConversationParticipant;
