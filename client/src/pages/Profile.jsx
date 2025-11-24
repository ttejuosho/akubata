import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import "./Profile.css"; // Add CSS for transitions
import { useRef } from "react";
import OrderHistory from "../components/OrderHistory";

export default function Profile() {
  const nodeRef = useRef(null);
  const { user, setUser } = useAuth();
  //const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    emailAddress: user.emailAddress || "",
    phoneNumber: user.phoneNumber || "",
    address: user.address || "",
  });
  //const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("personalInfo");

  useEffect(() => {}, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
    };

    try {
      await api.put("/auth", payload);
      setUser((prev) => ({ ...prev, ...payload }));
      toast.success("Profile updated");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Update failed");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmNewPassword = e.target.confirmNewPassword.value;

    if (!newPassword || newPassword !== confirmNewPassword) {
      toast.error("Passwords must match");
      return;
    }

    try {
      await api.post("/auth/password-reset", {
        newPassword,
        confirmNewPassword,
      });
      toast.success("Password updated successfully");
    } catch (err) {
      console.error("Password reset failed:", err);
      toast.error("Password reset failed");
    }
  };

  //if (isLoading) return <div>Loading...</div>;

  const renderMainContent = () => {
    switch (selectedSection) {
      case "personalInfo":
        return (
          <Card className="p-4 shadow-sm mb-4">
            <h4>Personal Info</h4>
            <Form onSubmit={handleUpdateProfile}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.emailAddress}
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Form>
          </Card>
        );

      case "passwordReset":
        return (
          <Card className="p-4 shadow-sm mb-4">
            <h4>Password Reset</h4>
            <Form onSubmit={handlePasswordReset}>
              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  required
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmNewPassword">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmNewPassword"
                  required
                />
              </Form.Group>

              <Button type="submit" variant="secondary">
                Reset Password
              </Button>
            </Form>
          </Card>
        );

      case "paymentMethods":
        return (
          <Card className="p-4 shadow-sm mb-4">
            <h4>Payment Methods</h4>
            <p>You can manage your saved cards here.</p>
            <Button variant="secondary">Manage Payment Methods</Button>
          </Card>
        );

      case "orders":
        return <OrderHistory />;

      case "messages":
        return (
          <Card className="p-4 shadow-sm mb-4">
            <h4>My Messages</h4>
            <p>
              Check notifications, alerts, and messages from Akubata Stores.
            </p>
            <Button variant="secondary">View Messages</Button>
          </Card>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <Container className="py-4">
      {/* <h2 className="mb-4">My Profile</h2> */}
      <Row>
        {/* LEFT SIDEBAR */}
        <Col md={4}>
          <Card className="mb-4 p-3 shadow-sm">
            <h5>Account Menu</h5>
            <hr />
            {[
              { key: "orders", label: "🧾 Order History" },
              { key: "messages", label: "💬 My Messages" },
              { key: "paymentMethods", label: "💳 Payment Methods" },
              { key: "personalInfo", label: "📝 Personal Info" },
              { key: "passwordReset", label: "🔒 Change Password" },
            ].map((item) => (
              <Button
                key={item.key}
                variant={selectedSection === item.key ? "secondary" : ""}
                className="d-block mb-2 text-start"
                onClick={() => setSelectedSection(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </Card>
        </Col>

        {/* MAIN CONTENT */}
        <Col md={8}>
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={selectedSection}
              timeout={200}
              classNames="fade"
              nodeRef={nodeRef}
              unmountOnExit
            >
              <div ref={nodeRef}>{renderMainContent()}</div>
            </CSSTransition>
          </SwitchTransition>
        </Col>
      </Row>
    </Container>
  );
}
