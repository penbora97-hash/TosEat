// Router.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "../pages/dashboard/UserContext";
import Home from "/src/pages/shop/Home.jsx";
import Navbar from "/src/pages/shop/Navbar.jsx";
import Footer from "/src/components/layout/Footer";
import SignupPopup from "../pages/auth/SignupPopup";
import Menu from "/src/components/layout/Menu";
import Service from "../components/layout/Service";
import About from "../components/layout/About";
import Profile from "../components/ui/Profile";
import Checkout from "/src/pages/checkout/Checkout";
import OrderConfirmation from "../pages/checkout/OrderConfirmation";

// ✅ បន្ថែម Import Orders
import Orders from "../pages/checkout/Orders"; // ឬ /src/pages/orders/Orders

import Sidebar from "../pages/dashboard/Sidebar";
import Overview from "../pages/dashboard/Overview";
import Manage from "../pages/dashboard/Manage";
import Order from "../pages/dashboard/Order";
import Costomer from "../pages/dashboard/Costomer";
import Setting from "../pages/dashboard/Setting";
import Login from "../pages/auth/Login";
import Category from "../pages/dashboard/Category";

function ShopLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <SignupPopup />
    </>
  );
}

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-slate-900 text-white p-6">
        <Outlet />
      </div>
    </div>
  );
}

// ✅ PrivateRoute with role check
function PrivateRoute({ requiredRole, redirectTo = "/login" }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // No token → redirect to login
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // If admin role is required
  if (requiredRole === "admin") {
    try {
      const userData = JSON.parse(user);
      if (userData.role !== "admin") {
        return <Navigate to="/" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}

function PublicRoute() {
  const token = localStorage.getItem("token");

  // ✅ If user is already logged in, redirect to home
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function Router() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* Public Routes - No authentication required */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            {/* Add other public routes here if needed */}
          </Route>

          {/* Shop Layout Routes - With Navbar & Footer */}
          <Route element={<ShopLayout />}>
            {/* Public Shop Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/service" element={<Service />} />
            <Route path="/about" element={<About />} />

            {/* Protected Shop Routes - Require Login */}
            <Route element={<PrivateRoute />}>
              {/* ✅ Profile - User Profile */}
              <Route path="/profile" element={<Profile />} />
              
              {/* ✅ Orders - User Order History */}
              <Route path="/orders" element={<Orders />} />
              
              {/* ✅ Checkout - Require Login */}
              <Route path="/checkout" element={<Checkout />} />
              
              {/* ✅ Order Confirmation - Require Login */}
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
            </Route>
          </Route>

          {/* ✅ Dashboard Routes - Admin Only! */}
          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="categories" element={<Category />} />
              <Route path="manage-foods" element={<Manage />} />
              <Route path="orders" element={<Order />} />
              <Route path="customers" element={<Costomer />} />
              <Route path="settings" element={<Setting />} />
            </Route>
          </Route>

          {/* Catch all - 404 redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}