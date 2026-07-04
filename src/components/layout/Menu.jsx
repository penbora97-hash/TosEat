import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import axios from "axios";

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [addedItems, setAddedItems] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [categories, setCategories] = useState([
    { id: "ALL", label: "All", emoji: "🍽️" },
    { id: "KHMER", label: "Khmer", emoji: "🇰🇭" },
    { id: "KOREA", label: "Korean", emoji: "🇰🇷" },
    { id: "JAPAN", label: "Japanese", emoji: "🇯🇵" },
    { id: "DRINK", label: "Drinks", emoji: "🥤" },
  ]);

  const getToken = () => localStorage.getItem("token");

  // Check URL for product ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get("product");
    if (productId) {
      setHighlightedId(parseInt(productId));

      setTimeout(() => {
        const element = document.getElementById(`product-${productId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.style.transition = "all 0.5s ease";
          element.style.boxShadow =
            "0 0 0 4px #10b981, 0 0 30px rgba(16, 185, 129, 0.3)";
          setTimeout(() => {
            element.style.boxShadow = "none";
          }, 3000);
        }
      }, 500);
    }
  }, [location.search, menuItems]);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8000/api/products");
      console.log("Products Response:", response.data);

      if (response.data.status === "success") {
        const products = response.data.data.data || response.data.data || [];
        const formattedProducts = products.map((item) => ({
          id: item.id,
          name: item.name || "Unknown",
          khmerName: item.name_kh || item.name || "Unknown",
          price: parseFloat(item.price) || 0,
          category: item.category?.name?.toUpperCase() || "OTHER",
          categoryId: String(item.category_id || item.category?.id || "OTHER"),
          image:
            item.image_url ||
            "https://via.placeholder.com/400x300?text=No+Image",
          is_available:
            item.is_available !== undefined ? item.is_available : true,
          stock: item.stock || 0,
        }));
        setMenuItems(formattedProducts);
      } else {
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
      setError("Failed to load menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show Login Modal
  const showLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  // ✅ Show Register Modal
  const showRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  // ✅ Add to Cart using API
  const handleAddToCart = async (item) => {
    const token = getToken();
    if (!token) {
      // ✅ Show login modal instead of alert
      showLoginModal();
      return;
    }

    // Check stock
    if (item.stock <= 0) {
      alert("Sorry, this item is out of stock.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/cart",
        {
          product_id: item.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Add to Cart Response:", response.data);

      if (response.data.status === "success") {
        // Show added animation
        setAddedItems((prev) => ({ ...prev, [item.id]: true }));
        setTimeout(
          () => setAddedItems((prev) => ({ ...prev, [item.id]: false })),
          1200,
        );

        // Trigger cart update for Navbar and CartDrawer
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert(response.data.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        showLoginModal();
      } else if (error.response?.status === 400) {
        alert(error.response.data?.message || "Product is not available");
      } else {
        alert("Failed to add item to cart. Please try again.");
      }
    }
  };

  // Filter and sort items
  const filteredItems = menuItems
    .filter((item) => {
      const cat =
        activeCategory === "ALL" ||
        item.category === activeCategory ||
        item.categoryId === activeCategory;
      const s =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.khmerName.toLowerCase().includes(searchTerm.toLowerCase());
      const available = item.is_available !== false;
      return cat && s && available;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800 rounded-2xl p-8 border border-slate-700 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-white text-xl font-bold mb-2">
            Something went wrong
          </h3>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ─── LOGIN MODAL ─── */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full relative animate-fade-slide-up">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Welcome Back
            </h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
              />
              <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition">
                Login
              </button>
            </form>
            <p className="text-center text-slate-400 mt-4">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  showRegisterModal();
                }}
                className="text-emerald-400 hover:text-emerald-300 transition"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ─── REGISTER MODAL ─── */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full relative animate-fade-slide-up">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Create Account
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
              />
              <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition">
                Sign Up
              </button>
            </form>
            <p className="text-center text-slate-400 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  showLoginModal();
                }}
                className="text-emerald-400 hover:text-emerald-300 transition"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-900/50 to-teal-900/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-400 mb-2 uppercase">
            Full Catalog
          </p>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tight">
              Our{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Menu
              </span>
            </h1>
            <div className="text-right">
              <div className="text-4xl md:text-5xl font-black text-emerald-400 leading-none">
                {filteredItems.length}
              </div>
              <div className="text-xs tracking-[0.12em] text-slate-400 uppercase">
                Dishes Found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm cursor-pointer outline-none focus:border-emerald-500 transition"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <IoIosSearch className="text-xl" />
            </span>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-white text-xl font-bold">No dishes found</h3>
            <p className="text-slate-400">
              Try a different category or search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                id={`product-${item.id}`}
                className={`group bg-slate-800 rounded-2xl overflow-hidden border transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 ${
                  highlightedId === item.id
                    ? "border-emerald-500 shadow-lg shadow-emerald-500/30"
                    : "border-slate-700/50 hover:border-emerald-500/50"
                }`}
              >
                {/* Card image */}
                <div className="relative h-48 overflow-hidden bg-slate-700">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                  {highlightedId === item.id && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                      🔍 Selected
                    </div>
                  )}

                  {item.stock !== undefined && item.stock <= 0 && (
                    <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 font-bold text-sm tracking-wider">
                      {item.category || "KH"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-white font-medium text-base">
                      {item.khmerName} - {item.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <span className="text-xl font-bold text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock !== undefined && item.stock <= 0}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        item.stock !== undefined && item.stock <= 0
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : addedItems[item.id]
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      }`}
                    >
                      {item.stock !== undefined && item.stock <= 0
                        ? "Out of Stock"
                        : addedItems[item.id]
                          ? "✓ Added"
                          : "+ ADD TO CART"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
