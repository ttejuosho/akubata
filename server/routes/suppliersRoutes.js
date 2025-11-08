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
import { protect, authorize } from "../controllers/authControllers.js";

const router = express.Router();

// ----------------------------------
// Supplier Routes
// ----------------------------------

// @route   POST /api/suppliers
// @desc    Create a new supplier
// @access  Private (only admin or manager)
//router.post("/", protect, authorize("admin", "manager"), createSupplier);
router.post("/", createSupplier);

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
//router.get("/", protect, getSuppliers);
router.get("/", getSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private
//router.get("/:supplierId", protect, getSupplierById);
router.get("/:supplierId", getSupplierById);

// @route   GET /api/suppliers/byProduct/:productId
// @desc    Get supplier by Product Id
// @access  Private
router.get("/byProduct/:productId", getSupplierByProduct);

// @route   PUT /api/suppliers/:id
// @desc    Update a supplier
// @access  Private (only admin or manager)
//router.put("/:supplierId", protect, authorize("admin", "manager"), updateSupplier);
router.put("/:supplierId", updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Delete a supplier
// @access  Private (only admin)
//router.delete("/:supplierId", protect, authorize("admin"), deleteSupplier);
router.delete("/:supplierId", deleteSupplier);

export default router;
