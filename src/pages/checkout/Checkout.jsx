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
  FiClock,
  FiCheckCircle,
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiFileText,
  FiLoader,
} from "react-icons/fi";
import { HiOutlineCash } from "react-icons/hi";
import {
  FaWallet,
  FaQrcode,
  FaCreditCard as FaCreditCardSolid,
} from "react-icons/fa";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(2.5);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    delivery_address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [currentStep, setCurrentStep] = useState(2);
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // Payment Methods
  const paymentMethods = [
    {
      id: "aba",
      name: "ABA Pay",
      icon: <FaWallet className="text-blue-400" />,
      description: "Instant transfer via ABA",
      color: "bg-blue-500/10 border-blue-500/30",
    },
    {
      id: "khqr",
      name: "KHQR",
      icon: <FaQrcode className="text-purple-400" />,
      description: "Scan to pay with KHQR",
      color: "bg-purple-500/10 border-purple-500/30",
    },
    {
      id: "cash",
      name: "Cash on Delivery",
      icon: <HiOutlineCash className="text-green-400" />,
      description: "Pay when you receive",
      color: "bg-green-500/10 border-green-500/30",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <FaCreditCardSolid className="text-yellow-400" />,
      description: "Visa, Mastercard",
      color: "bg-yellow-500/10 border-yellow-500/30",
    },
  ];

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

  const loadCartFromAPI = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        const items = response.data.data.items || [];
        setCartItems(items);

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

        const delivery = subtotalPrice > 20 ? 0 : 2.5;
        setDeliveryFee(delivery);

        const totalAmount = subtotalPrice + delivery + taxAmount;
        setTotal(totalAmount);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setError("Failed to load cart. Please try again.");
    }
  };

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

  const removeItem = async (productId) => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.delete(`http://localhost:8000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 8) {
      errors.phone = "Phone number must be at least 8 digits";
    }
    if (!formData.delivery_address.trim()) {
      errors.delivery_address = "Delivery address is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector(".border-red-500");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Please login to place an order.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        delivery_address: formData.delivery_address.trim(),
        payment_method: paymentMethod,
        notes: formData.notes?.trim() || "",
        items: cartItems.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: parseFloat(item.product?.price) || 0,
        })),
      };

      console.log("📦 Sending order:", orderData);

      const response = await axios.post(
        "http://localhost:8000/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === "success") {
        setSuccess(true);
        const order = response.data.data;
        setPlacedOrderData(order);
        setCurrentStep(3);
        window.dispatchEvent(new Event("cartUpdated"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      if (error.response) {
        if (error.response.status === 422) {
          const errors = error.response.data.errors || {};
          const errorMessages = Object.values(errors).flat();
          setError(errorMessages.join("\n"));
          setFormErrors(errors);
        } else if (error.response.status === 401) {
          setError("Please login again to place an order.");
        } else {
          setError(error.response.data?.message || "Failed to place order");
        }
      } else {
        setError("Cannot connect to server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value) || 0;
    return num.toFixed(2);
  };

  // Step Indicator
  const renderStepIndicator = () => (
    <div className="flex items-center w-full max-w-4xl mx-auto mb-8">
      {[
        { number: 1, label: "Cart" },
        { number: 2, label: "Delivery" },
        { number: 3, label: "Confirm" },
      ].map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                currentStep >= step.number
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {currentStep > step.number ? <FiCheckCircle /> : step.number}
            </div>
            <span
              className={`text-xs md:text-sm font-medium hidden sm:block ${
                currentStep >= step.number ? "text-white" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < 2 && (
            <div
              className={`flex-1 h-0.5 mx-2 md:mx-4 transition-all duration-300 ${
                currentStep > step.number ? "bg-emerald-500" : "bg-slate-700"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Success Page
  if (success && placedOrderData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/menu")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
          >
            <FiArrowLeft /> Back to Menu
          </button>

          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-12 h-12 text-emerald-400" />
            </div>

            <h2 className="text-3xl font-bold mb-2">🎉 Order Placed!</h2>
            <p className="text-slate-400 mb-6">
              Your order has been placed successfully. We'll notify you when
              it's confirmed.
            </p>

            <div className="bg-slate-900 rounded-2xl p-6 text-left space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono text-emerald-400">
                  #{placedOrderData.order_number || placedOrderData.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total</span>
                <span className="text-xl font-bold text-emerald-400">
                  ${formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment</span>
                <span className="capitalize">
                  {paymentMethods.find((m) => m.id === paymentMethod)?.name ||
                    paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Address</span>
                <span className="text-right">{formData.delivery_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-amber-400">Pending Confirmation</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate("/menu")}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart
  if (cartItems.length === 0 && !loading) {
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

  // Main Checkout
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
        >
          <FiArrowLeft /> Back
        </button>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-slate-400 mb-6">Complete your order details</p>

        {renderStepIndicator()}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 whitespace-pre-line">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiShoppingBag className="text-emerald-400" />
                Order Summary ({cartItems.length} items)
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => {
                  const price = parseFloat(item.product?.price) || 0;
                  const quantity = parseInt(item.quantity) || 1;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-slate-900 rounded-xl p-3 hover:bg-slate-800 transition"
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
                        <h4 className="font-medium truncate">
                          {item.product?.name || "Unknown"}
                        </h4>
                        <p className="text-emerald-400 text-sm">
                          ${formatPrice(price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id || item.id, -1)
                          }
                          className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="font-medium min-w-[24px] text-center text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id || item.id, 1)
                          }
                          className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product_id || item.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-500 transition ml-1"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiMapPin className="text-emerald-400" />
                Delivery Information
              </h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                          formErrors.full_name
                            ? "border-red-500"
                            : "border-slate-700"
                        } rounded-xl text-white focus:border-emerald-500 outline-none transition`}
                        placeholder="Your full name"
                      />
                    </div>
                    {formErrors.full_name && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.full_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-slate-700"
                        } rounded-xl text-white focus:border-emerald-500 outline-none transition`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                        formErrors.phone ? "border-red-500" : "border-slate-700"
                      } rounded-xl text-white focus:border-emerald-500 outline-none transition`}
                      placeholder="012 345 678"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Delivery Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-900 border ${
                      formErrors.delivery_address
                        ? "border-red-500"
                        : "border-slate-700"
                    } rounded-xl text-white focus:border-emerald-500 outline-none transition`}
                    placeholder="Street, Building, House number..."
                  />
                  {formErrors.delivery_address && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.delivery_address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Order Notes{" "}
                    <span className="text-slate-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-slate-500" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition resize-none"
                      placeholder="Special instructions, delivery preferences..."
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing Summary */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Pricing Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Fee</span>
                  <span>
                    {deliveryFee === 0
                      ? "FREE"
                      : `$${formatPrice(deliveryFee)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax (5%)</span>
                  <span>${formatPrice(tax)}</span>
                </div>
                {subtotal > 20 && (
                  <div className="text-emerald-400 text-xs text-right">
                    🎉 Free delivery for orders over $20
                  </div>
                )}
                <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-400">
                    ${formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                        paymentMethod === method.id
                          ? `${method.color} border-emerald-500`
                          : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      />
                      <div className="text-xl">{method.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-slate-400">
                          {method.description}
                        </p>
                      </div>
                      {paymentMethod === method.id && (
                        <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiShoppingBag className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/menu")}
                className="w-full mt-2 py-2 text-slate-400 hover:text-white text-sm transition text-center"
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
