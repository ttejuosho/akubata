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
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  addOrderItem,
} from "../controllers/ordersControllers.js";
import { protect, authorize } from "../controllers/authControllers.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order with order items
// @access  Private
//router.post("/", protect, createOrder);
router.post("/", createOrder);
router.post("/:orderId/items", addOrderItem);
// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
//router.get("/", protect, getOrders);
router.get("/all", getOrders);
router.get("/", protect, getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID including items
// @access  Private
//router.get("/:orderId", protect, getOrderById);
router.get("/:orderId", getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (admin or manager)
// router.put(
//   "/:orderId/:orderStatus",
//   protect,
//   authorize("admin", "manager"),
//   updateOrderStatus
// );
router.put("/:orderId/:orderStatus", updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Private (admin only)
//router.delete("/:orderId", protect, authorize("admin"), deleteOrder);
router.delete("/:orderId", deleteOrder);

export default router;
