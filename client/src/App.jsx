import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
//import Suppliers from "./pages/Suppliers";
//import Products from "./pages/Products";
//import Orders from "./pages/Orders";
import "./App.css";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* <Route path="/products" element={<Products />} /> */}
            {/* <Route path="/orders" element={<Orders />} /> */}
            {/* <Route path="/suppliers" element={<Suppliers />} /> */}
          </Route>

          {/* Optional: 404 */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
