// Cart.jsx
import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import CartItem from "../components/CartItem";
import Divider from "../components/Divider";

export default function CartPage() {
  const [removingId, setRemovingId] = useState(null);
  const { loading, cart, updateCartItem, removeItemFromCart } = useCart();

  const updateQuantity = async (productId, qty) => {
    try {
      await updateCartItem(productId, Number(qty));
      toast.success("Cart Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const removeItem = (productId, quantity) => {
    setRemovingId(productId);

    // Delay for animation before hitting API
    setTimeout(async () => {
      try {
        await removeItemFromCart(productId, quantity);
        toast.success("Cart Updated");
      } catch {
        toast.error("Failed to remove item");
      } finally {
        setRemovingId(null);
      }
    }, 350); // match CSS duration
  };

  if (loading || !cart || !cart.items) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Spinner animation="border" />
      </div>
    );
  }

  const hasItems = cart.items.length > 0;

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      {/* ---------------------------------- TOP TOTAL ---------------------------------- */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          Your bag total is ₦
          {new Intl.NumberFormat("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(cart.totalAmount)}
        </h2>
        <p className="text-muted">Free delivery and free returns.</p>

        {/* Check Out Buttons */}
        {hasItems && (
          <div className="d-flex justify-content-center gap-3 mt-3">
            <Link to="/store" className="btn btn-outline-primary px-4 py-2">
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              style={{
                backgroundColor: "#237bd3",
                borderColor: "#237bd3",
                color: "#fff",
              }}
              className="btn px-4 py-2"
            >
              Check Out
            </Link>
          </div>
        )}
      </div>

      <Divider />

      {/* ------------------------ CART ITEMS ------------------------ */}
      {cart.items.map((item) => (
        <CartItem
          key={item.orderItemId}
          removingId={removingId}
          item={item}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      ))}

      {/* ------------------ ORDER SUMMARY ------------------ */}
      {hasItems && (
        <div className="mt-4">
          <h5 className="fw-semibold mb-3">Summary</h5>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Subtotal</span>
            <span>
              ₦
              {new Intl.NumberFormat("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(cart.totalAmount)}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Shipping</span>
            <span>FREE</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Estimated Tax</span>
            <span>₦0.00</span>
          </div>

          <Divider />

          <div className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold">Total</h4>
            <h4 className="fw-bold text-dark">
              ₦
              {new Intl.NumberFormat("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(cart.totalAmount)}
            </h4>
          </div>

          {/* Bottom buttons */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Link to="/store" className="btn btn-outline-primary px-4 py-2">
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              style={{
                backgroundColor: "#237bd3",
                borderColor: "#237bd3",
                color: "#fff",
              }}
              className="btn px-4 py-2"
            >
              Check Out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
