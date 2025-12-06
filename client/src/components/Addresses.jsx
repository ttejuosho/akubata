import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Card,
  Spinner,
  Row,
  Col,
  Badge,
  Form,
  Button,
  Container,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Divider from "./Divider";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressFormData, setAddressFormData] = useState({
    label: "",
    recipientFirstName: "",
    recipientLastName: "",
    country: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get("/addresses");
        setAddresses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch addresses: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // Helper: sort default first
  const sortDefaultFirst = (list) =>
    [...list].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  const handleAddressFormDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData({
      ...addressFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setAddressFormData({
      label: "",
      recipientFirstName: "",
      recipientLastName: "",
      phoneNumber: "",
      addressLine1: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: false,
    });
    setEditMode(false);
  };

  // Save address
  const saveAddressFormData = async () => {
    if (
      !addressFormData.zipCode ||
      !addressFormData.addressLine1 ||
      !addressFormData.city ||
      !addressFormData.country
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editMode) {
        await updateAddress();
        return;
      } else {
        const { data } = await api.post("/addresses", addressFormData);
        setAddresses((prev) => sortDefaultFirst([...prev, data.address]));
        toast.success("Address saved successfully");
      }

      resetForm();
      setShowAddressForm(false);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("This address already exists.");
        return;
      }
      toast.error("Could not save address");
    }
  };

  // Set default address
  const setAddressAsDefault = async (addressId) => {
    try {
      await api.patch(`/addresses/${addressId}/default`);
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.addressId === addressId,
        }))
      );
      toast.success("Default address updated");
    } catch (err) {
      toast.error("Could not set address as default");
    }
  };

  const setUpEditAddress = (address) => {
    setAddressFormData({
      label: address.label,
      recipientFirstName: address.recipientFirstName,
      recipientLastName: address.recipientLastName,
      country: address.country,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
      addressId: address.addressId,
    });
    setShowAddressForm(true);
    setEditMode(true);
  };

  // Edit address
  const updateAddress = async () => {
    try {
      const { data } = await api.put(
        `/addresses/${addressFormData.addressId}`,
        addressFormData
      );
      setAddresses((prev) =>
        sortDefaultFirst(
          prev.map((a) =>
            a.addressId === addressFormData.addressId ? data : a
          )
        )
      );
      toast.success("Address updated successfully");
      setEditMode(false);
      resetForm();
      setShowAddressForm(false);
    } catch (err) {
      toast.error("Failed to update address");
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`);
      setAddresses((prev) =>
        prev.filter((addr) => addr.addressId !== addressId)
      );
      toast.success("Address deleted");
    } catch (err) {
      toast.error("Could not delete address");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container className="p-0">
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">My Addresses</h4>
        {!showAddressForm && (
          <Button
            style={{ backgroundColor: "#237bd3", borderColor: "#237bd3" }}
            onClick={() => setShowAddressForm(true)}
          >
            Add New Address
          </Button>
        )}
      </div>

      {/* Address Form */}
      {showAddressForm && (
        <Card className="p-4 mb-4 shadow-sm border-0">
          <h5 className="fw-semibold mb-3">Add Address</h5>

          <Row className="gy-3">
            <Col md={6}>
              <Form.Control
                name="recipientFirstName"
                placeholder="First Name"
                value={addressFormData.recipientFirstName}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col md={6}>
              <Form.Control
                name="recipientLastName"
                placeholder="Last Name"
                value={addressFormData.recipientLastName}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col xs={12}>
              <Form.Control
                name="addressLine1"
                placeholder="Street Address"
                value={addressFormData.addressLine1}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col md={4}>
              <Form.Control
                name="city"
                placeholder="City"
                value={addressFormData.city}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col md={4}>
              <Form.Control
                name="state"
                placeholder="State"
                value={addressFormData.state}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col md={4}>
              <Form.Control
                name="zipCode"
                placeholder="ZIP Code"
                value={addressFormData.zipCode}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col md={6}>
              <Form.Control
                name="phoneNumber"
                placeholder="Phone Number"
                value={addressFormData.phoneNumber}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col md={6}>
              <Form.Control
                name="country"
                placeholder="Country"
                value={addressFormData.country}
                onChange={handleAddressFormDataChange}
              />
            </Col>

            <Col xs={12}>
              <Form.Control
                name="label"
                placeholder="Label (e.g., Home, Office)"
                value={addressFormData.label}
                onChange={handleAddressFormDataChange}
              />
            </Col>
          </Row>

          <Form.Check
            className="mt-3"
            type="checkbox"
            name="isDefault"
            label="Set as default"
            checked={addressFormData.isDefault}
            onChange={handleAddressFormDataChange}
          />

          <div className="d-flex gap-2 mt-4">
            {editMode ? (
              <Button variant="dark" onClick={saveAddressFormData}>
                Update Address
              </Button>
            ) : (
              <Button variant="dark" onClick={saveAddressFormData}>
                Save Address
              </Button>
            )}

            <Button
              variant="outline-secondary"
              onClick={() => {
                resetForm();
                setShowAddressForm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Address Cards */}
      <Row className="g-4">
        {addresses
          .sort((a, b) => (b.isDefault === true) - (a.isDefault === true))
          .map((address) => (
            <Col xs={12} md={6} key={address.addressId}>
              <Card
                style={{ backgroundColor: "#f2f2f2" }}
                className="shadow-md border-0 h-100 p-1"
              >
                <Card.Body>
                  {/* Header */}
                  <div className="d-flex px-2 justify-content-between align-items-start mb-2">
                    <h5 className="fw-semibold">{address.label}</h5>
                    {address.isDefault && <Badge bg="success">Default</Badge>}
                  </div>
                  <div
                    className="my-2"
                    style={{ borderTop: "1px solid #afababff" }}
                  />
                  {/* Address Lines */}
                  <p className="mb-1">
                    {address.recipientFirstName} {address.recipientLastName}
                  </p>
                  <p className="mb-1">{address.addressLine1},</p>
                  <p className="mb-1">
                    {address.city}, {address.state}, {address.zipCode}
                  </p>
                  <p className="mb-1">{address.country}</p>
                  <p className="mb-0 text-muted">
                    Phone: {address.phoneNumber}
                  </p>
                  <div
                    className="my-2"
                    style={{ borderTop: "1px solid #afababff" }}
                  />
                  {/* Buttons */}
                  <div className="d-flex px-3 gap-2 mt-3 flex-wrap justify-content-between">
                    <Link
                      className="text-dark text-decoration-none"
                      onClick={() => {
                        setUpEditAddress(address);
                      }}
                    >
                      Edit
                    </Link>
                    |
                    <Link
                      className="text-decoration-none text-dark"
                      onClick={() => deleteAddress(address.addressId)}
                    >
                      Delete
                    </Link>
                    {!address.isDefault && <span>|</span>}
                    {!address.isDefault && (
                      <Link
                        className="text-decoration-none text-dark"
                        onClick={() => setAddressAsDefault(address.addressId)}
                      >
                        Set Default
                      </Link>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>
    </Container>
  );
};

export default Addresses;
