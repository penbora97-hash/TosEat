import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FaCartShopping } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { FiClock, FiLogOut } from "react-icons/fi";
import axios from "axios";
import LoginModal from "/src/pages/auth/Login";
import RegisterModal from "/src/pages/auth/Register";
import SignupPopup from "/src/pages/auth/SignupPopup";
import CartDrawer from "/src/pages/checkout/CartDrawer";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileAvatar, setProfileAvatar] = useState(null);

  const getToken = () => localStorage.getItem("token");

  // Load cart count from API
  const loadCartCount = async () => {
    const token = getToken();
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/api/cart/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.status === "success") {
        setCartCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
      // Fallback: try to get from cart API
      try {
        const cartResponse = await axios.get("http://localhost:8000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cartResponse.data.status === "success") {
          const items = cartResponse.data.data.items || [];
          const total = items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0,
          );
          setCartCount(total);
        }
      } catch (err) {
        setCartCount(0);
      }
    }
  };

  // Check login status and get user data
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const userParsed = JSON.parse(user);
        setIsLoggedIn(true);
        setUserData(userParsed);
        loadProfileAvatar();
      } catch (e) {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      setProfileAvatar(null);
    }
  };

  // Load profile avatar
  const loadProfileAvatar = () => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        if (parsed.avatar_url) {
          let avatar = parsed.avatar_url;
          if (avatar.startsWith("http")) {
            setProfileAvatar(avatar);
          } else if (avatar.startsWith("/storage/")) {
            setProfileAvatar(`http://localhost:8000${avatar}`);
          } else if (avatar.startsWith("storage/")) {
            setProfileAvatar(`http://localhost:8000/${avatar}`);
          } else if (avatar.startsWith("avatars/")) {
            setProfileAvatar(`http://localhost:8000/storage/${avatar}`);
          } else {
            setProfileAvatar(`http://localhost:8000/storage/${avatar}`);
          }
        } else {
          setProfileAvatar(null);
        }
      } catch (e) {
        setProfileAvatar(null);
      }
    } else {
      setProfileAvatar(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    loadCartCount();

    // Listen for login/logout changes
    window.addEventListener("loginStatusChanged", checkLoginStatus);
    window.addEventListener("authChange", checkLoginStatus);
    window.addEventListener("profileUpdated", loadProfileAvatar);

    // Listen for cart updates
    window.addEventListener("cartUpdated", loadCartCount);

    return () => {
      window.removeEventListener("loginStatusChanged", checkLoginStatus);
      window.removeEventListener("authChange", checkLoginStatus);
      window.removeEventListener("profileUpdated", loadProfileAvatar);
      window.removeEventListener("cartUpdated", loadCartCount);
    };
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Service", path: "/service" },
    { name: "About Us", path: "/about" },
  ];

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleSignupPopupToLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    setIsLoggedIn(false);
    setUserData(null);
    setProfileAvatar(null);
    window.dispatchEvent(new Event("loginStatusChanged"));
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  // Get user display name
  const getDisplayName = () => {
    if (userData) {
      return userData.full_name || userData.name || "User";
    }
    return "User";
  };

  // Get user initial
  const getInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Check if user is Admin
  const isAdmin = userData?.role === "admin";

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-white via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              TosEat
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-lg font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `relative transition-all py-1 ${
                    isActive
                      ? "text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* ✅ Admin Dashboard Link */}
            {isAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `relative transition-all py-1 px-3 bg-emerald-500/10 rounded-xl ${
                    isActive
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl transition shadow-md shadow-emerald-500/20"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* ✅ Orders Button */}
                <button
                  onClick={() => navigate("/orders")}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  <FiClock className="text-emerald-400" />
                  <span className="hidden lg:inline">Orders</span>
                </button>

                {/* Profile */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-xl transition group"
                >
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt={getDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        setProfileAvatar(null);
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {getInitial()}
                    </div>
                  )}
                  <span className="text-sm text-slate-300 group-hover:text-white transition">
                    {getDisplayName()}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </Link>
              </div>
            )}

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition relative"
            >
              <FaCartShopping className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center gap-1 md:hidden">
            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 hover:bg-slate-800 text-slate-300 rounded-xl transition relative"
            >
              <FaCartShopping className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Profile/Login */}
            {isLoggedIn ? (
              <Link
                to="/profile"
                className="p-2.5 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              >
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt={getDisplayName()}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      setProfileAvatar(null);
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                    {getInitial()}
                  </div>
                )}
              </Link>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="p-2.5 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              >
                <CgProfile className="text-xl" />
              </button>
            )}

            {/* Menu Toggle */}
            <button
              className="p-2.5 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <AiOutlineClose size={22} />
              ) : (
                <AiOutlineMenu size={22} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-t border-slate-800 absolute top-full left-0 w-full py-4 px-4 shadow-xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-3 px-4 rounded-xl transition ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-900"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              {/* ✅ Admin Dashboard in Mobile */}
              {isAdmin && (
                <NavLink
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-3 px-4 rounded-xl transition ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-900"
                    }`
                  }
                >
                  📊 Dashboard
                </NavLink>
              )}

              {/* ✅ Orders in Mobile */}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/orders");
                  }}
                  className="py-3 px-4 text-left text-slate-300 hover:bg-slate-900 rounded-xl transition flex items-center gap-2"
                >
                  <FiClock className="text-emerald-400" />
                  My Orders
                </button>
              )}

              <div className="pt-3 mt-2 border-t border-slate-800">
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="py-3 text-center text-slate-300 hover:bg-slate-900 rounded-xl text-sm font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsRegisterModalOpen(true);
                      }}
                      className="py-3 text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 px-4 text-center bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <CgProfile />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="py-3 px-4 text-center text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-900/95 z-50 flex items-start justify-center pt-20 px-4">
            <div className="w-full max-w-md relative">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute -top-12 right-0 text-slate-400 hover:text-white transition"
              >
                <AiOutlineClose size={24} />
              </button>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 focus-within:border-emerald-500/60 transition-all">
                <CiSearch className="text-slate-400 text-xl mr-3" />
                <input
                  type="text"
                  placeholder="Search food..."
                  className="bg-transparent outline-none text-sm flex-1 placeholder-slate-500 text-white"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <SignupPopup onSwitchToLogin={handleSignupPopupToLogin} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
