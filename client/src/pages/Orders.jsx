import { useEffect, useState } from "react";
import api from "../api/axios";
import { Container, Card, Table, Badge, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders", { withCredentials: true });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading orders...</span>
      </div>
    );

  if (orders.length === 0)
    return (
      <Container className="text-center mt-5">
        <h4 className="text-muted">You have no orders yet.</h4>
      </Container>
    );

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-primary">Customer Orders</h2>

      {orders.map((order) => (
        <Card key={order.orderId} className="mb-4 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Order #{order.orderId.slice(0, 8).toUpperCase()}</strong>
              <div className="text-muted small">
                Placed on {new Date(order.orderDate).toLocaleDateString()}
              </div>
            </div>
            <Badge
              bg={
                order.orderStatus === "completed"
                  ? "success"
                  : order.orderStatus === "pending"
                  ? "warning"
                  : "secondary"
              }
            >
              {order.orderStatus.toUpperCase()}
            </Badge>
          </Card.Header>

          <Card.Body>
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.OrderItems.map((item) => (
                  <tr key={item.orderItemId}>
                    <td>{item.Product.productName}</td>
                    <td>{item.Product.category}</td>
                    <td>
                      ₦
                      {item.price.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>{item.quantity}</td>
                    <td className="text-end">
                      {/* ${(parseFloat(item.price) * item.quantity).toFixed(2)} */}
                      ₦
                      {(parseFloat(item.price) * item.quantity).toLocaleString(
                        "en-NG",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>

          <Card.Footer className="text-end">
            <strong>
              Total: ₦
              {order.totalAmount.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </Card.Footer>
        </Card>
      ))}
    </Container>
  );
};

export default Orders;
