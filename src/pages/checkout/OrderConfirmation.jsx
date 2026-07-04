import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCheckCircle, FiHome, FiShoppingBag } from "react-icons/fi";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    if (!order) {
      fetchLatestOrder();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLatestOrder = async () => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        const orders = response.data.data.data || response.data.data || [];
        if (orders.length > 0) {
          setOrder(orders[0]);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to format price
  const formatPrice = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-400";
      case "confirmed":
        return "text-blue-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-emerald-400";
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "Cash on Delivery";
      case "aba":
        return "ABA Pay";
      case "khqr":
        return "KHQR";
      case "card":
        return "Credit/Debit Card";
      default:
        return method || "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">No order found</h2>
          <p className="text-slate-400 mb-6">
            You haven't placed any orders yet.
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
          >
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <FiCheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">🎉 Order Confirmed!</h1>
        <p className="text-slate-400 mb-6">
          Your order has been placed successfully. We'll notify you when it's
          ready.
        </p>

        {/* Order Details */}
        <div className="bg-slate-900 rounded-xl p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Order ID</span>
            <span className="font-semibold text-emerald-400">
              {order.order_number || order.id || "N/A"}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Total Amount</span>
            <span className="font-semibold text-white">
              ${formatPrice(order.total_amount || order.total || 0)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Payment Method</span>
            <span className="font-semibold capitalize">
              {getPaymentMethodLabel(
                order.payment_method || order.paymentMethod,
              )}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Delivery Address</span>
            <span className="font-semibold text-sm text-right">
              {order.delivery_address || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className={`font-semibold ${getStatusColor(order.status)}`}>
              {order.status || "Pending"}
            </span>
          </div>
          {order.created_at && (
            <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
              <span className="text-slate-400">Order Date</span>
              <span className="font-semibold text-sm">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Order Items Preview */}
        {order.items && order.items.length > 0 && (
          <div className="bg-slate-900 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">
              Items Ordered
            </h3>
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item, index) => {
                const price =
                  typeof item.product_price === "number"
                    ? item.product_price
                    : parseFloat(item.product_price) || 0;
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {item.product_name || item.name} × {item.quantity}
                    </span>
                    <span className="text-white">${formatPrice(price)}</span>
                  </div>
                );
              })}
              {order.items.length > 3 && (
                <p className="text-slate-400 text-xs text-center">
                  + {order.items.length - 3} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FiHome className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate("/menu")}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <FiShoppingBag className="w-5 h-5" />
            Order More Food
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
