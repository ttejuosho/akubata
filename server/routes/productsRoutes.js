/**
 * productRoutes.js
 *
 * Defines API routes for managing products in Akubata Inc.
 * Routes are protected using JWT middleware.
 * Controller handles the actual logic.
 */

import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySupplier,
} from "../controllers/productsControllers.js";
import { protect, authorize } from "../controllers/authControllers.js";

const router = express.Router();

// ----------------------------------
// Product Routes
// ----------------------------------

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (admin or manager)
//router.post("/", protect, authorize("admin", "manager"), createProduct);
router.post("/", createProduct);

// @route   GET /api/products
// @desc    Get all products
// @access  Private
//router.get("/", protect, getProducts);
router.get("/", getProducts);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
//router.get("/:productId", protect, getProductById);
router.get("/:productId", getProductById);

// @route   GET /api/products/bySupplier/:supplierId
// @desc    Get product by Supplier Id
// @access  Private
router.get("/bySupplier/:supplierId", getProductsBySupplier);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (admin or manager)
// router.put(
//   "/:productId",
//   protect,
//   authorize("admin", "manager"),
//   updateProduct
// );
router.put("/:productId", updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (admin only)
//router.delete("/:productId", protect, authorize("admin"), deleteProduct);
router.delete("/:productId", deleteProduct);

export default router;
