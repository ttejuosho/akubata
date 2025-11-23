import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  Alert,
} from "react-bootstrap";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Store() {
  const [products, setProducts] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState({});
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("searchQuery") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products", {
          params: { searchQuery },
        });
        setProducts(data.products);
        setResponseMessage(data.message);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  const handleRate = (productId, rating) => {
    console.log("Rated", productId, rating);
    // TODO: POST /products/:id/rate
  };

  const handleAddToCart = async (productId, qty) => {
    try {
      await addToCart(productId, qty);
      toast.success("Added to cart");
    } catch (err) {
      console.error("Error adding to cart", err);
      toast.error("Could not add to cart");
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        {" "}
        <Spinner animation="border" />{" "}
      </div>
    );
  }

  return (
    <Container className="py-4">
      {" "}
      <Row>
        {responseMessage && (
          <>
            {" "}
            <Alert key={"secondary"} variant={"secondary"}>
              {responseMessage}
            </Alert>
          </>
        )}
        {products.map((p) => (
          <Col key={p.productId} md={4} className="mb-4">
            {" "}
            <Card className="shadow-sm h-80 p-3">
              <Link to={`/product/${p.productId}`}>
                <Card.Img
                  variant="top"
                  src={p.imageUrl || "/akubata_product_image.png"}
                  style={{ width: 240, height: 240, objectFit: "fill" }}
                />{" "}
              </Link>
              <Card.Body>
                <Card.Title>{p.productName}</Card.Title>
                <Card.Text className="text-muted">{p.category}</Card.Text>
                <Card.Text className="mb-0" style={{ minHeight: 60 }}>
                  {p.description}
                </Card.Text>{" "}
                <h5>
                  ₦
                  {new Intl.NumberFormat("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(p.unitPrice)}{" "}
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
                      className="mb-3"
                      value={selectedQty[p.productId] || 1}
                      onChange={(e) =>
                        setSelectedQty({
                          ...selectedQty,
                          [p.productId]: Number(e.target.value),
                        })
                      }
                    >
                      {[...Array(Math.min(10, p.stockQuantity))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      variant="warning"
                      className="w-100"
                      size="sm"
                      onClick={() =>
                        handleAddToCart(
                          p.productId,
                          selectedQty[p.productId] || 1
                        )
                      }
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
                <Button
                  variant="success"
                  className="mt-2 w-100"
                  onClick={() =>
                    navigate(
                      `/checkout?productId=${p.productId}&qty=${
                        selectedQty[p.productId] || 1
                      }`
                    )
                  }
                >
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
