// models/Product.js
/**
 * Product Model
 * ----------------
 * This model represents the products managed within Akubata Inc.’s inventory system.
 * Each product record contains details such as name, category, stock quantity,
 * pricing, and a reference to the supplier that provides it.
 *
 * Significance:
 * - Central to the inventory management process — all sales and stock tracking
 *   revolve around these records.
 * - Each product links to a supplier via `supplierId`, ensuring traceability
 *   of stock sources.
 * - Ties into the Order model to manage purchases, sales, and inventory changes.
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Supplier from "./Supplier.js";

const Product = sequelize.define(
  "Product",
  {
    productId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL to the product image",
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

export default Product;
