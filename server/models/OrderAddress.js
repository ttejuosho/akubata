import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Order from "./Order.js";

const OrderAddress = sequelize.define(
  "OrderAddress",
  {
    orderAddressId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: "orderId",
      },
      onDelete: "CASCADE",
    },

    orderAddressType: {
      type: DataTypes.ENUM("shipping", "billing"),
      allowNull: false,
    },

    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    addressLine1: { type: DataTypes.STRING, allowNull: false },
    addressLine2: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    zipCode: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "orderAddresses",
    timestamps: true,
  }
);

// Associations
Order.hasMany(OrderAddress, { foreignKey: "orderId", as: "addresses" });
OrderAddress.belongsTo(Order, { foreignKey: "orderId", as: "order" });

export default OrderAddress;
