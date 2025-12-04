import { useState, useEffect } from "react";
import { Row, Col, Form, Card, Button, Spinner } from "react-bootstrap";
import { useCart } from "../hooks/useCart";
import CartItem from "../components/CartItem";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  FaCreditCard,
  FaMoneyCheckAlt,
  FaBitcoin,
  FaUniversity,
  FaPaypal,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa";

export default function CheckoutPage() {
  const [removingId, setRemovingId] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    cart,
    cartTotal,
    updateCartItem,
    removeItemFromCart,
    buyNowItem,
    clearBuyNow,
    clearCartState,
  } = useCart();

  const [newAddress, setNewAddress] = useState({
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

  const [paymentInformation, setPaymentInformation] = useState({
    paymentMethod: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    billingFirstName: "",
    billingLastName: "",
    billingPhoneNumber: "",
    billingAddressLine1: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingZipCode: "",
  });

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
      console.error(err.message);
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

  const updateBillingAddress = (e) => {
    const { name, value } = e.target;
    setBillingAddress({
      ...billingAddress,
      [name]: value,
    });
  };

  const updatePaymentInformation = (e) => {
    const { name, value } = e.target;
    setPaymentInformation({
      ...paymentInformation,
      [name]: value,
    });
  };

  // Save new address
  const saveNewAddress = async () => {
    // simple validation
    if (
      !newAddress.zipCode ||
      !newAddress.addressLine1 ||
      !newAddress.city ||
      !newAddress.country
    ) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const { data } = await api.post("/addresses", newAddress);
      toast.success("Address added");
      setSelectedAddress(data.address);
      setAddresses((prev) => [...prev, data.address]);

      setNewAddress({
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

      setShowNewAddressForm(false);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("This address already exists.");
        return;
      }
      toast.error("Could not save address");
    }
  };

  const handlePlaceOrder = async () => {
    console.log(cart);
    if (cart.items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        orderId: buyNowItem ? buyNowItem.orderId : cart.orderId,
        totalAmount: computedTotal,
        items: cart.items,
        useDifferentBilling: useDifferentBilling,
        shippingInfo: {
          firstName: selectedAddress.recipientFirstName,
          lastName: selectedAddress.recipientLastName,
          address: selectedAddress.addressLine1,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phoneNumber: selectedAddress.phoneNumber,
          country: selectedAddress.country,
        },
        billingInfo: useDifferentBilling
          ? {
              firstName: billingAddress.billingFirstName,
              lastName: billingAddress.billingLastName,
              address: billingAddress.billingAddressLine1,
              city: billingAddress.billingCity,
              state: billingAddress.billingState,
              zip: billingAddress.billingZipCode,
              country: billingAddress.billingCountry,
              phoneNumber: billingAddress.billingPhoneNumber,
            }
          : null,
        paymentInformation: {
          paymentMethod: paymentInformation.paymentMethod,
          cardNumber: paymentInformation.cardNumber,
          expiry: paymentInformation.expiry,
          cvc: paymentInformation.cvc,
        },
      };

      console.log("Order Payload:", payload);
      //const res = await api.post("/orders", payload);
      toast.success("Order placed successfully!");
      //clearCartState(); // clear context cart
      //navigate(`/order-confirmation/${res.data.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const resetBillingAddressForm = () => {
    setBillingAddress({
      billingFirstName: "",
      billingLastName: "",
      billingCountry: "",
      billingPhoneNumber: "",
      billingAddressLine1: "",
      billingCity: "",
      billingState: "",
      billingZipCode: "",
    });
  };

  const resetShippingAddressForm = () => {
    setNewAddress({
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
                    value={selectedAddress?.addressId || ""}
                    onChange={(e) => {
                      const addr = addresses.find(
                        (a) => a.addressId === e.target.value
                      );
                      setSelectedAddress(addr);
                    }}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.addressId} value={addr.addressId}>
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
                      {selectedAddress.zipCode}
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
                      name="recipientFirstName"
                      placeholder="First Name"
                      value={newAddress.recipientFirstName}
                      onChange={updateNewAddress}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="recipientLastName"
                      placeholder="Last Name"
                      value={newAddress.recipientLastName}
                      onChange={updateNewAddress}
                    />
                  </Col>
                  <Col xs={12}>
                    <Form.Control
                      name="addressLine1"
                      placeholder="Street Address"
                      value={newAddress.addressLine1}
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
                      name="zipCode"
                      placeholder="ZIP"
                      value={newAddress.zipCode}
                      onChange={updateNewAddress}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={newAddress.phoneNumber}
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
                      name="label"
                      placeholder="Label (Home, Office)"
                      value={newAddress.label}
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
                    onClick={() => {
                      resetShippingAddressForm();
                      setShowNewAddressForm(false);
                    }}
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
                onChange={() => {
                  resetBillingAddressForm();
                  setUseDifferentBilling(!useDifferentBilling);
                }}
              />
            </Form.Group>

            {/* BILLING FORM */}
            {useDifferentBilling && (
              <>
                <hr />
                <h5 className="fw-semibold mb-3">Billing Address</h5>
                <Form className="mb-4">
                  <Row className="gy-3">
                    <Col md={6}>
                      <Form.Control
                        name="billingFirstName"
                        placeholder="First Name"
                        value={billingAddress.billingFirstName}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        name="billingLastName"
                        placeholder="Last Name"
                        value={billingAddress.billingLastName}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        name="billingAddressLine1"
                        placeholder="Street Address"
                        value={billingAddress.billingAddressLine1}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        name="billingCity"
                        placeholder="City"
                        value={billingAddress.billingCity}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        name="billingState"
                        placeholder="State"
                        value={billingAddress.billingState}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        name="billingZipCode"
                        placeholder="Zip Code"
                        value={billingAddress.billingZipCode}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        name="billingPhoneNumber"
                        placeholder="Phone Number"
                        value={billingAddress.billingPhoneNumber}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        name="billingCountry"
                        placeholder="Country"
                        value={billingAddress.billingCountry}
                        onChange={updateBillingAddress}
                      />
                    </Col>
                  </Row>
                </Form>
              </>
            )}

            <hr />

            {/* PAYMENT INFO */}
            <h5 className="fw-semibold mb-3">Payment Details</h5>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Payment Method</Form.Label>

              <div className="d-flex flex-column gap-2">
                {[
                  { label: "Credit Card", icon: <FaCreditCard /> },
                  { label: "Check", icon: <FaMoneyCheckAlt /> },
                  { label: "Cryptocurrency", icon: <FaBitcoin /> },
                  { label: "Bank Transfer", icon: <FaUniversity /> },
                  { label: "PayPal", icon: <FaPaypal /> },
                  { label: "Apple Pay", icon: <FaApplePay /> },
                  { label: "Google Pay", icon: <FaGooglePay /> },
                ].map((method) => {
                  const selected =
                    paymentInformation.paymentMethod === method.label;

                  return (
                    <div
                      key={method.label}
                      className={`payment-option ${selected ? "selected" : ""}`}
                      onClick={() =>
                        updatePaymentInformation({
                          target: {
                            name: "paymentMethod",
                            value: method.label,
                          },
                        })
                      }
                    >
                      {/* Radio Button + Label */}
                      <Form.Check
                        type="radio"
                        name="paymentMethod"
                        value={method.label}
                        checked={selected}
                        onChange={updatePaymentInformation}
                        label={
                          <span className="d-flex align-items-center gap-2">
                            {method.icon}
                            {method.label}
                          </span>
                        }
                      />

                      {/* ----- CONDITIONAL CONTENT UNDER SELECTED METHOD ----- */}
                      {selected && (
                        <div className="mt-3 ms-4">
                          {/* ================= CREDIT CARD FIELDS ================= */}
                          {method.label === "Credit Card" && (
                            <Form>
                              <Row className="gy-3">
                                <Col xs={12}>
                                  <Form.Control
                                    name="cardNumber"
                                    placeholder="Card Number"
                                    value={paymentInformation.cardNumber}
                                    onChange={updatePaymentInformation}
                                  />
                                </Col>

                                <Col md={6}>
                                  <Form.Control
                                    name="expiry"
                                    placeholder="MM/YY"
                                    value={paymentInformation.expiry}
                                    onChange={updatePaymentInformation}
                                  />
                                </Col>

                                <Col md={6}>
                                  <Form.Control
                                    name="cvc"
                                    placeholder="CVC"
                                    value={paymentInformation.cvc}
                                    onChange={updatePaymentInformation}
                                  />
                                </Col>
                              </Row>
                            </Form>
                          )}

                          {/* ================= BANK TRANSFER DETAILS ================= */}
                          {method.label === "Bank Transfer" && (
                            <Card className="p-3 bg-light mb-3">
                              <h6 className="fw-semibold">
                                Bank Transfer Instructions
                              </h6>
                              <p className="mb-0">
                                Please transfer the total amount to the
                                following bank account:
                              </p>
                              <ul>
                                <li>Bank: GTBank</li>
                                <li>Account Name: Akubata Online Store</li>
                                <li>Account Number: 1234567890</li>
                                <li>SWIFT Code: ABCD1234</li>
                              </ul>
                              <p>
                                Once the transfer is complete, email your
                                confirmation to:
                                <strong> payments@akubata.com</strong>
                              </p>
                            </Card>
                          )}

                          {/* ================= CHECK ================= */}
                          {method.label === "Check" && (
                            <Card className="p-3 bg-light mb-3">
                              <h6 className="fw-semibold">
                                Check Payment Instructions
                              </h6>
                              <p className="mb-0">Please mail your check to:</p>
                              <ul>
                                <li>Akubata Online Store</li>
                                <li>PO Box 9876, Asaba</li>
                                <li>Delta State, Nigeria</li>
                              </ul>
                            </Card>
                          )}

                          {/* ================= CRYPTO ================= */}
                          {method.label === "Cryptocurrency" && (
                            <Card className="p-3 bg-light mb-3">
                              <h6 className="fw-semibold">
                                Crypto Payment Wallet
                              </h6>
                              <p>Send payment to the wallet below:</p>
                              <strong>
                                bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                              </strong>
                              <p className="mt-2">
                                After payment, email your TXID to
                                <strong> payments@akubata.com</strong>
                              </p>
                            </Card>
                          )}

                          {/* ================= PAYPAL ================= */}
                          {method.label === "PayPal" && (
                            <Card className="p-3 bg-light mb-3">
                              <Card.Img
                                variant="top"
                                src={"/paypal-button.avif"}
                                alt={"PayPal"}
                                style={{
                                  maxHeight: "90px",
                                  objectFit: "none",
                                }}
                              />
                            </Card>
                          )}

                          {/* ================= APPLE PAY ================= */}
                          {method.label === "Apple Pay" && (
                            <Card className="p-1 bg-dark mb-3">
                              <Card.Img
                                variant="top"
                                src={"/apple-pay.png"}
                                alt={"Apple Pay"}
                                style={{
                                  maxHeight: "50px",
                                  objectFit: "contain",
                                }}
                              />
                            </Card>
                          )}

                          {/* ================= GOOGLE PAY ================= */}
                          {method.label === "Google Pay" && (
                            <Card className="p-1 bg-light mb-3">
                              <Card.Img
                                variant="top"
                                src={"/google-pay-button.svg"}
                                alt={"Google Pay"}
                                style={{
                                  maxHeight: "50px",
                                  objectFit: "contain",
                                }}
                              />
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Form.Group>

            {/* SUBMIT */}
            <Button
              variant="dark"
              className="w-100 mt-4 py-3 fw-semibold"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Place Order"}
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
