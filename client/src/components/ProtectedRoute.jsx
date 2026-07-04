import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth.service";

/**
 * Wraps a route — redirects to /login if no valid JWT in localStorage.
 */
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
