import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const serializeOrderTotals = (order) => {
  if (!order) return order;
  return {
    ...order.toJSON(),
    totalAmount: Number(order.totalAmount).toFixed(2),
  };
};

export const createOrderForUser = async (userId, items) => {
  if (!userId) {
    throw new Error("User context is required to create an order");
  }

  return Order.sequelize.transaction(async (t) => {
    const order = await Order.create(
      { userId, orderStatus: "completed", totalAmount: 0 },
      { transaction: t }
    );

    let runningTotal = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.productName}`
        );
      }

      await OrderItem.create(
        {
          orderId: order.orderId,
          productId: product.productId,
          quantity: item.quantity,
          price: product.unitPrice,
        },
        { transaction: t }
      );

      product.stockQuantity -= item.quantity;
      await product.save({ transaction: t });

      runningTotal += item.quantity * Number(product.unitPrice);
    }

    order.totalAmount = Number(order.totalAmount) + runningTotal;
    await order.save({ transaction: t });

    return order;
  });
};

export const addItemToOrder = async ({
  orderId,
  productId,
  quantity,
  price,
}) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const product = await Product.findByPk(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  return OrderItem.sequelize.transaction(async (t) => {
    const orderItem = await OrderItem.create(
      { orderId, productId, quantity, price },
      { transaction: t }
    );

    order.totalAmount =
      Number(order.totalAmount) + quantity * Number(price ?? product.unitPrice);
    await order.save({ transaction: t });

    return orderItem;
  });
};

const adminOrderQuery = {
  include: [
    {
      model: OrderItem,
      include: [
        {
          model: Product,
          attributes: [
            "productId",
            "productName",
            "category",
            "unitPrice",
            "imageUrl",
          ],
        },
      ],
    },
  ],
  order: [["createdAt", "DESC"]],
};

const managerOrderQuery = {
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
};

const basicOrderQuery = (userId) => ({
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

export const listOrdersForRole = async (role, userId) => {
  if (role === "admin") {
    return Order.findAll(adminOrderQuery);
  }

  if (role === "manager") {
    return Order.findAll(managerOrderQuery);
  }

  if (role === "basic") {
    return Order.findAll(basicOrderQuery(userId));
  }

  throw new Error("Unauthorized role for listing orders");
};

export const fetchOrderById = (orderId) =>
  Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: Product,
            attributes: [
              "productId",
              "productName",
              "imageUrl",
              "category",
              "unitPrice",
            ],
          },
        ],
      },
    ],
  });

export const updateOrderStatus = async (orderId, orderStatus) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  order.orderStatus = orderStatus || order.orderStatus;
  await order.save();

  return serializeOrderTotals(order);
};

export const deleteOrderWithRestock = async (orderId) => {
  const order = await Order.findByPk(orderId, { include: [OrderItem] });

  if (!order) {
    throw new Error("Order not found");
  }

  await Order.sequelize.transaction(async (t) => {
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (product) {
        product.stockQuantity += item.quantity;
        await product.save({ transaction: t });
      }

      await item.destroy({ transaction: t });
    }

    await order.destroy({ transaction: t });
  });

  return true;
};
