/**
 * orderController.js
 *
 * Handles all Order-related operations for Akubata Inc.
 * Includes creating orders with order items, updating status, and fetching.
 */

import {
  addItemToOrder,
  createOrderForUser,
  deleteOrderWithRestock,
  fetchOrderById,
  listOrdersForRole,
  updateOrderStatus as updateOrderStatusService,
} from "../services/orderService.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = asyncHandler(async (req, res) => {
  const items = req.validated?.items ?? req.body.items;
  const order = await createOrderForUser(req.user.userId, items);
  res
    .status(201)
    .json({ message: "Order created successfully", orderId: order.orderId });
});

//** Get orders for logged-in user
// GET /api/orders/user
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await listOrdersForRole("basic", req.user.userId);
  res.status(200).json(orders);
});
/**
 * Get all orders
 * GET /api/orders
 */
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await listOrdersForRole(req.user.role, req.user.userId);
  res.status(200).json(orders);
});

/**
 * Get order by ID
 * GET /api/orders/:orderId
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.validated ?? req.params;
  const order = await fetchOrderById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(order);
});

/**
 * Update order status
 * PUT /api/orders/:orderId/:orderStatus
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, orderStatus } = req.validated ?? req.params;
  const order = await updateOrderStatusService(orderId, orderStatus);
  res.status(200).json({ message: "Order status updated", order });
});

/**
 * Delete an order
 * DELETE /api/orders/:id
 */
export const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.validated ?? req.params;
  await deleteOrderWithRestock(orderId);
  res.status(200).json({ message: "Order deleted successfully" });
});

// Add item to an existing order
// POST /api/orders/:orderId/items
export const addOrderItem = asyncHandler(async (req, res) => {
  const validated = req.validated ?? { ...req.params, ...req.body };
  const orderItem = await addItemToOrder(validated);
  res.status(201).json({
    message: "Item added to order successfully",
    orderItem,
  });
});
