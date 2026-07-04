import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FaCartShopping } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import LoginModal from "/src/pages/auth/Login";
import RegisterModal from "/src/pages/auth/Register";
import SignupPopup from "/src/pages/auth/SignupPopup";
import CartDrawer from "/src/pages/checkout/CartDrawer";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getToken = () => localStorage.getItem("token");

  // ✅ Load cart count from API
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
      setCartCount(0);
    }
  };

  // Check login status and get user data
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          const userParsed = JSON.parse(user);
          setIsLoggedIn(true);
          setUserData(userParsed);
        } catch (e) {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkLoginStatus();
    loadCartCount();

    // Listen for login/logout changes
    window.addEventListener("loginStatusChanged", checkLoginStatus);
    window.addEventListener("authChange", checkLoginStatus);

    // Listen for cart updates
    window.addEventListener("cartUpdated", loadCartCount);

    return () => {
      window.removeEventListener("loginStatusChanged", checkLoginStatus);
      window.removeEventListener("authChange", checkLoginStatus);
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

  // Get user display name
  const getDisplayName = () => {
    if (userData) {
      return userData.full_name || userData.name || "User";
    }
    return "User";
  };

  // Get user avatar initial
  const getInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Get user profile avatar from localStorage
  const getProfileAvatar = () => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        if (parsed.avatar_url) {
          const avatar = parsed.avatar_url;
          if (avatar.startsWith("http")) {
            return avatar;
          }
          if (avatar.startsWith("avatars/")) {
            return `http://localhost:8000/storage/${avatar}`;
          }
          return `http://localhost:8000/storage/${avatar}`;
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const profileAvatar = getProfileAvatar();

  // ✅ Check if user is Admin
  const isAdmin = userData?.role === "admin";

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4 text-white font-medium sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                TosEat
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-[15px]">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `relative transition-all py-1 px-1 text-xl tracking-wide ${
                    isActive
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-7">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 text-xm font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition"
                >
                  Login
                </button>

                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xm font-bold rounded-xl transition-all shadow-md"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-xl transition"
                >
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt={getDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {getInitial()}
                    </div>
                  )}
                  <span className="text-sm text-slate-300 font-medium">
                    {getDisplayName()}
                  </span>
                  {isAdmin && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </Link>
              </>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition relative"
            >
              <FaCartShopping className="text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 hover:bg-slate-800 text-slate-300 rounded-xl transition relative"
            >
              <FaCartShopping className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              to={isLoggedIn ? "/profile" : "/login"}
              className="p-2.5 hover:bg-slate-800 text-slate-300 rounded-xl transition"
            >
              {isLoggedIn && profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt={getDisplayName()}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                />
              ) : isLoggedIn ? (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                  {getInitial()}
                </div>
              ) : (
                <CgProfile className="text-xl" />
              )}
            </Link>

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
          <div className="md:hidden bg-slate-950 border-t border-slate-800 absolute top-full left-0 w-full py-6 px-4 shadow-xl">
            <div className="flex flex-col gap-4 text-base">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-2 px-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-900"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="py-2.5 text-center text-slate-300 hover:bg-slate-900 rounded-xl text-sm font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsRegisterModalOpen(true);
                      }}
                      className="py-2.5 text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 text-center bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("userProfile");
                        window.dispatchEvent(new Event("loginStatusChanged"));
                        window.location.reload();
                      }}
                      className="py-2.5 text-center text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium"
                    >
                      Logout
                    </button>
                  </>
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
