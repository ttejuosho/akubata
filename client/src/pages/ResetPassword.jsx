/**
 * src/pages/ResetPassword.jsx
 *
 * Reset Password page for Akubata Inventory System.
 * Uses React Hook Form for validation and AuthContext to reset the password.
 */

import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useState } from "react";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword(token, data.newPassword, data.confirmPassword);
      // Optionally show toast success
      navigate("/login"); // redirect to login after reset
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // what does this line below do?
  // It watches the "password" field for changes to validate confirm password
  // against it.
  const newPassword = watch("newPassword", "");

  return (
    <Container
      className="d-flex justify-content-center align-items-center reset-container"
      style={{ minHeight: "100vh" }}
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="p-4 shadow-sm reset-card">
            <h2 className="mb-4 text-center" style={{ color: "#123456" }}>
              Reset Password
            </h2>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="New password"
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  isInvalid={errors.newPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  {...register("confirmPassword", {
                    required: "Please confirm password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  isInvalid={errors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                variant="secondary"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
