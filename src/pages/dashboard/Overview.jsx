import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

const Overview = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    confirmed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
    total_users: 0,
    total_products: 0,
    total_categories: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Helper function to format price (improved)
  const formatPrice = (value) => {
    // Handle null, undefined, empty string
    if (value === null || value === undefined || value === "") {
      return "0.00";
    }
    // Convert to number
    const num = typeof value === "number" ? value : parseFloat(value);
    // Check if valid number
    if (isNaN(num)) {
      return "0.00";
    }
    return num.toFixed(2);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:8000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8000/api/admin/orders?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("Stats API Response:", statsRes.data); // ✅ Debug: Check what API returns

      if (statsRes.data.status === "success") {
        const statsData = statsRes.data.data;

        // ✅ Ensure total_revenue is a number
        setStats({
          ...statsData,
          total_revenue: parseFloat(statsData.total_revenue) || 0,
          total_orders: parseInt(statsData.total_orders) || 0,
          pending_orders: parseInt(statsData.pending_orders) || 0,
          confirmed_orders: parseInt(statsData.confirmed_orders) || 0,
          cancelled_orders: parseInt(statsData.cancelled_orders) || 0,
          total_users: parseInt(statsData.total_users) || 0,
          total_products: parseInt(statsData.total_products) || 0,
          total_categories: parseInt(statsData.total_categories) || 0,
        });
      }

      if (ordersRes.data.status === "success") {
        setRecentOrders(ordersRes.data.data.data || ordersRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ Calculate total revenue from orders if API doesn't provide it
  const calculatedRevenue = recentOrders.reduce((sum, order) => {
    const amount = parseFloat(order.total_amount) || 0;
    // Only count confirmed orders for revenue
    if (order.status === "confirmed") {
      return sum + amount;
    }
    return sum;
  }, 0);

  // Use API revenue if available, otherwise use calculated
  const displayRevenue =
    stats.total_revenue > 0 ? stats.total_revenue : calculatedRevenue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.full_name || user?.name || "Admin"}! 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here's what's happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.total_orders || 0}
          color="emerald"
        />
        <StatCard
          title="Pending"
          value={stats.pending_orders || 0}
          color="amber"
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed_orders || 0}
          color="blue"
        />
        <StatCard
          title="Revenue"
          value={`$${formatPrice(displayRevenue)}`}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={stats.total_users || 0}
          color="purple"
        />
        <StatCard
          title="Products"
          value={stats.total_products || 0}
          color="green"
        />
        <StatCard
          title="Categories"
          value={stats.total_categories || 0}
          color="pink"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-slate-400 text-sm">No recent orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-sm border-b border-slate-700">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-700/50">
                    <td className="py-3 text-emerald-400">
                      {order.order_number}
                    </td>
                    <td className="py-3">{order.customer_name}</td>
                    <td className="py-3 font-semibold text-white">
                      ${formatPrice(order.total_amount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : order.status === "confirmed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ title, value, color }) {
  const colors = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
    pink: "text-pink-400",
  };
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}

export default Overview;
