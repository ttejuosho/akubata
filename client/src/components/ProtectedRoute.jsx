/**
 * src/components/ProtectedRoute.jsx
 *
 * Restricts access to routes for authenticated users only.
 * Redirects unauthenticated users to /login.
 */

// How it works:
// Outlet renders the child route(s) if authenticated
// Redirects to /login if not authenticated
// Shows a loading state while AuthContext is fetching user info

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ redirectPath = "/login" }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optional: Render a loader while auth state is being determined
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />; // Render nested routes
};

export default ProtectedRoute;
