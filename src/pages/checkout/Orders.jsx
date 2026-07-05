// src/pages/checkout/Orders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiArrowLeft,
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Modal States
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const token = localStorage.getItem("token");

  // Modal Helpers
  const showModal = ({
    type,
    title,
    message,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
  }) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      onConfirm: null,
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Orders Response:", response.data);

      if (response.data.status === "success") {
        const ordersData = response.data.data.data || response.data.data || [];
        setOrders(ordersData);
        calculateStats(ordersData);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        setError("Please login again to view your orders.");
      } else {
        setError("Failed to load orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter((o) => o.status === "pending").length,
      confirmed: ordersData.filter((o) => o.status === "confirmed").length,
      preparing: ordersData.filter((o) => o.status === "preparing").length,
      out_for_delivery: ordersData.filter(
        (o) => o.status === "out_for_delivery",
      ).length,
      delivered: ordersData.filter((o) => o.status === "delivered").length,
      cancelled: ordersData.filter((o) => o.status === "cancelled").length,
    };
    setStats(stats);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        icon: <FiClock className="text-amber-400" />,
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        dot: "bg-amber-400",
        step: 1,
      },
      confirmed: {
        label: "Confirmed",
        icon: <FiCheckCircle className="text-blue-400" />,
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
        dot: "bg-blue-400",
        step: 2,
      },
      preparing: {
        label: "Preparing",
        icon: <FiPackage className="text-purple-400" />,
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
        dot: "bg-purple-400",
        step: 3,
      },
      out_for_delivery: {
        label: "Out for Delivery",
        icon: <FaMotorcycle className="text-orange-400" />,
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
        dot: "bg-orange-400",
        step: 4,
      },
      delivered: {
        label: "Delivered",
        icon: <FiCheckCircle className="text-emerald-400" />,
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        dot: "bg-emerald-400",
        step: 5,
      },
      cancelled: {
        label: "Cancelled",
        icon: <FiXCircle className="text-red-400" />,
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
        dot: "bg-red-400",
        step: 0,
      },
    };
    return configs[status] || configs.pending;
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (filter !== "all") {
      filtered = filtered.filter((order) => order.status === filter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(term) ||
          order.items?.some((item) => item.name?.toLowerCase().includes(term)),
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatPrice = (amount) => {
    const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
    return num.toFixed(2);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    showModal({
      type: "confirm",
      title: "Cancel Order",
      message:
        "Are you sure you want to cancel this order? This action cannot be undone.",
      confirmText: "Yes, Cancel Order",
      cancelText: "No, Keep Order",
      onConfirm: async () => {
        try {
          const response = await axios.patch(
            `http://localhost:8000/api/orders/${orderId}`,
            { status: "cancelled" },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (response.data.status === "success") {
            await fetchOrders();
            showModal({
              type: "success",
              title: "Order Cancelled ✅",
              message: "Your order has been cancelled successfully.",
              confirmText: "OK",
            });
          } else {
            throw new Error(response.data.message || "Failed to cancel order");
          }
        } catch (error) {
          console.error("Error cancelling order:", error);
          let errorMessage = "Failed to cancel order. Please try again.";

          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          showModal({
            type: "error",
            title: "Cancellation Failed ❌",
            message: errorMessage,
            confirmText: "OK",
          });
        }
      },
    });
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-2"
            >
              <FiArrowLeft /> Back
            </button>
            <h1 className="text-3xl md:text-4xl font-bold">My Orders</h1>
            <p className="text-slate-400 mt-1">
              Track and manage all your orders
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-2"
          >
            <FiRefreshCw className="text-slate-400" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <StatCard
            label="Total"
            value={stats.total}
            color="text-white"
            bg="bg-slate-700"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="text-amber-400"
            bg="bg-amber-500/10"
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard
            label="Preparing"
            value={stats.preparing}
            color="text-purple-400"
            bg="bg-purple-500/10"
          />
          <StatCard
            label="Delivery"
            value={stats.out_for_delivery}
            color="text-orange-400"
            bg="bg-orange-500/10"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            color="text-red-400"
            bg="bg-red-500/10"
          />
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number or item..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "preparing", label: "Preparing" },
                { value: "out_for_delivery", label: "Delivery" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                    filter === btn.value
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            filter={filter}
            navigate={navigate}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                status={getStatusConfig(order.status)}
                formatDate={formatDate}
                formatPrice={formatPrice}
                onView={handleViewOrder}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setShowDetailModal(false)}
            formatDate={formatDate}
            formatPrice={formatPrice}
            getStatusConfig={getStatusConfig}
            onCancel={handleCancelOrder}
          />
        )}

        {/* Custom Modal */}
        {modal.isOpen && (
          <CustomModal
            type={modal.type}
            title={modal.title}
            message={modal.message}
            onClose={closeModal}
            onConfirm={modal.onConfirm}
            confirmText={modal.confirmText}
            cancelText={modal.cancelText}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

// ✅ Stat Card Component
function StatCard({ label, value, color, bg }) {
  return (
    <div
      className={`${bg} rounded-xl p-3 text-center border border-slate-700/50`}
    >
      <p className="text-[10px] text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ✅ Empty State Component
function EmptyState({ searchTerm, filter, navigate }) {
  return (
    <div className="bg-slate-800 rounded-3xl p-12 text-center border border-slate-700">
      <div className="text-6xl mb-4">📦</div>
      <h3 className="text-2xl font-bold mb-2">No orders found</h3>
      <p className="text-slate-400 mb-6">
        {searchTerm || filter !== "all"
          ? "Try adjusting your filters or search terms"
          : "Start ordering some delicious food!"}
      </p>
      <button
        onClick={() => navigate("/menu")}
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition"
      >
        Browse Menu
      </button>
    </div>
  );
}

// ✅ Order Card Component
function OrderCard({
  order,
  status,
  formatDate,
  formatPrice,
  onView,
  onCancel,
}) {
  // Get image from items
  const getThumbnail = () => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      return (
        firstItem.image ||
        firstItem.product_image ||
        firstItem.product?.image_url ||
        firstItem.image_url ||
        "https://via.placeholder.com/80x80?text=🍽️"
      );
    }
    return "https://via.placeholder.com/80x80?text=📦";
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-slate-600 transition">
      <div className="flex gap-4">
        {/* Image Thumbnail */}
        <div className="hidden sm:block w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
          <img
            src={getThumbnail()}
            alt="Order"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/80x80?text=🍽️";
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-slate-400">
              #{order.order_number || order.id}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
            >
              {status.icon}
              {status.label}
            </span>
            {order.status === "pending" && (
              <button
                onClick={() => onCancel(order.id)}
                className="text-xs text-red-400 hover:text-red-300 transition font-medium"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>{order.items?.length || 0} items</span>
            <span>•</span>
            <span>{formatDate(order.created_at)}</span>
          </div>

          {/* Item preview with images */}
          {order.items && order.items.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, idx) => {
                  const imgSrc =
                    item.image ||
                    item.product_image ||
                    item.product?.image_url ||
                    item.image_url ||
                    "https://via.placeholder.com/32x32?text=🍽️";
                  return (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full border-2 border-slate-800 overflow-hidden bg-slate-700"
                    >
                      <img
                        src={imgSrc}
                        alt={item.name || "Food"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/32x32?text=🍽️";
                        }}
                      />
                    </div>
                  );
                })}
                {order.items.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-slate-300 truncate max-w-[200px]">
                {order.items.slice(0, 2).map((item, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    {item.name || item.product_name}
                  </span>
                ))}
                {order.items.length > 2 && (
                  <span className="text-slate-500">
                    {" "}
                    +{order.items.length - 2} more
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="mt-2 flex items-center gap-4">
            <p className="text-lg font-bold text-emerald-400">
              ${formatPrice(order.total_amount)}
            </p>
            <p className="text-xs text-slate-500">
              {order.payment_method || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between gap-2">
          <button
            onClick={() => onView(order)}
            className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition"
          >
            <FiEye />
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Order Detail Modal Component
function OrderDetailModal({
  order,
  onClose,
  formatDate,
  formatPrice,
  getStatusConfig,
  onCancel,
}) {
  const status = getStatusConfig(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold">Order Details</h2>
            <p className="text-sm text-slate-400">
              #{order.order_number || order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition"
          >
            <FiXCircle className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl">
            <div className={`p-3 rounded-full ${status.bg}`}>{status.icon}</div>
            <div>
              <p className="text-sm text-slate-400">Current Status</p>
              <p className={`text-lg font-bold ${status.text}`}>
                {status.label}
              </p>
            </div>
            {order.status === "pending" && (
              <button
                onClick={() => {
                  onCancel(order.id);
                  onClose();
                }}
                className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm transition"
              >
                Cancel Order
              </button>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.length > 0 ? (
                order.items.map((item, index) => {
                  const imgSrc =
                    item.image ||
                    item.product_image ||
                    item.product?.image_url ||
                    item.image_url ||
                    "https://via.placeholder.com/64x64?text=🍽️";
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-slate-800 rounded-xl p-3"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
                        <img
                          src={imgSrc}
                          alt={item.name || "Food"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/64x64?text=🍽️";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.name || item.product_name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span className="text-emerald-400">
                            ${formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                      <p className="font-semibold text-emerald-400">
                        ${formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No items found
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-800 rounded-xl p-4">
            <div>
              <p className="text-xs text-slate-400">Order Date</p>
              <p className="text-sm font-medium">
                {formatDate(order.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Payment Method</p>
              <p className="text-sm font-medium capitalize">
                {order.payment_method || "N/A"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400">Delivery Address</p>
              <p className="text-sm font-medium">
                {order.delivery_address || "N/A"}
              </p>
            </div>
            {order.notes && (
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Notes</p>
                <p className="text-sm font-medium">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span>${formatPrice(order.subtotal || order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Delivery Fee</span>
              <span>${formatPrice(order.delivery_fee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tax (5%)</span>
              <span>${formatPrice(order.tax || 0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Discount</span>
                <span>-${formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-emerald-400">
                ${formatPrice(order.total_amount)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition"
            >
              Close
            </button>
            {order.status === "pending" && (
              <button
                onClick={() => {
                  onCancel(order.id);
                  onClose();
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Custom Modal Component
function CustomModal({
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText,
  cancelText,
}) {
  const getIcon = () => {
    switch (type) {
      case "confirm":
        return <FiAlertTriangle className="w-12 h-12 text-amber-400" />;
      case "success":
        return <FiCheckCircle className="w-12 h-12 text-emerald-400" />;
      case "error":
        return <FiXCircle className="w-12 h-12 text-red-400" />;
      default:
        return null;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "confirm":
        return "bg-amber-500 hover:bg-amber-600";
      case "success":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "error":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-emerald-500 hover:bg-emerald-600";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">{getIcon()}</div>

          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

          <p className="text-slate-300 text-sm whitespace-pre-line">
            {message}
          </p>

          <div className="flex gap-3 mt-6">
            {type === "confirm" ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition"
                >
                  {cancelText || "Cancel"}
                </button>
                <button
                  onClick={() => {
                    if (onConfirm) {
                      onConfirm();
                    }
                    onClose();
                  }}
                  className={`flex-1 py-2.5 ${getButtonColor()} rounded-xl font-medium transition text-white`}
                >
                  {confirmText || "Confirm"}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`w-full py-2.5 ${getButtonColor()} rounded-xl font-medium transition text-white`}
              >
                {confirmText || "OK"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
