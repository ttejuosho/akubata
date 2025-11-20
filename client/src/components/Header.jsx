import {
  Navbar,
  Container,
  Nav,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import { NavbarCart } from "./NavbarCart";
import { useState } from "react";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const showLoginButton = !isAuthenticated && location.pathname === "/signup";
  const showSignupButton = !isAuthenticated && location.pathname === "/login";
  const showBothButtons =
    (!isAuthenticated && location.pathname === "/forgot-password") ||
    location.pathname === "/reset-password/:token" ||
    location.pathname === "/" ||
    location.pathname === "/store";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/store?searchQuery=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    } else {
      navigate("/store");
    }
  };

  return (
    <Navbar
      bg="light"
      variant="light"
      expand="lg"
      sticky="top"
      className="shadow-sm"
    >
      {" "}
      <Container className="d-flex align-items-center">
        <Navbar.Brand
          as={Link}
          to="/"
          style={{ fontWeight: "700", color: "#123456" }}
        >
          Akubata Pharma
        </Navbar.Brand>
        {/* Search bar with icon */}
        <Form
          className="mx-3 flex-grow-1"
          onSubmit={handleSearch}
          style={{ maxWidth: "500px" }}
        >
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="primary" onClick={handleSearch}>
              <FaSearch />
            </Button>
          </InputGroup>
        </Form>

        <Nav className="ms-auto align-items-center">
          <Button as={Link} to="/store" variant="primary" className="me-2">
            Store
          </Button>
          <NavbarCart />
          {isAuthenticated && user ? (
            <>
              <div className="d-flex align-items-center me-3">
                <FaUserCircle size={24} className="me-2" />
                <span className="fw-semibold">{user.firstName}</span>
              </div>
              <Button variant="outline-primary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : showSignupButton ? (
            <Button as={Link} to="/signup" variant="primary">
              Sign Up
            </Button>
          ) : showLoginButton ? (
            <Button as={Link} to="/login" variant="primary">
              Log In
            </Button>
          ) : showBothButtons ? (
            <>
              <Button
                as={Link}
                to="/login"
                variant="outline-primary"
                className="me-2"
              >
                Log In
              </Button>
              <Button as={Link} to="/signup" variant="primary">
                Sign Up
              </Button>
            </>
          ) : null}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
