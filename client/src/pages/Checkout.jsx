import { useState, useEffect } from "react";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import { useCart } from "../hooks/useCart";
import CartItem from "../components/CartItem";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CheckoutPage() {
  const [removingId, setRemovingId] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "",
    country: "",
    phoneNumber: "",
    addressLine: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
  });

  const {
    cart,
    cartTotal,
    updateCartItem,
    removeItemFromCart,
    buyNowItem,
    clearBuyNow,
  } = useCart();

  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const navigate = useNavigate();

  // Load cart items
  useEffect(() => {
    if (buyNowItem) {
      setCheckoutItems(buyNowItem.items);
    } else {
      clearBuyNow();
      setCheckoutItems(cart.items);
    }
  }, [buyNowItem, cart, clearBuyNow]);

  const computedTotal = buyNowItem
    ? buyNowItem.totalAmount.toFixed(2)
    : cartTotal;

  // Load addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data || []);

      const defaultAddress =
        res.data.find((x) => x.isDefault) || res.data[0] || null;

      setSelectedAddress(defaultAddress);
    } catch (err) {
      toast.error("Failed to load addresses");
    }
  };

  // Update quantity
  const updateQuantity = async (productId, qty) => {
    try {
      await updateCartItem(productId, Number(qty));
      toast.success("Cart Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  // Remove item
  const removeItem = (productId, quantity) => {
    if (buyNowItem) {
      clearBuyNow();
      navigate("/store");
    } else {
      setRemovingId(productId);
      setTimeout(async () => {
        try {
          await removeItemFromCart(productId, quantity);
          toast.success("Cart Updated");
        } catch {
          toast.error("Failed to remove item");
        } finally {
          setRemovingId(null);
        }
      }, 350);
    }
  };

  // Handle new address change
  const updateNewAddress = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Save new address
  const saveNewAddress = async () => {
    // simple validation
    if (
      !newAddress.label ||
      !newAddress.addressLine ||
      !newAddress.city ||
      !newAddress.country
    ) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      await api.post("/addresses", newAddress);
      toast.success("Address added");

      setShowNewAddressForm(false);
      setNewAddress({
        label: "",
        country: "",
        phoneNumber: "",
        addressLine: "",
        city: "",
        state: "",
        zip: "",
        isDefault: false,
      });

      await loadAddresses();
    } catch (err) {
      toast.error("Could not save address");
    }
  };

  return (
    <div className="py-5" style={{ background: "#f8f9fa" }}>
      <Row className="mx-auto" style={{ maxWidth: 1200 }}>
        {/* LEFT COLUMN */}
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm p-4">
            <h2 className="mb-4 fw-semibold">Checkout</h2>

            {/* SHIPPING ADDRESS */}
            <h5 className="fw-semibold mb-3">Shipping Address</h5>

            {/* Dropdown + Display */}
            {!showNewAddressForm && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Select Address</Form.Label>
                  <Form.Select
                    value={selectedAddress?.id || ""}
                    onChange={(e) => {
                      const addr = addresses.find(
                        (a) => a.id === Number(e.target.value)
                      );
                      setSelectedAddress(addr);
                    }}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} {addr.isDefault ? "(Default)" : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {selectedAddress && (
                  <Card className="p-3 bg-light mb-3">
                    <div>{selectedAddress.label}</div>
                    <div>{selectedAddress.addressLine1}</div>
                    <div>
                      {selectedAddress.city}, {selectedAddress.state}{" "}
                      {selectedAddress.zip}
                    </div>
                    <div>{selectedAddress.country}</div>
                    <div>{selectedAddress.phoneNumber}</div>
                  </Card>
                )}

                <Button
                  variant="outline-dark"
                  onClick={() => setShowNewAddressForm(true)}
                >
                  + Add New Address
                </Button>
              </>
            )}

            {/* NEW ADDRESS FORM */}
            {showNewAddressForm && (
              <Card className="p-3 mb-3">
                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Control
                      name="label"
                      placeholder="Label (Home, Office)"
                      value={newAddress.label}
                      onChange={updateNewAddress}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="country"
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={updateNewAddress}
                    />
                  </Col>

                  <Col xs={12}>
                    <Form.Control
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={newAddress.phoneNumber}
                      onChange={updateNewAddress}
                    />
                  </Col>

                  <Col xs={12}>
                    <Form.Control
                      name="addressLine"
                      placeholder="Street Address"
                      value={newAddress.addressLine}
                      onChange={updateNewAddress}
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Control
                      name="city"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={updateNewAddress}
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      name="state"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={updateNewAddress}
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      name="zip"
                      placeholder="ZIP"
                      value={newAddress.zip}
                      onChange={updateNewAddress}
                    />
                  </Col>
                </Row>

                <Form.Check
                  className="mt-3"
                  type="checkbox"
                  name="isDefault"
                  label="Set as default"
                  checked={newAddress.isDefault}
                  onChange={updateNewAddress}
                />

                <div className="d-flex gap-2 mt-3">
                  <Button variant="dark" onClick={saveNewAddress}>
                    Save
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* BILLING ADDRESS TOGGLE */}
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label="Billing address is different from shipping"
                checked={useDifferentBilling}
                onChange={() => setUseDifferentBilling(!useDifferentBilling)}
              />
            </Form.Group>

            {/* BILLING FORM */}
            {useDifferentBilling && (
              <>
                <hr />
                <h5 className="fw-semibold mb-3">Billing Address</h5>
                <Form className="mb-4">
                  <Row className="gy-3">
                    <Col xs={12}>
                      <Form.Control placeholder="Street Address" />
                    </Col>
                    <Col md={6}>
                      <Form.Control placeholder="City" />
                    </Col>
                    <Col md={3}>
                      <Form.Control placeholder="State" />
                    </Col>
                    <Col md={3}>
                      <Form.Control placeholder="ZIP Code" />
                    </Col>
                  </Row>
                </Form>
              </>
            )}

            <hr />

            {/* PAYMENT INFO */}
            <h5 className="fw-semibold mb-3">Payment Details</h5>
            <Form>
              <Row className="gy-3">
                <Col xs={12}>
                  <Form.Control placeholder="Card Number" />
                </Col>
                <Col md={6}>
                  <Form.Control placeholder="MM/YY" />
                </Col>
                <Col md={6}>
                  <Form.Control placeholder="CVC" />
                </Col>
              </Row>
            </Form>

            {/* SUBMIT */}
            <Button
              variant="dark"
              className="w-100 mt-4 py-3 fw-semibold"
              size="lg"
            >
              Place Order
            </Button>
          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col lg={5}>
          <Card className="shadow-sm p-4 sticky-top" style={{ top: 60 }}>
            <h4 className="fw-semibold mb-4">Order Summary</h4>
            <div
              style={{
                maxHeight: 300,
                overflowY: "auto",
                marginBottom: 15,
                paddingRight: 5,
              }}
            >
              {checkoutItems.map((item) => (
                <CartItem
                  key={item.productId}
                  removingId={removingId}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Subtotal</span>
              <span>
                ₦
                {new Intl.NumberFormat("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(computedTotal)}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Shipping</span>
              <span>Calculated at next step</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>
                ₦
                {new Intl.NumberFormat("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(computedTotal)}
              </span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
