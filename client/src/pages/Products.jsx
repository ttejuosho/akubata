import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "../utils/axios"; // your pre-configured axios instance
import { Link } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaTrash, FaPencilAlt, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    description: "",
    unitPrice: "",
    stockQuantity: "",
    supplierId: "",
  });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Delete product
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  // Open edit modal
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      category: product.category,
      description: product.description,
      unitPrice: product.unitPrice,
      stockQuantity: product.stockQuantity,
      supplierId: product.supplierId,
    });
    setShowModal(true);
  };

  // Open new product modal
  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      productName: "",
      category: "",
      description: "",
      unitPrice: "",
      stockQuantity: "",
      supplierId: "",
    });
    setShowModal(true);
  };

  // Close modal
  const handleClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // Save changes (edit or create)
  const handleSave = async () => {
    try {
      if (editingProduct) {
        // Update product
        await axios.put(`/api/products/${editingProduct.productId}`, formData);
        toast.success("Product updated");
      } else {
        // Create new product
        await axios.post(`/api/products`, formData);
        toast.success("Product created");
      }
      handleClose();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    }
  };

  // AG Grid columns
  const columns = [
    {
      headerName: "Name",
      field: "productName",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Category",
      field: "category",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Price",
      field: "unitPrice",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Stock",
      field: "stockQuantity",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Options",
      field: "options",
      flex: 1.5,
      cellRendererFramework: (params) => (
        <div className="d-flex gap-2">
          <Link
            to={`/supplier/${params.data.supplierId}`}
            className="btn btn-sm btn-outline-primary"
          >
            See Supplier
          </Link>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleEdit(params.data)}
          >
            <FaPencilAlt />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDelete(params.data.productId)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="ag-theme-alpine"
      style={{ width: "100%", minHeight: "70vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Products</h2>
        <Button variant="primary" onClick={handleNewProduct}>
          <FaPlus /> New Product
        </Button>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <AgGridReact
          rowData={products}
          columnDefs={columns}
          defaultColDef={{ resizable: true }}
        />
      )}

      {/* Modal for create/edit */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? "Edit Product" : "New Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Supplier ID</Form.Label>
              <Form.Control
                type="text"
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData({ ...formData, supplierId: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;
