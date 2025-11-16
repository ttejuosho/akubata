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
    const { productId, quantity } = req.body; // items: [{ productId, quantity }]
    if (!productId || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item" });
    }

    const product = await Product.findByPk(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    if (product.stockQuantity < quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    //Check for open orders for the user
    const openOrder = await Order.findOne({
      where: { userId: req.user.userId, orderStatus: "open" },
    });

    console.log("OPEN ORDER FOUND", openOrder.orderId);
    let result = null;

    if (openOrder == null) {
      // Start transaction
      result = await Order.sequelize.transaction(async (t) => {
        // Create the order
        const order = await Order.create(
          { userId: req.user.userId, orderStatus: "open" },
          { transaction: t }
        );

        // Create order item
        await OrderItem.create(
          {
            orderId: order.orderId,
            productId: product.productId,
            quantity: quantity,
            price: product.unitPrice,
          },
          { transaction: t }
        );

        // Update product stock
        product.stockQuantity -= quantity;
        await product.save({ transaction: t });

        // Update order total
        (order.totalAmount += quantity * parseFloat(product.unitPrice)).toFixed(
          2
        );
        await order.save({ transaction: t });

        return order;
      });
    } else {
      // check if item already exists in cart, if true, increase quantity
      const existingCartItem = await OrderItem.findOne({
        where: { orderId: openOrder.orderId, productId: product.productId },
      });

      if (existingCartItem !== null) {
        result = await OrderItem.sequelize.transaction(async (t) => {
          existingCartItem.quantity += quantity;
          product.stockQuantity -= quantity;
          await existingCartItem.save({ transaction: t });
          await product.save({ transaction: t });
          let orderTotal = (quantity * product.unitPrice).toFixed(2);
          console.log(orderTotal);
          openOrder.totalAmount += parseFloat(orderTotal);
          let oota =
            parseFloat(openOrder.totalAmount).toFixed(2) +
            parseFloat(orderTotal).toFixed(2);
          openOrder.totalAmount = parseFloat(oota).toFixed(2);
          console.log(parseFloat(oota).toFixed(2));
          await openOrder.save({ transaction: t });
          return openOrder;
        });
      } else {
        result = await OrderItem.sequelize.transaction(async (t) => {
          await OrderItem.create(
            {
              orderId: openOrder.orderId,
              productId: product.productId,
              quantity: quantity,
              price: product.unitPrice,
            },
            { transaction: t }
          );
          // Update product stock
          product.stockQuantity -= quantity;
          await product.save({ transaction: t });

          // Update order total
          let orderTotal = (quantity * product.unitPrice).toFixed(2);
          console.log("orderTotal", orderTotal);
          console.log("Open Order Total", parseFloat(openOrder.totalAmount));
          openOrder.totalAmount += parseFloat(orderTotal);
          let oota =
            parseFloat(openOrder.totalAmount).toFixed(2) +
            parseFloat(orderTotal);
          console.log(oota);
          openOrder.totalAmount = parseFloat(oota).toFixed(2);

          await openOrder.save({ transaction: t });

          return openOrder;
        });
      }
    }

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
