import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import { AgGridReact } from "ag-grid-react";
import { themeAlpine } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { FaTrash, FaPencilAlt, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../api/axios";

ModuleRegistry.registerModules([AllCommunityModule]);

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
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
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Delete supplier
  const handleDelete = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?"))
      return;

    try {
      await api.delete(`/suppliers/${supplierId}`);
      toast.success("Supplier deleted");
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete supplier");
    }
  };

  // Edit supplier
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({ ...supplier });
    setShowModal(true);
  };

  // New supplier
  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      country: "",
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleSave = async () => {
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.supplierId}`, formData);
        toast.success("Supplier updated");
      } else {
        await api.post("/suppliers", formData);
        toast.success("Supplier created");
      }
      handleClose();
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save supplier");
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

  const columns = [
    {
      headerName: "",
      field: "isActive",
      width: 50,
      cellRenderer: SupplierStatusRenderer,
    },
    {
      headerName: "Company",
      field: "companyName",
      sortable: true,
      filter: true,
      flex: 1.5,
      cellRenderer: (params) => (
        <Link
          to={`/supplier/${params.data.supplierId}`}
          className="text-decoration-none text-dark"
        >
          {params.value}
        </Link>
      ),
    },
    {
      headerName: "Contact Name",
      field: "contactName",
      sortable: true,
      filter: true,
      flex: 1.5,
    },
    {
      headerName: "Email",
      field: "contactEmail",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Phone",
      field: "contactPhone",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "City",
      field: "city",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "State",
      field: "state",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Options",
      field: "options",
      flex: 1,
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
            onClick={() => handleDelete(params.data.supplierId)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  const defaultColDef = useMemo(() => ({ filter: true }), []);

  return (
    <div className="container mt-3">
      <div
        className="ag-theme-alpine"
        style={{ width: "100%", minHeight: "90vh" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2>Manage Suppliers</h2>

          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "250px" }}
            />

            <Button variant="primary" onClick={handleNewSupplier}>
              <FaPlus /> New Supplier
            </Button>
          </div>
        </div>

        {loading ? (
          <div>Loading suppliers...</div>
        ) : (
          <div
            className="ag-theme-balham"
            style={{ height: "80vh", width: "100%" }}
          >
            <AgGridReact
              theme={themeAlpine}
              rowData={suppliers}
              columnDefs={columns}
              defaultColDef={defaultColDef}
              quickFilterText={search}
            />
          </div>
        )}

        {/* Modal */}
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingSupplier ? "Edit Supplier" : "New Supplier"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Contact Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
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

export default Suppliers;
