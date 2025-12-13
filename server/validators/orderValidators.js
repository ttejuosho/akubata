const isUuidString = (value) => typeof value === "string" && value.length > 0;

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

const allowedStatuses = new Set([
  "pending",
  "completed",
  "cancelled",
  "open",
  "closed",
]);

export const validateCreateOrder = (req) => {
  const items = req.body?.items;

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Order must include at least one item" };
  }

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];

    if (!isUuidString(item?.productId)) {
      return { error: `Item ${i + 1} is missing a valid productId` };
    }

    if (!isPositiveInteger(Number(item?.quantity))) {
      return { error: `Item ${i + 1} must have a quantity greater than 0` };
    }
  }

  return {
    value: {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    },
  };
};

export const validateAddOrderItem = (req) => {
  const { orderId } = req.params;
  const { productId, quantity, price } = req.body ?? {};

  if (!isUuidString(orderId)) {
    return { error: "Order ID is required" };
  }

  if (!isUuidString(productId)) {
    return { error: "Product ID is required" };
  }

  if (!isPositiveInteger(Number(quantity))) {
    return { error: "Quantity must be greater than 0" };
  }

  if (Number.isNaN(Number(price)) || Number(price) <= 0) {
    return { error: "Price must be a positive number" };
  }

  return {
    value: {
      orderId,
      productId,
      quantity: Number(quantity),
      price: Number(price),
    },
  };
};

export const validateOrderIdParam = (req) => {
  const { orderId } = req.params ?? {};

  if (!isUuidString(orderId)) {
    return { error: "Order ID is required" };
  }

  return { value: { orderId } };
};

export const validateUpdateStatus = (req) => {
  const { orderId, orderStatus } = req.params ?? {};

  if (!isUuidString(orderId)) {
    return { error: "Order ID is required" };
  }

  if (!orderStatus || !allowedStatuses.has(orderStatus)) {
    return {
      error: `Order status must be one of: ${Array.from(allowedStatuses).join(
        ", "
      )}`,
    };
  }

  return { value: { orderId, orderStatus } };
};
