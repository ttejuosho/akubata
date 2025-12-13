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
  addOrderItem,
} from "../controllers/ordersControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateAddOrderItem,
  validateCreateOrder,
  validateOrderIdParam,
  validateUpdateStatus,
} from "../validators/orderValidators.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order with order items
// @access  Private
router.post("/", protect, validateRequest(validateCreateOrder), createOrder);

// @route   POST /api/orders/:orderId/items
// @desc    Add an item to an existing order
// @access  Private
//router.post("/:orderId/items", protect, addOrderItem);
router.post(
  "/:orderId/items",
  protect,
  validateRequest(validateAddOrderItem),
  addOrderItem
);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
//router.get("/", protect, getOrders);
router.get("/", protect, authorize("admin", "manager", "basic"), getOrders);

// @route   GET /api/orders/:orderId
// @desc    Get order by ID including items
// @access  Private
router.get(
  "/:orderId",
  protect,
  authorize("admin", "manager", "basic"),
  validateRequest(validateOrderIdParam),
  getOrderById
);

// @route   PUT /api/orders/:orderId/status
// @desc    Update order status
// @access  Private (admin or manager)
router.put(
  "/:orderId/:orderStatus",
  protect,
  authorize("admin", "manager"),
  validateRequest(validateUpdateStatus),
  updateOrderStatus
);

// @route   DELETE /api/orders/:orderId
// @desc    Delete an order
// @access  Private (admin only)
router.delete(
  "/:orderId",
  protect,
  authorize("admin"),
  validateRequest(validateOrderIdParam),
  deleteOrder
);

export default router;
