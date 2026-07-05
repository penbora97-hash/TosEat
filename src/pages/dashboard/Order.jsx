import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaMotorcycle,
  FaTimes,
  FaEdit,
  FaSave,
  FaTimesCircle,
  FaUser,
  FaUserShield,
  FaInfoCircle,
} from "react-icons/fa";
import { FiPhone, FiMapPin, FiClock, FiFileText } from "react-icons/fi";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewOrderId, setViewOrderId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.status === "success") {
        const ordersData = response.data.data.data || response.data.data || [];
        console.log("Orders Data:", ordersData);
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8000/api/admin/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
    } catch (error) {
      alert("Failed to update order status.");
    }
  };

  const handleViewOrder = (order) => {
    setViewOrderId(order.id);
    setShowDetailModal(true);
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchSearch =
        order.order_number?.toLowerCase().includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_phone?.toLowerCase().includes(q) ||
        order.delivery_address?.toLowerCase().includes(q) ||
        order.notes?.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All" ? true : order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00";
    }
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? "0.00" : numAmount.toFixed(2);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-amber-400" />;
      case "confirmed":
        return <FaCheck className="text-emerald-400" />;
      case "cancelled":
        return <FaTimes className="text-red-400" />;
      default:
        return null;
    }
  };

  // ✅ Check if order was cancelled by user or admin
  const getCancelledByInfo = (order) => {
    // If order has cancelled_by field
    if (order.cancelled_by) {
      if (order.cancelled_by === "user") {
        return {
          label: "Cancelled by Customer",
          icon: <FaUser className="text-amber-400" />,
          className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          message: "This order was cancelled by the customer",
        };
      } else if (order.cancelled_by === "admin") {
        return {
          label: "Cancelled by Admin",
          icon: <FaUserShield className="text-red-400" />,
          className: "bg-red-500/10 text-red-400 border-red-500/20",
          message: "This order was cancelled by an administrator",
        };
      }
    }

    // Fallback: Check if there's a cancellation note
    if (order.notes && order.notes.toLowerCase().includes("cancelled by")) {
      if (order.notes.toLowerCase().includes("customer")) {
        return {
          label: "Cancelled by Customer",
          icon: <FaUser className="text-amber-400" />,
          className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          message: "This order was cancelled by the customer",
        };
      } else if (order.notes.toLowerCase().includes("admin")) {
        return {
          label: "Cancelled by Admin",
          icon: <FaUserShield className="text-red-400" />,
          className: "bg-red-500/10 text-red-400 border-red-500/20",
          message: "This order was cancelled by an administrator",
        };
      }
    }

    // Default: Unknown
    return {
      label: "Cancelled",
      icon: <FaTimes className="text-red-400" />,
      className: "bg-red-500/10 text-red-400 border-red-500/20",
      message: "This order has been cancelled",
    };
  };

  // ✅ Show cancellation reason badge
  const getCancelledBadge = (order) => {
    if (order.status !== "cancelled") return null;

    const info = getCancelledByInfo(order);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${info.className}`}
      >
        {info.icon}
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Detail Modal */}
      {showDetailModal && viewOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Order Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <FaTimes size={20} />
              </button>
            </div>
            {orders
              .filter((o) => o.id === viewOrderId)
              .map((order) => {
                const cancelInfo =
                  order.status === "cancelled"
                    ? getCancelledByInfo(order)
                    : null;
                return (
                  <div key={order.id} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Order Number</p>
                        <p className="text-white font-medium">
                          {order.order_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusClass(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                          {/* ✅ Show who cancelled if status is cancelled */}
                          {order.status === "cancelled" && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${cancelInfo.className}`}
                            >
                              {cancelInfo.icon}
                              {cancelInfo.label}
                            </span>
                          )}
                        </div>
                        {order.status === "cancelled" && cancelInfo && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <FaInfoCircle className="text-slate-500" />
                            {cancelInfo.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Customer Name</p>
                        <p className="text-white font-medium">
                          {order.customer_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Phone</p>
                        <p className="text-white font-medium">
                          {order.customer_phone}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-slate-400">
                          Delivery Address
                        </p>
                        <p className="text-white font-medium">
                          {order.delivery_address}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Amount</p>
                        <p className="text-white font-bold text-xl">
                          ${formatAmount(order.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Payment Method</p>
                        <p className="text-white font-medium">
                          {order.payment_method || "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-slate-400">Order Date</p>
                        <p className="text-white font-medium">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      {/* Notes */}
                      <div className="col-span-2">
                        <p className="text-sm text-slate-400">Notes</p>
                        <div className="bg-slate-800 rounded-xl p-3 mt-1">
                          <p className="text-white whitespace-pre-wrap">
                            {order.notes || "No notes added"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-700">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, "confirmed");
                              setShowDetailModal(false);
                            }}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                          >
                            <FaCheck /> Confirm
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to cancel this order?",
                                )
                              ) {
                                updateOrderStatus(order.id, "cancelled");
                                setShowDetailModal(false);
                              }
                            }}
                            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to cancel this confirmed order?",
                              )
                            ) {
                              updateOrderStatus(order.id, "cancelled");
                              setShowDetailModal(false);
                            }
                          }}
                          className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                        >
                          <FaTimes /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-slate-400">
          គ្រប់គ្រងការកុម្ម៉ង់ និង delivery
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={stats.total} color="emerald" />
        <StatCard title="Pending" value={stats.pending} color="amber" />
        <StatCard title="Confirmed" value={stats.confirmed} color="blue" />
        <StatCard title="Cancelled" value={stats.cancelled} color="red" />
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, address, order, notes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredOrders.map((order) => {
          const cancelInfo =
            order.status === "cancelled" ? getCancelledByInfo(order) : null;
          return (
            <div
              key={order.id}
              className={`bg-slate-950 border rounded-3xl p-5 hover:border-slate-700 transition ${
                order.status === "cancelled"
                  ? "border-red-800/30 hover:border-red-700/50"
                  : "border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-white">
                      {order.customer_name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusClass(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    {/* ✅ Show who cancelled if status is cancelled */}
                    {order.status === "cancelled" && cancelInfo && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${cancelInfo.className}`}
                      >
                        {cancelInfo.icon}
                        {cancelInfo.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {order.order_number}
                  </p>
                  {/* ✅ Show cancellation reason tooltip */}
                  {order.status === "cancelled" && cancelInfo && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <FaInfoCircle className="text-slate-500 text-[10px]" />
                      {cancelInfo.message}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl">
                    ${formatAmount(order.total_amount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.payment_method || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <FiPhone className="text-emerald-400" />
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-emerald-400" />
                  <span className="truncate">{order.delivery_address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiClock className="text-emerald-400" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-start gap-2">
                  <FiFileText className="text-slate-500 text-sm mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Notes:</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                      {order.notes || "No notes added"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                >
                  <FaEye /> View Details
                </button>
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, "confirmed")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                    >
                      <FaCheck /> Confirm
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to cancel this order?",
                          )
                        ) {
                          updateOrderStatus(order.id, "cancelled");
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                )}
                {order.status === "confirmed" && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to cancel this confirmed order?",
                        )
                      ) {
                        updateOrderStatus(order.id, "cancelled");
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="xl:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-10 text-center text-slate-500">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-lg">No orders found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
  };
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className={`text-2xl font-bold mt-2 ${colors[color]}`}>{value}</h3>
    </div>
  );
}

function statusClass(status) {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-400";
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-400";
    case "cancelled":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-slate-500/10 text-slate-400";
  }
}
