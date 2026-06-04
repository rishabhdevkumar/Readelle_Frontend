import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 *
 * Props:
 *  - allowedRoles: string[]  — roles that can access this route (e.g. ["admin"])
 *  - children: ReactNode     — the page to render if authorized
 *
 * Behavior:
 *  - Not logged in  → redirect to /login
 *  - Wrong role     → redirect to /unauthorized  (or "/" as fallback)
 *  - Correct role   → render children
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Send user to their own dashboard if they land on the wrong one
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
