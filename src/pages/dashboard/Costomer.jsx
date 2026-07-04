import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaSearch,
  FaUserFriends,
  FaStar,
  FaShoppingBag,
  FaEye,
  FaSync, // ← ប្តូរពី FaRefresh មក FaSync
} from "react-icons/fa";

export default function Costomer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("All");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = getToken();

    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/users", // ← ឥឡូវមានហើយ
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("Users API Response:", response.data);

      if (response.data.status === "success") {
        const usersData = response.data.data?.data || response.data.data || [];
        setCustomers(Array.isArray(usersData) ? usersData : []);
      } else {
        setError(response.data.message || "Failed to fetch users");
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to access this page.");
        } else {
          setError(
            error.response.data?.message ||
              "Failed to load users. Please try again.",
          );
        }
      } else if (error.request) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = customers;

    if (q) {
      filtered = filtered.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q),
      );
    }

    if (segment !== "All") {
      filtered = filtered.filter((c) => c.role === segment);
    }

    return filtered;
  }, [customers, search, segment]);

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.is_active).length,
    inactive: customers.filter((c) => !c.is_active).length,
    admins: customers.filter((c) => c.role === "admin").length,
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center">
        <div className="text-red-400 text-xl mb-3">⚠️ {error}</div>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition flex items-center gap-2 mx-auto"
        >
          <FaSync className="text-sm" /> {/* ← ប្តូរមក FaSync */}
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-slate-400">
            គ្រប់គ្រងព័ត៌មានអតិថិជន និងទំនាក់ទំនង
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition flex items-center gap-2"
        >
          <FaSync className="text-sm" /> {/* ← ប្តូរមក FaSync */}
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.total}
          color="emerald"
          icon={<FaUserFriends size={22} />}
        />
        <StatCard
          title="Active"
          value={stats.active}
          color="green"
          icon={<FaStar size={20} />}
        />
        <StatCard
          title="Inactive"
          value={stats.inactive}
          color="red"
          icon={<FaShoppingBag size={20} />}
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          color="purple"
          icon={<FaEye size={20} />}
        />
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500"
            >
              <option value="All">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-400">
            Showing {filteredCustomers.length} of {customers.length} users
          </p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-sm border-b border-slate-800">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Contact</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="text-slate-300 hover:bg-slate-900/50 transition"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-semibold border border-emerald-500/20">
                        {customer.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {customer.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID: {customer.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-sm">{customer.email || "N/A"}</p>
                    <p className="text-xs text-slate-500">
                      {customer.phone || "No phone"}
                    </p>
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.role === "admin"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {customer.role || "user"}
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.is_active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {customer.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400">
                    {customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-500">
                  {search || segment !== "All"
                    ? "No users match your search criteria."
                    : "No users found in the system."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    green: "bg-green-500/10 text-green-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
  };
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${colors[color]}`}>{icon}</div>
    </div>
  );
}
