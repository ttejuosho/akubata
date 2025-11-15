/**
 * supplierRoutes.js
 *
 * Defines API routes for managing suppliers in Akubata Inc.
 * Routes are protected using JWT middleware.
 * Controller handles the actual logic.
 */

import express from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierByProduct,
} from "../controllers/suppliersControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ----------------------------------
// Supplier Routes
// ----------------------------------

// @route   POST /api/suppliers
// @desc    Create a new supplier
// @access  Private (only admin or manager)
//router.post("/", protect, authorize("admin", "manager"), createSupplier);
router.post("/", protect, createSupplier);

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
//router.get("/", protect, getSuppliers);
router.get("/", protect, getSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private
//router.get("/:supplierId", protect, getSupplierById);
router.get("/:supplierId", protect, getSupplierById);

// @route   GET /api/suppliers/byProduct/:productId
// @desc    Get supplier by Product Id
// @access  Private
router.get("/byProduct/:productId", protect, getSupplierByProduct);

// @route   PUT /api/suppliers/:id
// @desc    Update a supplier
// @access  Private (only admin or manager)
//router.put("/:supplierId", protect, authorize("admin", "manager"), updateSupplier);
router.put("/:supplierId", protect, updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Delete a supplier
// @access  Private (only admin)
//router.delete("/:supplierId", protect, authorize("admin"), deleteSupplier);
router.delete("/:supplierId", protect, deleteSupplier);

export default router;
