import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleRate = (productId, rating) => {
    console.log("Rated", productId, rating);
    // TODO: POST /products/:id/rate
  };

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

  return (
    <Container className="py-4">
      <Row>
        {products.map((p) => (
          <Col key={p.productId} sm={4} className="mb-4">
            <Card className="shadow-sm h-80 p-3">
              <Link to={`/product/${p.productId}`}>
                <Card.Img
                  variant="top"
                  src={p.imageUrl || "/akubata_product_image.png"}
                  style={{ width: 200, height: 240, objectFit: "fill" }}
                />
              </Link>

              <Card.Body>
                <Card.Title>{p.productName}</Card.Title>
                <Card.Text className="text-muted">{p.category}</Card.Text>
                <Card.Text style={{ minHeight: 60 }}>{p.description}</Card.Text>
                <h5>
                  ₦
                  {new Intl.NumberFormat("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(p.unitPrice)}
                </h5>

                <div className="mb-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <span
                      key={r}
                      onClick={() => handleRate(p.productId, r)}
                      style={{
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        color: "#f5b50a",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <div className="text-muted small mb-1">
                  In stock: {p.stockQuantity}
                </div>

                <div className="d-flex gap-2">
                  <div className="w-100">
                    <Form.Select
                      defaultValue={1}
                      disabled={p.stockQuantity === 0}
                    >
                      {p.stockQuantity === 0 ? (
                        <option>Out of Stock</option>
                      ) : (
                        [...Array(Math.min(10, p.stockQuantity))].map(
                          (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          )
                        )
                      )}
                    </Form.Select>
                  </div>
                  <Button variant="warning" className="w-100">
                    Add to Cart
                  </Button>
                </div>

                <Button variant="success" className="mt-2 w-100">
                  Buy Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
