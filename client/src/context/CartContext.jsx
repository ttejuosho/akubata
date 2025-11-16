import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [count, setCount] = useState(0);

  const loadCart = async () => {
    try {
      const { data } = await api.get("/carts");
      setCart(data.cart);
      setCount(data.cartItemsCount);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (productId, quantity) => {
    const { data } = await api.post("/carts/add", { productId, quantity });
    await loadCart();
    return data;
  };

  const removeFromCart = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    loadCart();
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, count, addToCart, removeFromCart, loadCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
