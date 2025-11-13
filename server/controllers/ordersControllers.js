/**
 * orderController.js
 *
 * Handles all Order-related operations for Akubata Inc.
 * Includes creating orders with order items, updating status, and fetching.
 */

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import OrderItem from "../models/OrderItem.js";

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item" });
    }

    // Start transaction
    const result = await Order.sequelize.transaction(async (t) => {
      // Create the order
      const order = await Order.create(
        { userId: "39252d06-f433-4bd7-8b39-e0eaa453e285", status: "completed" },
        { transaction: t }
      );

      // Loop through items and create order items
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        // Create order item
        await OrderItem.create(
          {
            orderId: order.orderId,
            productId: product.productId,
            quantity: item.quantity,
            price: product.unitPrice,
          },
          { transaction: t }
        );

        // Update product stock
        product.stockQuantity -= item.quantity;
        await product.save({ transaction: t });

        // Update order total
        order.totalAmount += item.quantity * parseFloat(product.unitPrice);
        await order.save({ transaction: t });
      }

      return order;
    });

    res
      .status(201)
      .json({ message: "Order created successfully", orderId: result.orderId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Server error" });
  }
};

//** Get orders for logged-in user
// GET /api/orders/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["productId", "productName", "category", "unitPrice"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all orders
 * GET /api/orders
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ["userId", "firstName", "lastName", "emailAddress"],
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["productId", "productName", "category", "unitPrice"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          attributes: ["userId", "firstName", "lastName", "emailAddress"],
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["productId", "productName", "category", "unitPrice"],
            },
          ],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update order status
 * PUT /api/orders/:orderId/:orderStatus
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus || order.orderStatus;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete an order
 * DELETE /api/orders/:id
 */
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, { include: [OrderItem] });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Return stock for each product
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.destroy();

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addOrderItem = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, quantity, price } = req.body;

    // Validate
    if (!productId || !quantity || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create order item
    const orderItem = await OrderItem.create({
      orderId,
      productId,
      quantity,
      price,
    });

    // Update order total
    order.totalAmount =
      parseFloat(order.totalAmount) + quantity * parseFloat(price);
    await order.save();

    res.status(201).json({
      message: "Item added to order successfully",
      orderItem,
    });
  } catch (error) {
    console.error("Error adding order item:", error);
    res.status(500).json({ message: "Server error" });
  }
};
