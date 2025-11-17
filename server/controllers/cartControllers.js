import Order from "../models/Order.js";
import Product from "../models/Product.js";
import OrderItem from "../models/OrderItem.js";

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
    // Find user's open order
    const openOrder = await Order.findOne({
      where: { userId: req.user.userId, orderStatus: "open" },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: [
                "productId",
                "productName",
                "unitPrice",
                "stockQuantity",
                "imageUrl",
              ],
            },
          ],
        },
      ],
    });

    // No open order → return empty cart
    if (!openOrder) {
      return res.status(200).json({
        cart: {
          items: [],
          totalAmount: "0.00",
        },
      });
    }

    // Recalculate total from DB just to ensure accuracy
    let computedTotal = 0;

    const items = openOrder.OrderItems.map((item) => {
      const itemTotal = item.quantity * Number(item.price);
      computedTotal += itemTotal;

      return {
        orderItemId: item.orderItemId,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price).toFixed(2),
        productName: item.Product.productName,
        itemTotal: itemTotal.toFixed(2),
        product: {
          productId: item.Product.productId,
          productName: item.Product.productName,
          unitPrice: Number(item.Product.unitPrice).toFixed(2),
          stockQuantity: item.Product.stockQuantity,
          imageUrl: item.Product.imageUrl,
        },
      };
    });

    // Format totalAmount
    const formattedTotal = computedTotal.toFixed(2);

    // Sync DB total if it differs (optional but recommended)
    if (Number(openOrder.totalAmount) !== computedTotal) {
      openOrder.totalAmount = computedTotal;
      await openOrder.save();
    }
    // Calculate cart items count
    const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      cart: {
        orderId: openOrder.orderId,
        items,
        totalAmount: formattedTotal,
        cartItemsCount: cartItemsCount,
      },
    });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid request — productId and quantity are required",
      });
    }

    // Find user's open order
    const openOrder = await Order.findOne({
      where: { userId: req.user.userId, orderStatus: "open" },
    });

    if (!openOrder) {
      return res.status(404).json({
        message: "No open order found for this user",
      });
    }

    // Check if item exists in order
    const cartItem = await OrderItem.findOne({
      where: { orderId: openOrder.orderId, productId },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    // Get product reference
    const product = await Product.findByPk(productId);

    let result = await OrderItem.sequelize.transaction(async (t) => {
      // ---------------------------
      // CASE 1: quantity < existing → reduce quantity
      // ---------------------------
      if (quantity < cartItem.quantity) {
        cartItem.quantity -= quantity;
        await cartItem.save({ transaction: t });

        // Restore stock
        product.stockQuantity += quantity;
        await product.save({ transaction: t });

        // Update order total
        const itemTotal = quantity * Number(product.unitPrice);
        openOrder.totalAmount =
          Number(openOrder.totalAmount) - Number(itemTotal);

        await openOrder.save({ transaction: t });
      }

      // ---------------------------
      // CASE 2: quantity >= existing → remove entire item
      // ---------------------------
      else {
        // Restore stock fully
        product.stockQuantity += cartItem.quantity;
        await product.save({ transaction: t });

        // Subtract full value of this cart item
        const itemTotal = cartItem.quantity * Number(cartItem.price);
        openOrder.totalAmount =
          Number(openOrder.totalAmount) - Number(itemTotal);

        await cartItem.destroy({ transaction: t });
        await openOrder.save({ transaction: t });
      }

      // ---------------------------
      // CASE 3: if order total becomes 0 → close order or delete it
      // ---------------------------
      const remainingItems = await OrderItem.count({
        where: { orderId: openOrder.orderId },
        transaction: t,
      });

      if (remainingItems === 0) {
        // Option 1: Close order
        openOrder.orderStatus = "closed";
        openOrder.totalAmount = 0;
        await openOrder.save({ transaction: t });

        // Option 2: Delete order
        // await openOrder.destroy({ transaction: t });

        return { closed: true, order: openOrder };
      }

      return { closed: false, order: openOrder };
    });

    result.order.totalAmount = Number(result.order.totalAmount).toFixed(2);

    if (result.closed) {
      return res.status(200).json({
        message: "All items removed — order closed",
        order: result.order,
      });
    }

    res.status(200).json({
      message: "Item removed from cart",
      order: result.order,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 0) {
      return res.status(400).json({
        message: "Invalid request — productId and new quantity required",
      });
    }

    // Find active order
    const openOrder = await Order.findOne({
      where: { userId: req.user.userId, orderStatus: "open" },
    });

    if (!openOrder) {
      return res.status(404).json({
        message: "No open order found",
      });
    }

    // Find the existing item
    const cartItem = await OrderItem.findOne({
      where: { orderId: openOrder.orderId, productId },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "This product is not in your cart",
      });
    }

    const product = await Product.findByPk(productId);

    const oldQty = cartItem.quantity;
    const newQty = quantity;

    let result = await OrderItem.sequelize.transaction(async (t) => {
      // ---------------------------------------------------
      // CASE 1: new quantity is 0 → remove item entirely
      // ---------------------------------------------------
      if (newQty === 0) {
        // Return all stock
        product.stockQuantity += oldQty;
        await product.save({ transaction: t });

        // Subtract old item total from order
        const itemTotal = oldQty * Number(cartItem.price);
        openOrder.totalAmount =
          Number(openOrder.totalAmount) - Number(itemTotal);

        await openOrder.save({ transaction: t });
        await cartItem.destroy({ transaction: t });

        // If no items left → close the order
        const count = await OrderItem.count({
          where: { orderId: openOrder.orderId },
          transaction: t,
        });

        if (count === 0) {
          openOrder.orderStatus = "closed";
          openOrder.totalAmount = 0;
          await openOrder.save({ transaction: t });

          return { closed: true, order: openOrder };
        }

        return { closed: false, order: openOrder };
      }

      // ---------------------------------------------------
      // CASE 2: new quantity < old quantity → reduce quantity
      // ---------------------------------------------------
      if (newQty < oldQty) {
        const diff = oldQty - newQty;

        // Return stock
        product.stockQuantity += diff;
        await product.save({ transaction: t });

        // Update item
        cartItem.quantity = newQty;
        await cartItem.save({ transaction: t });

        // Update order total
        const itemTotal = diff * Number(cartItem.price);
        openOrder.totalAmount =
          Number(openOrder.totalAmount) - Number(itemTotal);

        await openOrder.save({ transaction: t });
      }

      // ---------------------------------------------------
      // CASE 3: new quantity > old quantity → increase
      // ---------------------------------------------------
      if (newQty > oldQty) {
        const diff = newQty - oldQty;

        if (product.stockQuantity < diff) {
          throw new Error("Insufficient stock available");
        }

        // Deduct stock
        product.stockQuantity -= diff;
        await product.save({ transaction: t });

        // Update item
        cartItem.quantity = newQty;
        await cartItem.save({ transaction: t });

        // Update order total
        const itemTotal = diff * Number(cartItem.price);
        openOrder.totalAmount =
          Number(openOrder.totalAmount) + Number(itemTotal);

        await openOrder.save({ transaction: t });
      }

      return { closed: false, order: openOrder };
    });

    result.order.totalAmount = Number(result.order.totalAmount).toFixed(2);

    if (result.closed) {
      return res.status(200).json({
        message: "Item removed — order is now empty and closed",
        order: result.order,
      });
    }

    return res.status(200).json({
      message: "Cart item updated successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const resetCart = async (req, res) => {
  return res.json({
    cart: { items: [], totalAmount: "0.00", cartItemsCount: 0 },
  });
};

export const clearCart = async (req, res) => {
  try {
    // Get the user's open order
    const openOrder = await Order.findOne({
      where: { userId: req.user.userId, orderStatus: "open" },
      include: [{ model: OrderItem }],
    });

    if (!openOrder) {
      return res.status(200).json({
        message: "Cart is already empty",
        cart: { items: [], totalAmount: "0.00" },
      });
    }

    await Order.sequelize.transaction(async (t) => {
      // Loop through each item and restore stock
      for (const item of openOrder.OrderItems) {
        const product = await Product.findByPk(item.productId);

        if (product) {
          product.stockQuantity += item.quantity;
          await product.save({ transaction: t });
        }

        // Remove the order item
        await item.destroy({ transaction: t });
      }

      // delete the order
      await openOrder.destroy({ transaction: t });
    });

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart: {
        items: [],
        totalAmount: "0.00",
      },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
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
