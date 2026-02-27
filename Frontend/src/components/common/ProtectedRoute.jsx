import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

// Protect any authenticated route
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

// Admin-only route
export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user?.role !== "admin")
    return <Navigate to="/user/home" replace />;
  return children;
};

// User-only route (non-admin)
export const UserRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return children;
};

export default ProtectedRoute;