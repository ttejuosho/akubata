// models/Supplier.js
/**
 * Supplier Model
 * ----------------
 * This model represents product suppliers in the Akubata Inc. inventory system.
 * Each supplier record stores information such as company name, contact details,
 * and address. Products in the system will reference suppliers via a foreign key.
 *
 * Significance:
 * - Keeps track of all vendors providing inventory to the store.
 * - Enables relationship mapping between products and their respective suppliers.
 * - Useful for generating reports, managing reorders, and maintaining supplier history.
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Supplier = sequelize.define(
  "Supplier",
  {
    supplierId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "suppliers",
    timestamps: true,
  }
);

export default Supplier;
