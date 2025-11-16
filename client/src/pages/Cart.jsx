import { useCart } from "../hooks/useCart";
import { Button } from "react-bootstrap";

const Cart = () => {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.Product.unitPrice),
    0
  );

  return (
    <div className="container mt-4">
      <h2>Your Cart</h2>
      <hr />

      {cart.length === 0 && <p>Your cart is empty.</p>}

      {cart.map((item) => (
        <div className="d-flex gap-3 mb-3" key={item.cartItemId}>
          <img
            src={item.Product.imageUrl}
            width={80}
            height={80}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
          <div className="flex-grow-1">
            <h5>{item.Product.productName}</h5>
            <p>Qty: {item.quantity}</p>
            <p>₦{(item.quantity * item.Product.unitPrice).toLocaleString()}</p>
          </div>

          <Button
            variant="danger"
            onClick={() => removeFromCart(item.cartItemId)}
          >
            Remove
          </Button>
        </div>
      ))}

      <h3>Total: ₦{total.toLocaleString()}</h3>
      <Button variant="primary" className="mt-3 w-100">
        Proceed to Checkout
      </Button>
    </div>
  );
};

export default Cart;
