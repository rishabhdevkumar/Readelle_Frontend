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
 *  - Checking auth → show loading
 *  - Not logged in  → redirect to /login
 *  - Wrong role     → redirect to /unauthorized  (or "/" as fallback)
 *  - Correct role   → render children
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isLoggedIn, role, isCheckingAuth } = useSelector((state) => state.auth);

  // Wait for initial auth check to complete
  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

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
