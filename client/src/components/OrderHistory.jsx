import { useEffect, useState } from "react";
import { Card, Spinner, Row, Col, Badge, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" />
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center py-5 text-muted fs-5">
        You haven’t placed any orders yet.
      </div>
    );

  return (
    <div className="p-0 p-md-0">
      <Row className="g-4">
        {orders.map((order) => (
          <Col xs={12} key={order.orderId}>
            <Card className="order-card shadow-sm border-2">
              <Card.Body>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap mb-3">
                  <div>
                    <h5 className="fw-semibold mb-1">
                      <Link
                        className="text-decoration-none text-dark"
                        to={`/order/${order.orderId}`}
                      >
                        Order #{order.orderId.slice(0, 8)}
                      </Link>
                    </h5>
                    <Badge
                      bg={
                        order.orderStatus === "completed"
                          ? "success"
                          : order.orderStatus === "cancelled"
                          ? "danger"
                          : "warning"
                      }
                      className="text-uppercase px-3 py-1"
                    >
                      {order.orderStatus}
                    </Badge>
                    <div className="text-muted small mt-1">
                      Placed on {new Date(order.orderDate).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-end mt-2 mt-md-0">
                    <div className="text-muted small">Total Amount</div>
                    <div className="fw-bold fs-5 text-dark">
                      ₦
                      {new Intl.NumberFormat("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(order.totalAmount)}
                    </div>
                    <div className="small text-muted">
                      {order.paymentMethod}
                    </div>
                  </div>
                </div>

                <hr />

                {/* Items Section */}
                <h6 className="fw-bold mb-3 text-dark">Items in this order</h6>

                {order.OrderItems.length === 0 ? (
                  <div className="text-muted small">No items found.</div>
                ) : (
                  <div className="order-items-wrapper">
                    {order.OrderItems.map((item) => (
                      <div
                        key={item.orderItemId}
                        className="d-flex align-items-start order-item mb-3 p-2 rounded"
                      >
                        {/* Image */}
                        <Image
                          src={
                            item.Product.imageUrl ||
                            "/akubata_product_image.png"
                          }
                          rounded
                          className="order-item-image me-3"
                          alt={item.Product.productName}
                        />

                        {/* Info */}
                        <div className="flex-grow-1">
                          <div className="fw-semibold">
                            {item.Product.productName}
                          </div>
                          <div className="text-muted small">
                            {item.Product.category}
                          </div>

                          <div className="mt-1 small">
                            <span className="text-muted">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="fw-semibold text-nowrap">
                          ₦
                          {new Intl.NumberFormat("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default OrderHistory;
