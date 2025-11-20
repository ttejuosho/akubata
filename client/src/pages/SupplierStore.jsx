import { useEffect, useState } from "react";
import { useCart } from "../hooks/useCart";
import api from "../api/axios";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function SupplierStore() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState({});

  useEffect(() => {
    if (!supplierId) return;

    const fetchSupplier = async () => {
      try {
        const res = await api.get(`/suppliers/${supplierId}`);
        setSupplier(res.data);
      } catch (err) {
        console.error("Error fetching supplier:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-600">
        Loading supplier store...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-600">
        Supplier not found.
      </div>
    );
  }

  const handleAddToCart = async (productId, qty) => {
    try {
      await addToCart(productId, qty);
      toast.success("Added to cart");
    } catch (err) {
      console.error("Error adding to cart", err);
      toast.error("Could not add to cart");
    }
  };
  const handleRate = (productId, rating) => {
    toast.success(`You rated ${rating} stars`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">{supplier.companyName}</h1>

        {!supplier.isActive && (
          <p className="text-red-600 font-semibold mt-2">
            This supplier is currently inactive.
          </p>
        )}

        <p className="text-gray-600 mt-2">
          Contact: {supplier.contactName} — {supplier.contactEmail} —{" "}
          {supplier.contactPhone}
        </p>

        <p className="text-gray-600">
          {supplier.address}, {supplier.city}, {supplier.state},{" "}
          {supplier.country}
        </p>

        <button
          className="mt-4 underline text-blue-600"
          onClick={() => navigate("/store")}
        >
          Back to main store
        </button>
      </div>

      {/* PRODUCTS GRID — using Bootstrap only */}
      <Container className="py-4">
        <Row className="mt-4">
          {supplier.Products?.length === 0 && (
            <p className="text-gray-500 italic col-span-full text-center">
              This supplier has no products available.
            </p>
          )}

          {supplier.Products?.map((p) => (
            <Col key={p.productId} md={4} className="mb-4">
              <Card className="shadow-sm h-80 p-3">
                <Link to={`/product/${p.productId}`}>
                  <Card.Img
                    variant="top"
                    src={p.imageUrl || "/akubata_product_image.png"}
                    style={{ width: 200, height: 240, objectFit: "fill" }}
                    className="mx-auto d-block"
                  />
                </Link>

                <Card.Body>
                  <Card.Title>{p.productName}</Card.Title>
                  <Card.Text className="text-muted">{p.category}</Card.Text>
                  <Card.Text className="mb-0" style={{ minHeight: 60 }}>
                    {p.description}
                  </Card.Text>
                  <h5 className="mt-2">
                    ₦
                    {new Intl.NumberFormat("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(p.unitPrice)}
                  </h5>

                  {/* Ratings */}
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

                  <div className="text-muted small mb-2">
                    In stock: {p.stockQuantity}
                  </div>

                  {/* Quantity + Add to Cart */}
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
                        {[...Array(Math.min(10, p.stockQuantity))].map(
                          (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          )
                        )}
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

                  {/* Buy Now */}
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
    </div>
  );
}
