import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import { AgGridReact } from "ag-grid-react";
import { themeBalham } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { FaTrash, FaPencilAlt, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

ModuleRegistry.registerModules([AllCommunityModule]);

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  }, []);

  // Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      const { data } = await api.get("/suppliers");
      setSuppliers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [fetchProducts, fetchSuppliers]);

  // Delete product
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/products/${productId}`);
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
        await api.put(`/products/${editingProduct.productId}`, formData);
        toast.success("Product updated");
      } else {
        // Create new product
        await api.post(`/products`, formData);
        toast.success("Product created");
      }
      handleClose();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    }
  };

  const ProductStatusRenderer = (params) => (
    <span
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
        alignItems: "center",
      }}
    >
      {
        <img
          alt={`${params.value}`}
          src={`https://www.ag-grid.com/example-assets/icons/${
            params.value ? "tick-in-circle" : "cross-in-circle"
          }.png`}
          style={{ width: "auto", height: "auto" }}
        />
      }
    </span>
  );

  // AG Grid columns
  const columns = [
    {
      headerName: "",
      field: "isActive",
      width: 50,
      cellRenderer: ProductStatusRenderer,
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
      cellRenderer: (params) => `₦${params.value}`,
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

  // Apply settings across all columns
  const defaultColDef = useMemo(() => {
    return {
      filter: true,
    };
  }, []);

  return (
    <div className="container mt-3">
      <div
        className="ag-theme-alpine"
        style={{ width: "100%", minHeight: "90vh" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h2>Manage Products</h2>
          <Button variant="primary" onClick={handleNewProduct}>
            <FaPlus /> New Product
          </Button>
        </div>

        {loading ? (
          <div>Loading products...</div>
        ) : (
          <div
            className="ag-theme-balham"
            style={{ height: "80vh", width: "100%" }}
          >
            <AgGridReact
              theme={themeBalham}
              loading={loading}
              rowData={products}
              columnDefs={columns}
              defaultColDef={defaultColDef}
            />
          </div>
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
                <Form.Label>Supplier</Form.Label>
                <Form.Select
                  value={formData.supplierId}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierId: e.target.value })
                  }
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.companyName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Products;
