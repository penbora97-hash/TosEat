import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaSearch, FaEye, FaCheck, FaMotorcycle, FaTimes } from "react-icons/fa";
import { FiPhone, FiMapPin, FiClock } from "react-icons/fi";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setOrders(response.data.data.data || response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8000/api/admin/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status.');
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(order => {
      const matchSearch = 
        order.order_number?.toLowerCase().includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_phone?.toLowerCase().includes(q) ||
        order.delivery_address?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" ? true : order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
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
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-slate-400">គ្រប់គ្រងការកុម្ម៉ង់ និង delivery</p>
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
              placeholder="Search by name, phone, address, order..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500"
          >
            <option>All</option>
            <option>pending</option>
            <option>confirmed</option>
            <option>cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold text-white">{order.customer_name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">${order.total_amount?.toFixed(2)}</p>
                <p className="text-xs text-slate-500">{order.payment_method}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <FiPhone className="text-emerald-400" />
                <span>{order.customer_phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="text-emerald-400" />
                <span>{order.delivery_address}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiClock className="text-emerald-400" />
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                <FaEye /> View
              </button>
              {order.status === 'pending' && (
                <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                  <FaCheck /> Confirm
                </button>
              )}
              {order.status === 'pending' && (
                <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="xl:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-10 text-center text-slate-500">
            No orders found.
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
    case 'pending': return "bg-amber-500/10 text-amber-400";
    case 'confirmed': return "bg-emerald-500/10 text-emerald-400";
    case 'cancelled': return "bg-red-500/10 text-red-400";
    default: return "bg-slate-500/10 text-slate-400";
  }
}