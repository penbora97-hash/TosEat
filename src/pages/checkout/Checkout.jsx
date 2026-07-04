import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiCreditCard,
  FiSmartphone,
} from "react-icons/fi";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(2.5);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    delivery_address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    loadCartFromAPI();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData((prev) => ({
          ...prev,
          full_name: user.full_name || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
      } catch (e) {
        console.error("Error loading user data:", e);
      }
    }
  };

  // Load cart from API
  const loadCartFromAPI = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        const items = response.data.data.items || [];
        setCartItems(items);

        // ✅ Ensure all values are numbers
        const subtotalPrice = items.reduce(
          (sum, item) =>
            sum +
            (parseFloat(item.product?.price) || 0) *
              (parseInt(item.quantity) || 0),
          0,
        );
        setSubtotal(subtotalPrice);

        const taxAmount = subtotalPrice * 0.05;
        setTax(taxAmount);

        const totalAmount = subtotalPrice + deliveryFee + taxAmount;
        setTotal(totalAmount);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setError("Failed to load cart. Please try again.");
    }
  };

  // Update quantity via API
  const updateQuantity = async (productId, change) => {
    const token = getToken();
    if (!token) return;

    const item = cartItems.find(
      (item) => item.product_id === productId || item.id === productId,
    );
    const newQuantity = (item?.quantity || 0) + change;

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
      await loadCartFromAPI();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  // Remove item via API
  const removeItem = async (productId) => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.delete(`http://localhost:8000/api/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await loadCartFromAPI();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert("Please login to place an order.");
      navigate("/login");
      return;
    }

    if (!formData.delivery_address) {
      alert("Please enter your delivery address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/orders",
        {
          delivery_address: formData.delivery_address,
          payment_method: paymentMethod,
          notes: formData.notes || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Order Response:", response.data);

      if (response.data.status === "success") {
        const order = response.data.data;
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/order-confirmation", { state: { order } });
      } else {
        setError(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      if (error.response) {
        if (error.response.status === 400) {
          setError(error.response.data.message || "Cart is empty or invalid");
        } else if (error.response.status === 401) {
          setError("Please login again to place an order.");
        } else if (error.response.status === 422) {
          const errors = error.response.data.errors;
          const errorMessages = Object.values(errors).flat().join("\n");
          setError(errorMessages);
        } else {
          setError(error.response.data?.message || "Failed to place order");
        }
      } else {
        setError("Cannot connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format number to currency
  const formatPrice = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value) || 0;
    return num.toFixed(2);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-6">
            Add some delicious food to your cart
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const price = parseFloat(item.product?.price) || 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-slate-900 rounded-xl p-3"
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
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item.product?.name || "Unknown"}
                        </h4>
                        <p className="text-emerald-400 text-sm">
                          ${formatPrice(price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id || item.id, -1)
                          }
                          className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="font-medium min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id || item.id, 1)
                          }
                          className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product_id || item.id)}
                          className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-500 transition ml-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition resize-none"
                    placeholder="Special instructions, delivery preferences..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Fee</span>
                  <span>${formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax (5%)</span>
                  <span>${formatPrice(tax)}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-400">
                    ${formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FiCreditCard className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    DIGITAL WALLETS
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* ABA Pay */}
                  <label className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/80 transition border-2 border-transparent hover:border-emerald-500/30">
                    <input
                      type="radio"
                      name="payment"
                      value="aba"
                      checked={paymentMethod === "aba"}
                      onChange={() => setPaymentMethod("aba")}
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                    />
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center">
                        <img
                          src="https://yt3.googleusercontent.com/ytc/AIdro_ljV-vXKHv8x9yHY_Z6RuI9jutIh6f8D0O1oYIY43fJiNo=s900-c-k-c0x00ffffff-no-rj"
                          alt="ABA Bank"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">ABA</p>
                        <p className="text-xs text-slate-400">
                          ABA Pay • Instant transfer
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "aba" && (
                      <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </label>

                  {/* KHQR */}
                  <label className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/80 transition border-2 border-transparent hover:border-emerald-500/30">
                    <input
                      type="radio"
                      name="payment"
                      value="khqr"
                      checked={paymentMethod === "khqr"}
                      onChange={() => setPaymentMethod("khqr")}
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                    />
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                          alt="KHQR"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">KHQR</p>
                        <p className="text-xs text-slate-400">Scan to pay</p>
                      </div>
                    </div>
                    {paymentMethod === "khqr" && (
                      <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </label>

                  {/* Cash on Delivery */}
                  <label className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/80 transition border-2 border-transparent hover:border-emerald-500/30">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                    />
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <FiSmartphone className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Cash</p>
                        <p className="text-xs text-slate-400">
                          Pay on delivery
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "cash" && (
                      <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    <FiShoppingBag className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/menu")}
                className="w-full mt-3 py-2 text-slate-400 hover:text-white text-sm transition text-center"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
