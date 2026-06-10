import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Signup";
import AdminDashboard from "./pages/admin/AdminDashborad";
import ManageBooks from "./pages/admin/ManageBook";
import Users from "./pages/admin/Users";
import Orders from "./pages/admin/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layout/Layout";
import PublicLayout from "./layout/publicLayout";
import BooksPage from "./pages/BooksPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/books" element={<PublicLayout><BooksPage /></PublicLayout>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;