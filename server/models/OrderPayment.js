// models/OrderPayment.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Order from "./Order.js";

const OrderPayment = sequelize.define(
  "OrderPayment",
  {
    orderPaymentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Order, key: "orderId" },
      onDelete: "CASCADE",
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "credit card",
        "paypal",
        "bank transfer",
        "check",
        "cryptocurrency",
        "apple pay",
        "google pay"
      ),
      allowNull: false,
    },

    cardBrand: { type: DataTypes.STRING, allowNull: true }, // Visa, Mastercard, etc.
    cardLast4: { type: DataTypes.STRING(4), allowNull: true },

    // universal transaction identifier
    transactionId: { type: DataTypes.STRING(255), allowNull: true },

    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
  },
  { tableName: "orderPayments", timestamps: true }
);

// Relationship: 1 Order → 1 Payment
Order.hasOne(OrderPayment, { foreignKey: "orderId", as: "payment" });
OrderPayment.belongsTo(Order, { foreignKey: "orderId", as: "order" });

export default OrderPayment;
