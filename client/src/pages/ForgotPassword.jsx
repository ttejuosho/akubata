/**
 * src/pages/ForgotPassword.jsx
 *
 * Forgot Password page for Akubata Inventory System.
 * Uses React Hook Form for validation and AuthContext for initiating password reset.
 */

import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useState } from "react";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.emailAddress);
      // Optionally show a toast notification via AuthContext
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center forgot-container"
      style={{ minHeight: "100vh" }}
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="p-4 shadow-sm forgot-card">
            <h2 className="mb-4 text-center" style={{ color: "#123456" }}>
              Forgot Password
            </h2>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  {...register("emailAddress", {
                    required: "Email is required",
                  })}
                  isInvalid={errors.emailAddress}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.emailAddress?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <Link to="/login">Back to Login</Link> |{" "}
              <Link to="/signup">Sign Up</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
