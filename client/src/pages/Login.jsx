/**
 * src/pages/Login.jsx
 *
 * Login page for Akubata Inventory System.
 * Uses React Hook Form for validation and AuthContext for login.
 */

import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useState } from "react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.emailAddress, data.password);
      navigate("/"); // redirect after login
    } catch (err) {
      // Error handled in AuthContext via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="align-items-center" style={{ marginTop: "17%" }}>
        <Col md={{ span: 6, offset: 3 }} className="align-self-center">
          <Card className="p-4 shadow-sm">
            <h2 className="mb-4 text-center" style={{ color: "#123456" }}>
              Log In
            </h2>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="emailAddress">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  {...register("emailAddress", {
                    required: "Email is required",
                  })}
                  isInvalid={errors.emailAddress}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.emailAddress?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  isInvalid={errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span>Don't have an account? </span>
              <Link to="/signup">Sign Up</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
