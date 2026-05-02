import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Order from "./pages/Order";
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartNotification from "./components/CartNotification";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";
  const hideFooter = location.pathname === "/login" || location.pathname === "/register";

  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            {!hideNavbar && <Navbar />}

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />

                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />

                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Order />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/delivery" element={
                  <ProtectedRoute roles={["deliveryBoy"]}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {!hideFooter && <Footer />}
            
            <CartNotification />
          </div>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;