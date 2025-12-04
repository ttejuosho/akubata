/**
 * src/pages/Login.jsx
 * Modern redesigned login page for Akubata Inventory System.
 */

import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, InputGroup } from "react-bootstrap";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.emailAddress, data.password);
      navigate("/");
    } catch (err) {
      // handled via toast
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#f7f9fc",
        padding: "20px",
      }}
    >
      <Card
        className="p-4 shadow-sm"
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "16px",
        }}
      >
        <h2
          className="text-center fw-bold mb-4"
          style={{ color: "#123456", fontSize: "28px" }}
        >
          Welcome Back
        </h2>

        <p className="text-center text-muted mb-4">
          Log in to continue to Akubata Inventory System
        </p>

        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <Form.Group className="mb-3" controlId="emailAddress">
            <Form.Label className="fw-semibold">Email Address</Form.Label>
            <Form.Control
              size="lg"
              type="email"
              placeholder="you@example.com"
              {...register("emailAddress", {
                required: "Email is required",
              })}
              isInvalid={errors.emailAddress}
            />
            <Form.Control.Feedback type="invalid">
              {errors.emailAddress?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3" controlId="password">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <InputGroup>
              <Form.Control
                size="lg"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
                isInvalid={errors.password}
              />

              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  borderLeft: "none",
                  borderRadius: "0 10px 10px 0",
                  borderColor: "#e4dfdf",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>

              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Forgot password */}
          <div className="text-end mb-3">
            <Link to="/forgot-password" style={{ fontSize: "14px" }}>
              Forgot Password?
            </Link>
          </div>

          {/* Login button */}
          <Button
            type="submit"
            className="w-100 py-2"
            style={{
              backgroundColor: "#123456",
              borderColor: "#123456",
              fontSize: "18px",
              borderRadius: "10px",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </Form>

        {/* Divider */}
        <div className="text-center my-3 text-muted">— or —</div>

        {/* Sign Up */}
        <div className="text-center">
          <span>Don't have an account?</span>{" "}
          <Link to="/signup" className="fw-semibold">
            Sign Up
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
