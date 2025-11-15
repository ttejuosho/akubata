import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Row, Col, Button, Card, Badge, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
        if (err.response) {
          if (err.response.status === 404) {
            toast.error("No Products Found");
            return;
          }
          if (err.response.status === 401) {
            toast.error("You’ve been logged out. Please login again.");
            return navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (!product)
    return (
      <div className="text-center mt-5">
        <h5 className="text-muted">Product not found</h5>
      </div>
    );

  const { Supplier } = product;

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <Button
        variant="outline-secondary"
        className="mb-4"
        onClick={() => navigate("/products")}
      >
        &larr; Back to Products
      </Button>

      <Row className="gy-4">
        {/* Left Column - Product Card */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Img
              variant="top"
              src={product.imageUrl || "/akubata_product_image.png"}
              alt={product.productName}
              style={{ maxHeight: "320px", objectFit: "cover" }}
            />

            <Card.Body>
              <Card.Title className="fw-bold fs-4">
                {product.productName}
              </Card.Title>

              <div className="mb-3">
                <Badge bg="info" className="me-2">
                  {product.category}
                </Badge>
                <Badge bg={product.stockQuantity > 0 ? "success" : "danger"}>
                  {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>

              <h4 className="text-primary fw-bold mb-3">
                ₦
                {parseFloat(product.unitPrice).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </h4>

              <Card.Text
                className="text-muted"
                style={{ whiteSpace: "pre-line" }}
              >
                {product.description || "No description available."}
              </Card.Text>

              <div className="mt-3">
                <p className="mb-1">
                  <strong>Stock Quantity:</strong> {product.stockQuantity}
                </p>
                <p className="mb-1">
                  <strong>Status:</strong>{" "}
                  {product.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Supplier Card */}
        <Col md={6}>
          {Supplier ? (
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">Supplier Information</h5>

                <p className="mb-2">
                  <strong>Company:</strong>{" "}
                  <Link
                    to={`/supplier/${Supplier.supplierId}`}
                    className="text-decoration-none"
                  >
                    {Supplier.companyName}
                  </Link>
                </p>

                <p className="mb-2">
                  <strong>Contact Name:</strong> {Supplier.contactName}
                </p>

                {Supplier.contactEmail && (
                  <p className="mb-2">
                    <strong>Email:</strong>{" "}
                    <a
                      href={`mailto:${Supplier.contactEmail}`}
                      className="text-decoration-none"
                    >
                      {Supplier.contactEmail}
                    </a>
                  </p>
                )}

                {Supplier.contactPhone && (
                  <p className="mb-3">
                    <strong>Phone:</strong>{" "}
                    <a
                      href={`tel:${Supplier.contactPhone}`}
                      className="text-decoration-none"
                    >
                      {Supplier.contactPhone}
                    </a>
                  </p>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-3">
                  <Link
                    to={`/supplier/${Supplier.supplierId}`}
                    className="btn btn-outline-primary"
                  >
                    View Supplier
                  </Link>

                  {Supplier.contactEmail && (
                    <a
                      href={`mailto:${Supplier.contactEmail}`}
                      className="btn btn-success"
                    >
                      Reorder
                    </a>
                  )}

                  {Supplier.contactPhone && (
                    <a
                      href={`tel:${Supplier.contactPhone}`}
                      className="btn btn-outline-secondary"
                    >
                      Call Supplier
                    </a>
                  )}
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm p-4">
              <p className="text-muted">No supplier information available.</p>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Product;
