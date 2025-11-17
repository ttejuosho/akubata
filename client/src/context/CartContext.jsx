import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [count, setCount] = useState(0);

  const getCart = async () => {
    try {
      const { data } = await api.get("/carts");
      setCart(data.cart);
      setCount(data.cart.cartItemsCount);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (productId, quantity) => {
    const { data } = await api.post("/carts", { productId, quantity });
    await getCart();
    return data.order;
  };

  const removeFromCart = async (cartItemId) => {
    await api.delete(`/carts/${cartItemId}`);
    getCart();
  };

  const updateCartItem = async (productId, quantity) => {
    await api.put("/carts", { productId, quantity });
    await getCart();
  };

  const clearCart = async () => {
    await api.post("/carts/clear");
    await getCart();
  };

  const clearCartState = () => {
    setCart([]);
    setCount(0);
  };

  useEffect(() => {
    getCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        addToCart,
        removeFromCart,
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
