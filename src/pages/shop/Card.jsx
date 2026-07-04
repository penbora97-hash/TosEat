import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaEye,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

export default function Card() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedItems, setAddedItems] = useState({});

  // Modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getToken = () => localStorage.getItem("token");

  const categories = [
    { id: "all", name: "ALL" },
    { id: "KHMER", name: "KHMER", icon: "🇰🇭" },
    { id: "KOREA", name: "KOREA", icon: "🇰🇷" },
    { id: "JAPAN", name: "JAPAN", icon: "🇯🇵" },
    { id: "DRINK", name: "DRINK", icon: "🥤" },
  ];

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
          nameKh: item.name_kh || item.name,
          nameEn: item.name,
          price: parseFloat(item.price) || 0,
          category: item.category?.name?.toUpperCase() || "OTHER",
          image:
            item.image_url ||
            "https://via.placeholder.com/400x300?text=No+Image",
          is_available:
            item.is_available !== undefined ? item.is_available : true,
          stock: item.stock || 0,
          rating: item.rating || 4.5,
        }));
        setFoods(formattedProducts);
      } else {
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add to Cart using API
  const handleAddToCart = async (item) => {
    const token = getToken();
    if (!token) {
      alert("Please login to add items to cart.");
      navigate("/login");
      return;
    }

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

      if (response.data.status === "success") {
        setAddedItems((prev) => ({ ...prev, [item.id]: true }));
        setTimeout(
          () => setAddedItems((prev) => ({ ...prev, [item.id]: false })),
          1200,
        );
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert(response.data.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        alert("Please login to add items to cart.");
        navigate("/login");
      } else {
        alert("Failed to add item to cart. Please try again.");
      }
    }
  };

  // Handle Check Menu - Navigate to menu with product ID
  const handleCheckMenu = (foodId) => {
    navigate(`/menu?product=${foodId}`);
  };

  // Filter foods
  const filteredFoods = foods.filter((food) => {
    const matchesTab = activeTab === "all" || food.category === activeTab;
    const matchesSearch =
      food.nameKh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch && food.is_available !== false;
  });

  // ... Modal functions (openModal, closeModal, prevImage, nextImage) ...

  if (loading) {
    return (
      <div className="w-full bg-slate-900 text-white py-16">
        <div className="max-w-[89%] mx-auto text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-slate-900 text-white py-16">
        <div className="max-w-[89%] mx-auto text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
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
    <div className="w-full bg-slate-900 text-white py-8">
      {/* ... Modal JSX ... */}

      <div className="max-w-[89%] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Curated Menu
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight">
              OUR{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                MEALS
              </span>
            </h2>
          </div>

          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search food or drink..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-emerald-500 transition-all placeholder-slate-500"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 border uppercase ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent text-white shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        {filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food, index) => (
              <div
                key={food.id}
                className="bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col cursor-pointer"
                onClick={() => openModal(food, index)}
              >
                {/* Image */}
                <div className="h-56 w-full overflow-hidden relative bg-slate-700">
                  <img
                    src={food.image}
                    alt={food.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                      🔍 Click to view
                    </div>
                  </div>

                  {food.stock <= 0 && (
                    <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs px-3 py-1 rounded-full font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {food.nameKh}
                      </h3>
                      <span className="text-xl font-black text-emerald-400">
                        ${food.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      {food.nameEn}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(food.rating)
                              ? "text-yellow-400"
                              : "text-slate-600"
                          }
                        />
                      ))}
                      <span className="text-slate-400 ml-1">
                        ({food.rating})
                      </span>
                    </div>
                  </div>

                  {/* ✅ Check Menu + Add to Cart */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckMenu(food.id);
                      }}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <FaEye className="text-sm" />
                      Check Menu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-slate-400 text-lg">No dishes found</p>
            <p className="text-slate-500 text-sm">
              Try a different category or search term
            </p>
          </div>
        )}

        {/* View More Button */}
        <div className="flex justify-center mt-8">
          <Link to="/menu">
            <button className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-lg tracking-wide">
              View More →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
