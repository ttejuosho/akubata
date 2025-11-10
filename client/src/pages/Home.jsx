import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mt-5">
      <h1>Welcome to Akubata Inventory Management System</h1>
      <p>Manage your inventory, suppliers, and orders efficiently.</p>

      <div className="row mt-4">
        {/* Products Tile */}
        <div className="col-md-6 mb-3">
          <Link to="/products" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <h3 className="card-title">Products</h3>
                <p className="card-text">View and manage your products.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Suppliers Tile */}
        <div className="col-md-6 mb-3">
          <Link to="/suppliers" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <h3 className="card-title">Suppliers</h3>
                <p className="card-text">View and manage your suppliers.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
