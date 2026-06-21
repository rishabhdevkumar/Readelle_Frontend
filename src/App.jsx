import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCart, setGuestCart } from "./redux/slices/cartSlice";

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
import BookdetailPage from "./pages/BookdetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import MyAccount from "./pages/MyAccount";
import { getMe, setAuthCheckComplete } from "./redux/slices/authSlice";
import ChapterPage from "./pages/ChapterPage";
import Notes from "./pages/Notes";

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, isCheckingAuth } = useSelector((state) => state.auth);

  // Restore auth state on app mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe());
    } else {
      // No token, mark auth check as complete
      dispatch(setAuthCheckComplete());
    }
  }, [dispatch]);

  // Load cart once auth check is complete
  useEffect(() => {
    if (!isCheckingAuth) {
      if (isLoggedIn) {
        dispatch(getCart());
      } else {
        const guestCart = localStorage.getItem("guest_cart");
        if (guestCart) {
          try {
            dispatch(setGuestCart(JSON.parse(guestCart)));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }, [dispatch, isLoggedIn, isCheckingAuth]);

  return (
    <>
      <Routes>
        <Route 
        path="/" 
        element={
        <PublicLayout><HomePage /></PublicLayout>
        } 
        />

        <Route 
        path="/books" 
        element={
        <PublicLayout><BooksPage /></PublicLayout>
        }
        />
        
        <Route path="/books/:id"
         element={
         <PublicLayout><BookdetailPage /></PublicLayout>
         } 
         />

         <Route
           path="/books/:id/chapters"
           element={
             <PublicLayout><ChapterPage /></PublicLayout>
           }
         />

         <Route
           path="/books/:id/chapters/:chapterId/notes"
           element={
             <ProtectedRoute allowedRoles={["user", "admin", "seller"]}>
               <Notes />
             </ProtectedRoute>
           }
         />

         <Route 
         path="/carts"
         element={
          <PublicLayout><CartPage /></PublicLayout>
         } 
         />

        <Route 
        path="/login" 
        element={
        <LoginPage />
        }
         />

        <Route 
        path="/signup" 
        element={
        <SignupPage />
        } 
        />

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

        <Route 
          path="/wishlist"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <PublicLayout>
                <WishlistPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/my-account"
          element={
            <ProtectedRoute allowedRoles={["user", "admin", "seller"]}>
              <PublicLayout>
                <MyAccount />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;