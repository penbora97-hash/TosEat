import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserEdit,
  FaSignOutAlt,
  FaEnvelope,
  FaUser,
  FaCamera,
  FaSave,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaHistory,
  FaCheck,
  FaTimesCircle,
  FaClock,
  FaShoppingBag,
  FaArrowRight,
} from "react-icons/fa";
import { FiPackage, FiTruck } from "react-icons/fi";

const defaultProfile = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  role: "user",
  bio: "",
  avatar_url: "",
  is_active: true,
};

export default function Profile() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState("info");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(defaultProfile);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
  });

  const getToken = () => localStorage.getItem("token");

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: "", title: "", message: "" });
  };

  const fixAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) {
      if (url.includes("localhost:8080")) {
        return url.replace("localhost:8080", "localhost:8000");
      }
      return url;
    }
    if (url.startsWith("/storage/")) {
      return `http://localhost:8000${url}`;
    }
    if (url.startsWith("storage/")) {
      return `http://localhost:8000/${url}`;
    }
    if (url.startsWith("avatars/")) {
      return `http://localhost:8000/storage/${url}`;
    }
    return `http://localhost:8000/storage/${url}`;
  };

  // Load profile from localStorage
  useEffect(() => {
    const loadLocalData = () => {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        try {
          const data = JSON.parse(savedProfile);
          setProfile(data);
          setForm(data);
          return true;
        } catch (e) {}
      }

      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const data = {
            full_name: user.full_name || user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            role: user.role || "user",
            bio: user.bio || "",
            avatar_url: user.avatar_url || "",
            is_active: user.is_active !== undefined ? user.is_active : true,
          };
          setProfile(data);
          setForm(data);
          return true;
        } catch (e) {}
      }
      return false;
    };

    loadLocalData();
  }, []);

  // Fetch profile from API
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "success") {
          const user = response.data.data;
          const profileData = {
            full_name: user.full_name || user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            role: user.role || "user",
            bio: user.bio || "",
            avatar_url: user.avatar_url || "",
            is_active: user.is_active !== undefined ? user.is_active : true,
          };

          setProfile(profileData);
          setForm(profileData);
          localStorage.setItem("userProfile", JSON.stringify(profileData));
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ✅ Fetch Order History
  const fetchOrders = async () => {
    const token = getToken();
    if (!token) return;

    setOrdersLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        const ordersData = response.data.data.data || response.data.data || [];
        setOrders(ordersData);
        calculateStats(ordersData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Fallback to admin orders if user orders not available
      try {
        const response2 = await axios.get(
          "http://localhost:8000/api/admin/orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response2.data.status === "success") {
          const allOrders =
            response2.data.data.data || response2.data.data || [];
          const userData = JSON.parse(localStorage.getItem("user") || "{}");
          const userName =
            userData.full_name || userData.name || profile.full_name;

          const userOrders = allOrders.filter(
            (order) =>
              order.customer_name === userName || order.user_id === userData.id,
          );
          setOrders(userOrders);
          calculateStats(userOrders);
        }
      } catch (err2) {
        console.error("Error with fallback:", err2);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    setStats({
      total: ordersData.length,
      pending: ordersData.filter((o) => o.status === "pending").length,
      confirmed: ordersData.filter((o) => o.status === "confirmed").length,
      delivered: ordersData.filter((o) => o.status === "delivered").length,
      cancelled: ordersData.filter((o) => o.status === "cancelled").length,
    });
  };

  // Fetch orders when section opens
  useEffect(() => {
    if (openSection === "orders") {
      fetchOrders();
    }
  }, [openSection]);

  const getAvatarUrl = () => {
    const avatar = editing ? form.avatar_url : profile.avatar_url;
    if (!avatar) {
      const name = editing ? form.full_name : profile.full_name;
      if (name) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name,
        )}&background=10B981&color=fff&size=150`;
      }
      return null;
    }
    return fixAvatarUrl(avatar);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getToken();
    if (!token) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/profile/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.status === "success") {
        let avatarUrl =
          response.data.data.avatar_url ||
          response.data.data.avatar ||
          response.data.data.url ||
          response.data.data.path;

        let storagePath = avatarUrl;
        if (storagePath) {
          storagePath = storagePath.replace(
            /^https?:\/\/[^\/]+\/storage\//,
            "",
          );
          storagePath = storagePath.replace(/^\/storage\//, "");
          storagePath = storagePath.replace(/^storage\//, "");
        }

        const updatedProfile = { ...profile, avatar_url: storagePath };
        const updatedForm = { ...form, avatar_url: storagePath };

        setProfile(updatedProfile);
        setForm(updatedForm);
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          user.avatar_url = storagePath;
          localStorage.setItem("user", JSON.stringify(user));
        }

        showModal("success", "Success", "Avatar updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showModal("error", "Error", "Failed to update avatar. Please try again.");
    }
  };

  const saveProfile = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      const response = await axios.put(
        "http://localhost:8000/api/profile",
        {
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          bio: form.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === "success") {
        const updatedUser = response.data.data;
        const profileData = {
          full_name:
            updatedUser.full_name || updatedUser.name || form.full_name,
          email: updatedUser.email || form.email,
          phone: updatedUser.phone || form.phone,
          address: updatedUser.address || form.address,
          role: updatedUser.role || form.role || "user",
          bio: updatedUser.bio || form.bio,
          avatar_url: form.avatar_url || updatedUser.avatar_url || "",
          is_active:
            updatedUser.is_active !== undefined
              ? updatedUser.is_active
              : form.is_active,
        };

        setProfile(profileData);
        localStorage.setItem("userProfile", JSON.stringify(profileData));

        const userData = {
          ...updatedUser,
          avatar_url: form.avatar_url || updatedUser.avatar_url,
        };
        localStorage.setItem("user", JSON.stringify(userData));

        showModal("success", "Success", "Profile updated successfully!");
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showModal(
        "error",
        "Error",
        "Failed to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = () => {
    setForm({ ...profile });
    setEditing(true);
    setOpenSection("info");
  };

  const cancelEdit = () => {
    setForm({ ...profile });
    setEditing(false);
  };

  const triggerFileSelect = () => {
    if (editing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/");
  };

  // ✅ Get Status Badge - Improved
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        icon: <FaClock className="text-amber-400" />,
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Pending",
        dot: "bg-amber-400",
      },
      confirmed: {
        icon: <FaCheck className="text-blue-400" />,
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Confirmed",
        dot: "bg-blue-400",
      },
      preparing: {
        icon: <FiPackage className="text-purple-400" />,
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "Preparing",
        dot: "bg-purple-400",
      },
      out_for_delivery: {
        icon: <FiTruck className="text-orange-400" />,
        className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        label: "Out for Delivery",
        dot: "bg-orange-400",
      },
      delivered: {
        icon: <FaCheck className="text-emerald-400" />,
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        label: "Delivered",
        dot: "bg-emerald-400",
      },
      cancelled: {
        icon: <FaTimesCircle className="text-red-400" />,
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Cancelled",
        dot: "bg-red-400",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00";
    }
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? "0.00" : numAmount.toFixed(2);
  };

  // Calculate totals
  const totalOrders = orders.length;
  const totalSpent = orders
    .filter((o) => o.status === "delivered" || o.status === "confirmed")
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3
                className={`text-xl font-bold ${
                  modal.type === "success"
                    ? "text-emerald-400"
                    : modal.type === "error"
                      ? "text-red-400"
                      : "text-blue-400"
                }`}
              >
                {modal.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <p className="text-slate-300 whitespace-pre-line">
                {modal.message}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  modal.type === "success"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : modal.type === "error"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-end mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
            <p className="text-slate-400 mt-1">
              Manage your account and orders
            </p>
          </div>
          {!editing && (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition shadow-lg shadow-emerald-500/20"
            >
              <FaUserEdit /> Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`relative group w-28 h-28 rounded-full border-4 ${
                  editing
                    ? "border-emerald-500 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20"
                    : "border-slate-700"
                } overflow-hidden bg-slate-900 flex items-center justify-center transition-all`}
                onClick={triggerFileSelect}
              >
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      const name = editing ? form.full_name : profile.full_name;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        name || "User",
                      )}&background=10B981&color=fff&size=150`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 text-5xl font-bold">
                    {(editing ? form.full_name : profile.full_name)
                      ?.charAt(0)
                      .toUpperCase() || <FaUser />}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                {editing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <FaCamera className="text-white text-2xl mb-1" />
                    <span className="text-xs uppercase tracking-widest text-white">
                      Change Photo
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-semibold">
                  {profile.full_name || "User"}
                </h2>
                <p className="text-emerald-400 text-sm capitalize">
                  {profile.role}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    profile.is_active ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {profile.is_active ? "● Active" : "● Inactive"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Orders
                </p>
                <p className="text-white font-bold text-lg">{totalOrders}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Spent
                </p>
                <p className="text-white font-bold text-lg">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => navigate("/orders")}
                className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-800 rounded-xl transition"
              >
                <span className="flex items-center gap-2 text-sm">
                  <FaShoppingBag className="text-emerald-400" />
                  View All Orders
                </span>
                <FaArrowRight className="text-slate-500 text-xs" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-4">
            {/* User Information */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "info" ? "" : "info")
                }
                className="w-full flex items-center justify-between gap-4 p-5 hover:bg-slate-900/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <FaEnvelope className="text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">User Information</h3>
                    <p className="text-xs text-slate-500">
                      View and edit your profile
                    </p>
                  </div>
                </div>
                {openSection === "info" ? (
                  <FaChevronUp size={14} />
                ) : (
                  <FaChevronDown size={14} />
                )}
              </button>

              {openSection === "info" && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-800/60">
                  {!editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField
                        label="Full Name"
                        value={profile.full_name || "N/A"}
                      />
                      <InfoField label="Email" value={profile.email || "N/A"} />
                      <InfoField label="Phone" value={profile.phone || "N/A"} />
                      <InfoField
                        label="Address"
                        value={profile.address || "N/A"}
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Bio
                        </label>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm">
                          {profile.bio || "No bio added yet."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EditField
                        label="Full Name"
                        name="full_name"
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                      />
                      <EditField
                        label="Email"
                        name="email"
                        value={form.email}
                        disabled
                      />
                      <EditField
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                      <EditField
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Bio
                        </label>
                        <textarea
                          value={form.bio || ""}
                          onChange={(e) =>
                            setForm({ ...form, bio: e.target.value })
                          }
                          className="w-full min-h-24 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 resize-none text-sm"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-3 pt-2">
                        <button
                          onClick={saveProfile}
                          disabled={saving}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium transition flex items-center justify-center gap-2"
                        >
                          <FaSave /> {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ✅ Order History - Improved */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "orders" ? "" : "orders")
                }
                className="w-full flex items-center justify-between gap-4 p-5 hover:bg-slate-900/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10">
                    <FaHistory className="text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Order History</h3>
                    <p className="text-xs text-slate-500">
                      {totalOrders} orders • {stats.pending} pending
                    </p>
                  </div>
                </div>
                {openSection === "orders" ? (
                  <FaChevronUp size={14} />
                ) : (
                  <FaChevronDown size={14} />
                )}
              </button>

              {openSection === "orders" && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-800/60">
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {orders.map((order) => {
                        const status = getStatusBadge(order.status);
                        return (
                          <div
                            key={order.id}
                            className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition cursor-pointer"
                            onClick={() =>
                              navigate(`/orders?order=${order.id}`)
                            }
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <p className="font-mono text-sm text-white">
                                    #{order.order_number || order.id}
                                  </p>
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}
                                  >
                                    {status.icon}
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {formatDate(order.created_at)}
                                </p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                  {order.items?.length || 0} items
                                  {order.items && order.items.length > 0 && (
                                    <span>
                                      :{" "}
                                      {order.items
                                        .slice(0, 2)
                                        .map((i) => i.name || i.product_name)
                                        .join(", ")}
                                      {order.items.length > 2 && (
                                        <span className="text-slate-500">
                                          {" "}
                                          +{order.items.length - 2} more
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-emerald-400">
                                  ${formatAmount(order.total_amount)}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">
                                  {order.payment_method || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-3">🛒</div>
                      <p className="text-slate-400 font-medium">
                        No orders yet
                      </p>
                      <p className="text-slate-500 text-sm">
                        Start ordering some delicious food!
                      </p>
                      <button
                        onClick={() => navigate("/menu")}
                        className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-medium transition"
                      >
                        Browse Menu
                      </button>
                    </div>
                  )}

                  {orders.length > 0 && (
                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full mt-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <FaShoppingBag />
                      View All Orders
                      <FaArrowRight className="text-xs" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "logout" ? "" : "logout")
                }
                className="w-full flex items-center justify-between gap-4 p-5 hover:bg-slate-900/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-red-500/10">
                    <FaSignOutAlt className="text-red-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Logout</h3>
                    <p className="text-xs text-slate-500">
                      Sign out of your account
                    </p>
                  </div>
                </div>
                {openSection === "logout" ? (
                  <FaChevronUp size={14} />
                ) : (
                  <FaChevronDown size={14} />
                )}
              </button>

              {openSection === "logout" && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                    <p className="text-slate-300 text-sm">
                      Are you sure you want to logout?
                    </p>
                    <button
                      onClick={logout}
                      className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Helper Components =====

function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5 font-medium">
        {label}
      </label>
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm min-h-[46px] flex items-center">
        {value}
      </div>
    </div>
  );
}

function EditField({ label, name, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5 font-medium">
        {label}
      </label>
      <input
        type={name === "email" ? "email" : "text"}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
