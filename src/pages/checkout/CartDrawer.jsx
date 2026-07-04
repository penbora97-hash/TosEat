import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiX, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem("token");

  // Load cart from API
  const loadCart = async () => {
    const token = getToken();
    if (!token) {
      setCartItems([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cart Response:", response.data);

      if (response.data.status === "success") {
        const items = response.data.data.items || [];
        setCartItems(items);
        // ✅ Ensure total is a number
        const totalAmount = response.data.data.total || 0;
        setTotal(
          typeof totalAmount === "number"
            ? totalAmount
            : parseFloat(totalAmount) || 0,
        );
      } else {
        setError(response.data.message || "Failed to load cart");
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      if (error.response?.status === 401) {
        setError("Please login to view cart");
      } else {
        setError("Failed to load cart. Please try again.");
      }
      setCartItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Update quantity via API
  const updateQuantity = async (productId, change) => {
    const token = getToken();
    if (!token) {
      alert("Please login to update cart.");
      return;
    }

    // Find the item
    const item = cartItems.find((item) => item.product_id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      await axios.put(
        `http://localhost:8000/api/cart/${productId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  // Remove item via API
  const removeItem = async (productId) => {
    const token = getToken();
    if (!token) {
      alert("Please login to remove items.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🛒</span> Your Cart
            {cartItems.length > 0 && (
              <span className="text-sm text-emerald-400 font-normal">
                ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                items)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-white text-xl font-bold">
                Your cart is empty
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                Start adding some delicious food!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              // ✅ Ensure price is a number
              const price =
                typeof item.product?.price === "number"
                  ? item.product.price
                  : parseFloat(item.product?.price) || 0;

              return (
                <div
                  key={item.id}
                  className="bg-slate-800 rounded-xl p-3 flex items-center gap-3 border border-slate-700"
                >
                  <img
                    src={
                      item.product?.image_url ||
                      "https://via.placeholder.com/80x80?text=Food"
                    }
                    alt={item.product?.name || "Food"}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/80x80?text=Food";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">
                      {item.product?.name || "Unknown"}
                    </h4>
                    <p className="text-emerald-400 text-sm font-semibold">
                      ${price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, -1)}
                      className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-medium min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, 1)}
                      className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-500 transition ml-1"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-800 p-4 bg-slate-900">
            <div className="flex justify-between mb-4">
              <span className="text-slate-400">Total</span>
              <span className="text-white text-xl font-bold">
                ${typeof total === "number" ? total.toFixed(2) : "0.00"}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
