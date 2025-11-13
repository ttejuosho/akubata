import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Button } from "react-bootstrap";
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
            setProduct(null);
            toast.error("No Products Found");
            return;
          }

          if (err.response.status === 401) {
            navigate("/login");
            toast.error("Youve been logged out. Please log in again.");
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  if (loading) return <div>Loading product...</div>;
  if (!product) return <div>Product not found</div>;

  const { Supplier } = product;

  return (
    <div className="container mt-5">
      <Button
        variant="outline-primary"
        onClick={() => navigate("/products")}
        className="mb-3"
      >
        &larr; All Products
      </Button>

      <h2>{product.productName}</h2>
      <p>
        <strong>Category:</strong> {product.category}
      </p>
      <p>
        <strong>Description:</strong> {product.description}
      </p>
      <p>
        <strong>Price:</strong> ₦
        {parseFloat(product.unitPrice).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
        })}
      </p>
      <p>
        <strong>Stock:</strong> {product.stockQuantity}
      </p>
      <p>
        <strong>Status:</strong> {product.isActive ? "Active" : "Inactive"}
      </p>

      {Supplier && (
        <div className="mt-4">
          <h4>Supplier Details</h4>
          <p>
            <strong>Company:</strong>{" "}
            <Link
              className="text-decoration-none text-dark"
              to={`/supplier/${Supplier.supplierId}`}
            >
              {Supplier.companyName}
            </Link>
          </p>
          <p>
            <strong>Contact Name:</strong> {Supplier.contactName}
          </p>
          {Supplier.contactEmail && (
            <p>
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${Supplier.contactEmail}`}
                className="text-decoration-none text-dark"
              >
                {Supplier.contactEmail}
              </a>
            </p>
          )}
          {Supplier.contactPhone && (
            <p>
              <strong>Phone:</strong>{" "}
              <a
                href={`tel:${Supplier.contactPhone}`}
                className="text-decoration-none"
              >
                {Supplier.contactPhone}
              </a>
            </p>
          )}

          <div className="d-flex gap-2 mt-2">
            <Link
              to={`/supplier/${Supplier.supplierId}`}
              className="btn btn-outline-primary"
            >
              &larr; View Supplier
            </Link>
            {Supplier.contactEmail && (
              <a
                href={`mailto:${Supplier.contactEmail}`}
                className="btn btn-outline-success"
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
        </div>
      )}
    </div>
  );
};

export default Product;
