import { Navbar, Container, Nav, Button, Image } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaUserCircle } from "react-icons/fa"; // profile icon

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const showLoginButton = !isAuthenticated && location.pathname === "/signup";
  const showSignupButton = !isAuthenticated && location.pathname === "/login";
  const showBothButtons =
    (!isAuthenticated && location.pathname === "/forgot-password") ||
    location.pathname === "/reset-password/:token" ||
    location.pathname === "/";

  return (
    <Navbar
      bg="light"
      variant="light"
      expand="lg"
      sticky="top"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{ fontWeight: "700", color: "#123456" }}
        >
          Akubata Inc.
        </Navbar.Brand>

        <Nav className="ms-auto align-items-center">
          {/* Logged-in user view */}

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
