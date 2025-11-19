// CartContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalAmount: 0,
    cartItemsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [cartTotal, setCartTotal] = useState("0.00");

  const getCart = async () => {
    try {
      const { data } = await api.get("/carts");
      setCart(data.cart);
      setCount(data.cart.cartItemsCount);
      setCartTotal(data.cart.totalAmount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    const { data } = await api.post("/carts", { productId, quantity });
    await getCart();
    return data.order;
  };

  const removeItemFromCart = async (productId, quantity) => {
    await api.post(`/carts/remove`, { productId, quantity });
    return getCart();
  };

  const updateCartItem = async (productId, quantity) => {
    await api.put("/carts", { productId, quantity });
    return getCart();
  };

  const clearCart = async () => {
    await api.delete("/carts");
    await getCart();
  };

  const clearCartState = () => {
    setCart([]);
    setCount(0);
    setCartTotal("0.00");
  };

  useEffect(() => {
    getCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        loading,
        cartTotal,
        addToCart,
        removeItemFromCart,
        updateCartItem,
        clearCart,
        getCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
