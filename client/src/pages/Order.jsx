import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (!order) {
    return (
      <Container className="py-4">
        <Card className="p-4 shadow-sm text-center">
          <h4>Order not found</h4>
          <Button className="mt-3" onClick={() => navigate("/profile")}>
            Back to Profile
          </Button>
        </Card>
      </Container>
    );
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(Number(value));

  const statusVariant =
    {
      pending: "warning",
      completed: "success",
      cancelled: "danger",
    }[order.orderStatus] || "secondary";

  return (
    <Container className="py-4">
      <Button variant="link" className="mb-3" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <h2 className="mb-4">Order Details</h2>

      {/* ORDER SUMMARY */}
      <Card className="p-4 shadow-sm mb-4">
        <Row>
          <Col md={6}>
            <h5>Order Information</h5>
            <p className="mb-1">
              <strong>Order ID:</strong> {order.orderId}
            </p>
            <p className="mb-1">
              <strong>Date:</strong>{" "}
              {new Date(order.orderDate).toLocaleString()}
            </p>
            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <Badge bg={statusVariant}>{order.orderStatus}</Badge>
            </p>
          </Col>

          <Col md={6}>
            <h5>Payment</h5>
            <p className="mb-1">
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            <p className="mb-1">
              <strong>Total:</strong> {formatCurrency(order.totalAmount)}
            </p>
          </Col>
        </Row>
      </Card>

      {/* ORDER ITEMS */}
      <h4 className="mb-3">Items</h4>

      {order.OrderItems.map((item) => (
        <Card key={item.orderItemId} className="p-3 mb-3 shadow-sm">
          <Row className="align-items-center">
            {/* IMAGE */}
            <Col xs={4} md={2} className="d-flex justify-content-center">
              <img
                src={item.Product?.imageUrl || "/akubata_product_image.png"}
                alt={item.Product?.productName}
                className="img-fluid rounded"
                style={{ maxHeight: "90px", objectFit: "cover" }}
              />
            </Col>

            {/* DETAILS */}
            <Col xs={8} md={6}>
              <h6 className="mb-1">{item.Product?.productName}</h6>
              <p className="text-muted mb-1">{item.Product?.category}</p>
              <p className="mb-0">Unit: {formatCurrency(item.price)}</p>
            </Col>

            {/* QTY + SUBTOTAL */}
            <Col xs={12} md={4} className="mt-3 mt-md-0 text-md-end">
              <p className="mb-1">
                <strong>Qty:</strong> {item.quantity}
              </p>
              <p className="mb-0">
                <strong>Subtotal:</strong>{" "}
                {formatCurrency(item.quantity * Number(item.price))}
              </p>
            </Col>
          </Row>
        </Card>
      ))}

      {/* TOTAL */}
      <Card className="p-4 mt-4 shadow-sm text-end">
        <h5>Total Amount</h5>
        <h3>{formatCurrency(order.totalAmount)}</h3>
      </Card>
    </Container>
  );
}
