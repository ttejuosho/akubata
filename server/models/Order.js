// models/Order.js
/**
 * Order Model
 * ----------------
 * This model represents customer orders within Akubata Inc.’s inventory system.
 * Each order tracks which user placed it, the products included, quantities,
 * total price, and the current order status.
 *
 * Significance:
 * - Connects users to products, allowing the system to process and track sales.
 * - Enables stock adjustments in the Product model after each order.
 * - Supports reporting on sales, inventory turnover, and order history.
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Order = sequelize.define(
  "Order",
  {
    orderId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    orderStatus: {
      type: DataTypes.ENUM(
        "pending",
        "completed",
        "cancelled",
        "open",
        "closed"
      ),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        "credit card",
        "check",
        "bank transfer",
        "cryptocurrency"
      ),
      defaultValue: "credit card",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;
