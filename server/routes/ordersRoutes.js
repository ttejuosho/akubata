/**
 * orderRoutes.js
 *
 * Defines API routes for managing orders in Akubata Inc.
 * Routes are protected using JWT middleware.
 * Controller handles the actual logic.
 */

import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/ordersControllers.js";
import { protect, authorize } from "../controllers/authControllers.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order with order items
// @access  Private
router.post("/", protect, createOrder);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get("/", protect, getOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID including items
// @access  Private
router.get("/:orderId", protect, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (admin or manager)
router.put(
  "/:orderId/:orderStatus",
  protect,
  authorize("admin", "manager"),
  updateOrderStatus
);

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Private (admin only)
router.delete("/:orderId", protect, authorize("admin"), deleteOrder);

export default router;
