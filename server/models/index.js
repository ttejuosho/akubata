// models/index.js
import sequelize from "../config/db.js";

// Load models
import User from "./User.js";
import Address from "./Address.js";
import Supplier from "./Supplier.js";
import Product from "./Product.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import OrderPayment from "./OrderPayment.js";
import OrderAddress from "./OrderAddress.js";

import Conversation from "./Conversation.js";
import Message from "./Message.js";
import ConversationParticipant from "./ConversationParticipant.js";

import Notification from "./Notification.js";

// Initialize factory-defined models
//const Notification = NotificationFactory(sequelize);

/* ============================================================================================
 *  ASSOCIATIONS
 * ============================================================================================
 */

/* ---------------------- USER RELATIONS ---------------------- */

// User → Addresses
User.hasMany(Address, { foreignKey: "userId", onDelete: "CASCADE" });
Address.belongsTo(User, { foreignKey: "userId" });

// User → Orders
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

// User → Messages
User.hasMany(Message, { foreignKey: "senderId", onDelete: "CASCADE" });
Message.belongsTo(User, { foreignKey: "senderId" });

// User → ConversationParticipants
User.hasMany(ConversationParticipant, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
ConversationParticipant.belongsTo(User, { foreignKey: "userId" });

// User → Notifications
User.hasMany(Notification, { foreignKey: "recipientId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "recipientId" });

/* ---------------------- CONVERSATION RELATIONS ---------------------- */

// Conversation → Participants
Conversation.hasMany(ConversationParticipant, {
  foreignKey: "conversationId",
  onDelete: "CASCADE",
});
ConversationParticipant.belongsTo(Conversation, {
  foreignKey: "conversationId",
});

// Conversation → Messages
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  onDelete: "CASCADE",
});
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
});

// Conversation → Notifications (optional links)
Conversation.hasMany(Notification, {
  foreignKey: "relatedConversationId",
  onDelete: "SET NULL",
});
Notification.belongsTo(Conversation, {
  foreignKey: "relatedConversationId",
});

/* ---------------------- MESSAGE RELATIONS ---------------------- */

// Message → Notifications (e.g., "You received a message")
Message.hasMany(Notification, {
  foreignKey: "relatedMessageId",
  onDelete: "SET NULL",
});
Notification.belongsTo(Message, {
  foreignKey: "relatedMessageId",
});

/* ---------------------- PRODUCT / SUPPLIER RELATIONS ---------------------- */

// Supplier → Products
Supplier.hasMany(Product, { foreignKey: "supplierId", onDelete: "SET NULL" });
Product.belongsTo(Supplier, { foreignKey: "supplierId" });

/* ---------------------- ORDER RELATIONS ---------------------- */

// Order → OrderItems
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Order → OrderAddress
Order.hasMany(OrderAddress, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderAddress.belongsTo(Order, { foreignKey: "orderId" });

// Order → OrderPayment
Order.hasOne(OrderPayment, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderPayment.belongsTo(Order, { foreignKey: "orderId" });

/* ---------------------- PRODUCT / ORDERITEM RELATIONS ---------------------- */

// Product → OrderItems
Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "CASCADE" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

/* ============================================================================================
 *  EXPORTS
 * ============================================================================================
 */

export {
  sequelize,
  User,
  Address,
  Supplier,
  Product,
  Order,
  OrderItem,
  OrderPayment,
  OrderAddress,
  Conversation,
  ConversationParticipant,
  Message,
  Notification,
};
