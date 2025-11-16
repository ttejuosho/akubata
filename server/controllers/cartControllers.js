import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import OrderItem from "../models/OrderItem.js";
import { getOrderById } from "./ordersControllers.js";
/**
 * Create a new order
 * POST /api/orders
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        message: "Order must have at least one item",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    if (product.stockQuantity < quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    // Look for open order
    const openOrder = await Order.findOne({
      where: { userId: req.user.userId, orderStatus: "open" },
    });

    let result;

    // ------------------------------------------
    // CASE 1: No open order → Create new order
    // ------------------------------------------
    if (!openOrder) {
      result = await Order.sequelize.transaction(async (t) => {
        const order = await Order.create(
          { userId: req.user.userId, orderStatus: "open", totalAmount: 0 },
          { transaction: t }
        );

        // Create cart item
        await OrderItem.create(
          {
            orderId: order.orderId,
            productId: product.productId,
            quantity,
            price: product.unitPrice,
          },
          { transaction: t }
        );

        // Update stock
        product.stockQuantity -= quantity;
        await product.save({ transaction: t });

        // Update order total
        const itemTotal = quantity * Number(product.unitPrice);
        order.totalAmount = Number(order.totalAmount) + itemTotal;

        await order.save({ transaction: t });
        return order;
      });
    }

    // ------------------------------------------
    // CASE 2: Open order exists → Add/edit item
    // ------------------------------------------
    else {
      const existingCartItem = await OrderItem.findOne({
        where: { orderId: openOrder.orderId, productId: product.productId },
      });

      result = await OrderItem.sequelize.transaction(async (t) => {
        // Item already in cart → increase qty
        if (existingCartItem) {
          existingCartItem.quantity += quantity;
          await existingCartItem.save({ transaction: t });
        }

        // Item not in cart → create new item
        else {
          await OrderItem.create(
            {
              orderId: openOrder.orderId,
              productId: product.productId,
              quantity,
              price: product.unitPrice,
            },
            { transaction: t }
          );
        }

        // Update stock
        product.stockQuantity -= quantity;
        await product.save({ transaction: t });

        // Update order total
        const itemTotal = quantity * Number(product.unitPrice);
        openOrder.totalAmount =
          Number(openOrder.totalAmount) + Number(itemTotal);

        await openOrder.save({ transaction: t });
        return openOrder;
      });
    }

    // Convert totalAmount to 2 decimals for response
    result.totalAmount = Number(result.totalAmount).toFixed(2);

    res.status(201).json({
      message: "Order updated successfully",
      order: result,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Logic to get cart for userId
    // get order for logged in userId where orderStatus is open
    let order = await Order.findOne({
      where: { userId: userId, orderStatus: "open" },
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
    let result = order.toJSON();
    let cartTotalAmount = result.OrderItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    console.log(cartTotalAmount);

    res.json({
      message: `Fetched cart for user ${userId}`,
      cartTotalAmount: cartTotalAmount,
      cart: result.OrderItems, // Replace with actual cart data
      cartItemsCount: result.OrderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
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
