// CartItem.jsx
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import Divider from "./Divider";
import { Link } from "react-router-dom";
// ----------------- CartItem Component -----------------
export default function CartItem({
  removingId,
  item,
  updateQuantity,
  removeItem,
}) {
  return (
    <div
      key={item.orderItemId}
      className={`py-4 cart-item ${
        removingId === item.productId ? "fade-out" : ""
      }`}
    >
      <Row className="align-items-start gy-3">
        {/* Image */}
        <Col xs={4} md={3}>
          <Link to={`/product/${item.product.productId}`}>
            <Card.Img
              variant="top"
              src={item.product.imageUrl || "/akubata_product_image.png"}
              style={{ maxHeight: "140px", objectFit: "contain" }}
            />
          </Link>
        </Col>

        {/* Product info */}
        <Col xs={8} md={6}>
          <Link
            className="text-decoration-none text-dark"
            to={`/product/${item.product.productId}`}
          >
            <h5 className="fw-semibold">{item.productName}</h5>
          </Link>

          <h6 className="text-muted">
            Unit Price: ₦
            {new Intl.NumberFormat("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(item.price)}
          </h6>

          <div className="mt-3">
            <Form.Select
              style={{ width: "100px" }}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, e.target.value)}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </Form.Select>
          </div>
        </Col>

        {/* Price & Remove */}
        <Col xs={12} md={3} className="text-md-end">
          <h5 className="fw-semibold mb-2">
            ₦
            {new Intl.NumberFormat("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(item.productTotalPrice)}
          </h5>
          <Button
            variant="link"
            className="text-danger p-0"
            onClick={() => removeItem(item.productId, item.quantity)}
          >
            Remove
          </Button>
        </Col>
      </Row>

      <Divider />
    </div>
  );
}
