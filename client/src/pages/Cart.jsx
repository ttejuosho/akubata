import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Form, Button, Card, Row, Col } from "react-bootstrap";

export default function CartPage() {
  const [cart, setCart] = useState({
    items: [],
    totalAmount: "0.00",
    cartItemsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const { data } = await api.get("/carts");
      setCart(data.cart);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart", err);
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    try {
      await api.put(`/carts`, {
        productId: productId,
        quantity: Number(newQty),
      });
      fetchCart(); // refresh cart
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  const removeItem = async (orderItemId) => {
    try {
      await axios.delete(`/cart/remove/${orderItemId}`);
      fetchCart();
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <div>Loading cart...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Your Cart</h2>

      {/* EMPTY CART */}
      {cart.items.length === 0 && (
        <div className="text-center">
          <h4>Your cart is empty</h4>
          <Link to="/products" className="btn btn-primary mt-3">
            Browse Products
          </Link>
        </div>
      )}

      {cart.items.map((item) => (
        <Card key={item.orderItemId} className="mb-3 p-3 shadow-sm">
          <Row>
            {/* Product Image */}
            <Col md={2} className="d-flex align-items-center">
              <img
                src={item.product.imageUrl}
                alt={item.productName}
                className="img-fluid rounded"
              />
            </Col>

            {/* Product Info */}
            <Col md={4}>
              <h5>{item.productName}</h5>
              <p className="text-muted">${item.product.unitPrice}</p>
              <p className="small text-muted">
                In stock: {item.product.stockQuantity}
              </p>
            </Col>

            {/* Quantity */}
            <Col md={3}>
              <Form.Select
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId, e.target.value)}
              >
                {[...Array(Math.min(10, item.product.stockQuantity))].map(
                  (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  )
                )}
              </Form.Select>

              <p className="mt-2">
                Item Total: <strong>${item.itemTotal}</strong>
              </p>
            </Col>

            {/* Remove */}
            <Col md={3} className="d-flex align-items-center">
              <Button
                variant="danger"
                onClick={() => removeItem(item.orderItemId)}
              >
                Remove
              </Button>
            </Col>
          </Row>
        </Card>
      ))}

      {/* CART TOTAL */}
      {cart.items.length > 0 && (
        <Card className="p-3 mt-4 shadow-sm">
          <h4>
            Total: <span className="text-primary">${cart.totalAmount}</span>
          </h4>

          <Link to="/checkout" className="btn btn-success w-100 mt-3">
            Proceed to Checkout
          </Link>
        </Card>
      )}
    </div>
  );
}
