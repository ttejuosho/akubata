/**
 * src/pages/Signup.jsx
 *
 * Signup page for Akubata Inventory System.
 * Uses React Hook Form for validation and AuthContext for signup.
 */

import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.emailAddress,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      navigate("/"); // redirect after signup
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const password = watch("password", "");

  return (
    <Container>
      <Row className="align-items-center" style={{ marginTop: "10%" }}>
        <Col md={{ span: 6, offset: 3 }} className="align-self-center">
          <Card className="p-4 shadow-sm">
            <h2 className="mb-4 text-center" style={{ color: "#123456" }}>
              Sign Up
            </h2>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First name"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  isInvalid={errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  isInvalid={errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName?.message}
                </Form.Control.Feedback>
              </Form.Group>

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

              <Form.Group className="mb-3" controlId="phoneNumber">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter phone number"
                  {...register("phoneNumber", {
                    required: "Phone Number is required",
                  })}
                  isInvalid={errors.phoneNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
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

              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    {...register("confirmPassword", {
                      required: "Please confirm password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    isInvalid={errors.confirmPassword}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    style={{
                      borderLeft: "none",
                      borderRadius: "0 10px 10px 0",
                      borderColor: "#e4dfdf",
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span>Already have an account? </span>
              <Link to="/login">Log In</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
