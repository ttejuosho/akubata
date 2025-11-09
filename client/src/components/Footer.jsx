/**
 * src/components/Footer.jsx
 *
 * Sticky footer for Akubata Inventory System.
 * Displays links and copyright information.
 */

import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-light text-muted py-4 mt-auto shadow-top">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <span>
              © {new Date().getFullYear()} Akubata Inc. All rights reserved.
            </span>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <Link to="/about" className="text-decoration-none text-muted me-3">
              About
            </Link>
            <Link
              to="/contact"
              className="text-decoration-none text-muted me-3"
            >
              Contact
            </Link>
            <Link to="/privacy" className="text-decoration-none text-muted">
              Privacy Policy
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
