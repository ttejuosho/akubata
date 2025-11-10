import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Card, Modal, Form, Badge } from "react-bootstrap";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { FaTrash, FaPencilAlt, FaPlus } from "react-icons/fa";
import api from "../api/axios";
import toast from "react-hot-toast";

ModuleRegistry.registerModules([AllCommunityModule]);

const Supplier = () => {
  const { supplierId } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    description: "",
    unitPrice: "",
    stockQuantity: "",
  });

  // Fetch supplier and products
  const fetchSupplier = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/suppliers/${supplierId}`);
      setSupplier(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch supplier details");
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  // Delete product
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted");
      fetchSupplier();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      category: product.category,
      description: product.description,
      unitPrice: product.unitPrice,
      stockQuantity: product.stockQuantity,
    });
    setShowModal(true);
  };

  // Add new product
  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      productName: "",
      category: "",
      description: "",
      unitPrice: "",
      stockQuantity: "",
    });
    setShowModal(true);
  };

  // Save product (edit or new)
  const handleSave = async () => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.productId}`, formData);
        toast.success("Product updated");
      } else {
        await api.post(`/products`, { ...formData, supplierId });
        toast.success("Product created");
      }
      setShowModal(false);
      fetchSupplier();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    }
  };

  const SupplierStatusRenderer = (params) => (
    <span
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
        alignItems: "center",
      }}
    >
      <img
        alt={`${params.value}`}
        src={`https://www.ag-grid.com/example-assets/icons/${
          params.value ? "tick-in-circle" : "cross-in-circle"
        }.png`}
        style={{ width: "auto", height: "auto" }}
      />
    </span>
  );

  // Table Columns
  const columns = [
    {
      headerName: "",
      field: "isActive",
      width: 50,
      cellRenderer: SupplierStatusRenderer,
    },
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
      cellRenderer: (params) => {
        const value = parseFloat(params.value);
        if (isNaN(value)) return "₦0.00";
        return `₦${new Intl.NumberFormat("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)}`;
      },
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
      cellRenderer: (params) => (
        <div className="d-flex gap-2">
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

  if (loading) return <div>Loading supplier details...</div>;
  if (!supplier) return <div>No supplier found.</div>;

  return (
    <div className="container mt-4">
      {/* Supplier Info Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h4 className="d-flex align-items-center gap-2">
                {supplier.companyName}
                <Badge bg={supplier.isActive ? "success" : "danger"}>
                  {supplier.isActive ? "Active" : "Inactive"}
                </Badge>
              </h4>
              <p className="mb-1">
                <strong>Contact:</strong> {supplier.contactName}
              </p>
              <p className="mb-1">
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${supplier.contactEmail}`}
                  className="text-decoration-none text-dark"
                >
                  {supplier.contactEmail}
                </a>
              </p>
              <p className="mb-1">
                <strong>Phone:</strong> {supplier.contactPhone}
              </p>
              <p className="mb-1">
                <strong>Address:</strong> {supplier.address}, {supplier.city},{" "}
                {supplier.state}, {supplier.country}
              </p>
            </div>
            <div>
              <Link
                to="/products"
                className="btn btn-outline-primary mt-3 mt-md-0"
              >
                Go to Products Page
              </Link>
              <Link
                to="/suppliers"
                className="btn btn-outline-primary mt-3 mt-md-0"
              >
                Go to Suppliers Page
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Products by {supplier.companyName}</h5>
        <Button variant="primary" onClick={handleNewProduct}>
          <FaPlus /> New Product
        </Button>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div
          className="ag-theme-balham"
          style={{ height: "50vh", width: "100%" }}
        >
          <AgGridReact
            rowData={supplier.Products}
            columnDefs={columns}
            defaultColDef={{ resizable: true }}
          />
        </div>
      )}

      {/* Modal for Create/Edit Product */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
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

export default Supplier;
