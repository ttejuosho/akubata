// Checkout.jsx
import { useState, useEffect } from "react";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import { useCart } from "../hooks/useCart";
import CartItem from "../components/CartItem";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [removingId, setRemovingId] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
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

  useEffect(() => {
    if (buyNowItem) {
      setCheckoutItems(buyNowItem.items); // Only one item — Buy Now mode
    } else {
      clearBuyNow();
      setCheckoutItems(cart.items); // Normal cart checkout
    }
  }, [buyNowItem, cart, clearBuyNow]);

  const computedTotal = buyNowItem
    ? buyNowItem.totalAmount.toFixed(2)
    : cartTotal;

  const updateQuantity = async (productId, qty) => {
    try {
      await updateCartItem(productId, Number(qty));
      toast.success("Cart Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const removeItem = (productId, quantity) => {
    if (buyNowItem) {
      clearBuyNow();
      navigate("/store");
    } else {
      setRemovingId(productId);
      // Delay for animation before hitting API
      setTimeout(async () => {
        try {
          await removeItemFromCart(productId, quantity);
          toast.success("Cart Updated");
        } catch {
          toast.error("Failed to remove item");
        } finally {
          setRemovingId(null);
        }
      }, 350); // match CSS duration
    }
  };

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    emailAddress: "",
    phoneNumber: "",
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
  });

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //clearBuyNow(); on successful Checkout

  return (
    <div className="py-5" style={{ background: "#f8f9fa" }}>
      <Row className="mx-auto" style={{ maxWidth: 1200 }}>
        {/* LEFT COLUMN — FORM */}{" "}
        <Col lg={7} className="mb-4">
          {" "}
          <Card className="shadow-sm p-4">
            {" "}
            <h2 className="mb-4 fw-semibold">Checkout</h2>
            {/* CONTACT INFORMATION */}
            <h5 className="fw-semibold mb-3">Contact Information</h5>
            <Form className="mb-4">
              <Row className="gy-3">
                <Col xs={12}>
                  <Form.Control
                    name="emailAddress"
                    placeholder="Email Address"
                    value={form.emailAddress}
                    onChange={updateForm}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Control
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={updateForm}
                  />
                </Col>
              </Row>
            </Form>
            <hr />
            {/* SHIPPING ADDRESS */}
            <h5 className="fw-semibold mb-3">Shipping Address</h5>
            <Form className="mb-4">
              <Row className="gy-3">
                <Col md={6}>
                  <Form.Control
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={updateForm}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={updateForm}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Control
                    name="address"
                    placeholder="Street Address"
                    value={form.address}
                    onChange={updateForm}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={updateForm}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={updateForm}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    name="zip"
                    placeholder="ZIP Code"
                    value={form.zip}
                    onChange={updateForm}
                  />
                </Col>
              </Row>

              {/* Checkbox to toggle billing address */}
              <Form.Group className="mt-3">
                <Form.Check
                  type="checkbox"
                  label="Billing address is different from shipping"
                  checked={useDifferentBilling}
                  onChange={() => setUseDifferentBilling(!useDifferentBilling)}
                />
              </Form.Group>
            </Form>
            {/* BILLING ADDRESS */}
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
                        value={form.billingFirstName}
                        onChange={updateForm}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        name="billingLastName"
                        placeholder="Last Name"
                        value={form.billingLastName}
                        onChange={updateForm}
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        name="billingAddress"
                        placeholder="Street Address"
                        value={form.billingAddress}
                        onChange={updateForm}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        name="billingCity"
                        placeholder="City"
                        value={form.billingCity}
                        onChange={updateForm}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        name="billingState"
                        placeholder="State"
                        value={form.billingState}
                        onChange={updateForm}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        name="billingZip"
                        placeholder="ZIP Code"
                        value={form.billingZip}
                        onChange={updateForm}
                      />
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
            {/* PLACE ORDER BUTTON */}
            <Button
              variant="dark"
              className="w-100 mt-4 py-3 fw-semibold"
              size="lg"
            >
              Place Order
            </Button>
          </Card>
        </Col>
        {/* RIGHT COLUMN — SUMMARY */}
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
