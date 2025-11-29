import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalAmount: 0,
    cartItemsCount: 0,
  });

  const [cartTotal, setCartTotal] = useState("0.00");
  const [count, setCount] = useState(0);
  const [buyNowItem, setBuyNowItem] = useState(null);

  // ------------------------------------------------------
  // 🔄 Load cart from DB on mount
  // ------------------------------------------------------
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get("/carts");
        setCart(data.cart);
        setCount(data.cart.cartItemsCount || 0);
        setCartTotal(Number(data.cart.totalAmount).toFixed(2) || "0.00");
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };
    fetchCart();
  }, []);

  const getCart = async () => {
    try {
      const { data } = await api.get("/carts");
      setCart(data.cart);
      setCount(data.cart.cartItemsCount);
      setCartTotal(data.cart.totalAmount);
    } catch (err) {
      console.error(err);
    } finally {
      //setLoading(false);
    }
  };

  // ------------------------------------------------------
  // 🛒 Add item to cart
  // ------------------------------------------------------
  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post("/carts", { productId, quantity });
      await getCart();
    } catch (err) {
      console.error("Add to cart failed:", err);
      throw err;
    }
  };

  // ------------------------------------------------------
  // ♻️ Update cart item quantity
  // ------------------------------------------------------
  const updateCartItem = async (productId, quantity) => {
    try {
      if (buyNowItem) {
        setBuyNowItem({
          cartItemsCount: quantity,
          totalAmount: quantity * Number(buyNowItem.items[0].price),
          items: [
            {
              quantity: quantity,
              productTotalPrice: quantity * Number(buyNowItem.items[0].price),
              price: buyNowItem.items[0].price,
              productName: buyNowItem.items[0].productName,
              productId: buyNowItem.items[0].productId,
              itemTotal: quantity * Number(buyNowItem.items[0].price),
              product: {
                productId: buyNowItem.items[0].product.productId,
                productName: buyNowItem.items[0].product.productName,
                imageUrl: buyNowItem.items[0].product.imageUrl,
                unitPrice: buyNowItem.items[0].product.unitPrice,
                stockQuantity: buyNowItem.items[0].product.stockQuantity,
              },
            },
          ],
        });
      } else {
        await api.put("/carts", { productId, quantity });
        await getCart();
      }
    } catch (err) {
      console.error("Update failed:", err.message);
      toast.error("Unable to update quantity.");
    }
  };

  // ------------------------------------------------------
  // ❌ Remove item from cart
  // ------------------------------------------------------
  const removeItemFromCart = async (productId, quantity) => {
    try {
      await api.post("/carts/remove", { productId, quantity });
      await getCart();
    } catch (err) {
      console.error("Remove failed:", err.message);
      toast.error("Unable to remove item.");
    }
  };

  // ------------------------------------------------------
  // 🧹 Clear server cart (explicit "Clear Cart" button)
  // ------------------------------------------------------
  const clearCart = async () => {
    try {
      await api.delete("/cart");
      clearCartState();
    } catch (err) {
      console.error("Clear cart failed:", err);
      toast.error("Unable to clear cart.");
    }
  };

  // ------------------------------------------------------
  // 🔄 Local state reset (Used for logout)
  // ------------------------------------------------------
  const clearCartState = () => {
    setCart({
      items: [],
      totalAmount: 0,
      cartItemsCount: 0,
    });
    setCount(0);
    setCartTotal("0.00");
    setBuyNowItem(null);
  };

  // ------------------------------------------------------
  // ⚡ BUY NOW (one-item checkout flow)
  // ------------------------------------------------------
  const startBuyNow = async (productId, quantity = 1) => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      const cart = {
        cartItemsCount: quantity,
        items: [
          {
            product: data,
            itemTotal: Number(data.unitPrice) * quantity,
            price: Number(data.unitPrice),
            productId: productId,
            productName: data.productName,
            productTotalPrice: Number(data.unitPrice) * quantity,
            quantity: quantity,
          },
        ],
        totalAmount: Number(data.unitPrice) * quantity,
      };
      setBuyNowItem(cart);
    } catch (err) {
      console.error("Buy Now error:", err);
    }
    // const { data } = api.get(`/products/${productId}`);
    // setBuyNowItem({
    //   productId,
    //   product: data,
    //   quantity,
    //   totalAmount: quantity * Number(data.unitPrice),
    // });
  };

  const clearBuyNow = () => setBuyNowItem(null);

  // ------------------------------------------------------
  // 🔌 Context Value
  // ------------------------------------------------------
  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        count,

        addToCart,
        getCart,
        updateCartItem,
        removeItemFromCart,
        clearCart,
        clearCartState,

        buyNowItem,
        startBuyNow,
        clearBuyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
