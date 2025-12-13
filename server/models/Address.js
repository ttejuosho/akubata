// models/Address.js

import { DataTypes, Op } from "sequelize";
import sequelize from "../config/db.js"; // your Sequelize instance
import User from "./User.js";

const Address = sequelize.define(
  "Address",
  {
    addressId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: {
      //   model: User,
      //   key: "userId",
      // },
      onDelete: "CASCADE",
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    recipientFirstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    recipientLastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    addressLine1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    hooks: {
      beforeCreate: async (address) => {
        if (address.isDefault) {
          await Address.update(
            { isDefault: false },
            { where: { userId: address.userId, isDefault: true } }
          );
        }
      },
      beforeUpdate: async (address) => {
        if (address.changed("isDefault") && address.isDefault) {
          await Address.update(
            { isDefault: false },
            {
              where: {
                userId: address.userId,
                isDefault: true,
                addressId: { [Op.ne]: address.addressId },
              },
            }
          );
        }
      },
    },
  }
);

export default Address;
