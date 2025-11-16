import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

export const NavbarCart = () => {
  const { count } = useCart();

  return (
    <div className="d-flex align-items-center me-3">
      <Link to="/carts" className="position-relative">
        <FaShoppingCart size={24} className="me-2" />
        <i className="bi bi-cart" style={{ fontSize: 24 }} />
        {count > 0 && (
          <span
            className="badge bg-danger position-absolute"
            style={{ top: -5, right: -10 }}
          >
            {count}
          </span>
        )}
      </Link>
    </div>
  );
};
