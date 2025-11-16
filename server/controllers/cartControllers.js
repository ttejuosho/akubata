import Order from "../models/Order.js";
import Product from "../models/Product.js";
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
      .json({ message: "Order created successfully", order: result });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Logic to get cart for userId
    res.json({
      message: `Fetched cart for user ${userId}`,
      cart: [{ quantity: 2 }], // Replace with actual cart data
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    // Logic to add item to cart for userId
    res.json({
      message: `Added product ${productId} (qty: ${quantity}) to cart for user ${userId}`,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;
    // Logic to remove item from cart for userId
    res.json({
      message: `Removed product ${productId} from cart for user ${userId}`,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkoutCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.productId;
    const quantity = req.params.quantity;
    console.log("Checkout cart called with:", productId, quantity);
    // Logic to checkout cart for userId
    res.status(200).json({
      message: `Checked out cart for user ${userId}`,
    });
  } catch (error) {
    console.error("Error checking out cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
