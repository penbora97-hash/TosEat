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
} from "react-icons/fa";

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
  const fileInputRef = useRef(null);

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: "", // 'success', 'error', 'info'
    title: "",
    message: "",
  });

  const getToken = () => localStorage.getItem("token");

  // Modal helpers
  const showModal = (type, title, message) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
    });
  };

  // Helper: Fix avatar URL
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

  // Get Avatar URL
  const getAvatarUrl = () => {
    const avatar = editing ? form.avatar_url : profile.avatar_url;

    if (!avatar) {
      const name = editing ? form.full_name : profile.full_name;
      if (name) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff&size=150`;
      }
      return null;
    }

    return fixAvatarUrl(avatar);
  };

  // Handle Avatar Upload
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex items-center justify-center">
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

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
            <p className="text-slate-400 mt-1">
              ព័ត៌មានគណនី និងការកំណត់ផ្ទាល់ខ្លួន
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="xl:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col">
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`relative group w-32 h-32 rounded-full border-4 ${
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
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=10B981&color=fff&size=150`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 text-5xl font-bold">
                    {(editing ? form.full_name : profile.full_name) ? (
                      (editing ? form.full_name : profile.full_name)
                        .charAt(0)
                        .toUpperCase()
                    ) : (
                      <FaUser />
                    )}
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
                      CHANGE PHOTO
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  {profile.full_name || "User"}
                </h2>
                <p className="text-emerald-400 text-sm mt-1 capitalize">
                  {profile.role}
                </p>
                <p
                  className={`text-xs mt-1 ${profile.is_active ? "text-green-400" : "text-red-400"}`}
                >
                  {profile.is_active ? "✅ Active" : "❌ Inactive"}
                </p>
                {profile.bio && (
                  <p className="text-slate-400 text-sm italic mt-3 px-4">
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  ORDERS
                </p>
                <p className="text-white font-bold text-base mt-1">0</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  SPENT
                </p>
                <p className="text-white font-bold text-base mt-1">$0.00</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-8 space-y-4">
            {/* User Information */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "info" ? "" : "info")
                }
                className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-slate-900/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/5">
                    <FaEnvelope className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">User Information</h3>
                    <p className="text-xs text-slate-500">
                      Click to view details
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
                <div className="px-5 md:px-6 pb-6 pt-4 border-t border-slate-900/60">
                  {!editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Full Name
                        </label>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 min-h-[46px] flex items-center">
                          {profile.full_name || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Email
                        </label>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 min-h-[46px] flex items-center">
                          {profile.email || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Phone
                        </label>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 min-h-[46px] flex items-center">
                          {profile.phone || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Address
                        </label>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 min-h-[46px] flex items-center">
                          {profile.address || "N/A"}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Bio
                        </label>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 min-h-[46px] flex items-center">
                          {profile.bio || "No bio added yet."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Full Name
                        </label>
                        <input
                          value={form.full_name || ""}
                          onChange={(e) =>
                            setForm({ ...form, full_name: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Email
                        </label>
                        <input
                          value={form.email || ""}
                          disabled
                          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm opacity-50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Phone
                        </label>
                        <input
                          value={form.phone || ""}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Address
                        </label>
                        <input
                          value={form.address || ""}
                          onChange={(e) =>
                            setForm({ ...form, address: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                          Bio
                        </label>
                        <textarea
                          value={form.bio || ""}
                          onChange={(e) =>
                            setForm({ ...form, bio: e.target.value })
                          }
                          className="w-full min-h-24 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-3 pt-4">
                        <button
                          onClick={saveProfile}
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-medium transition"
                        >
                          <FaSave /> {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "orders" ? "" : "orders")
                }
                className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-slate-900/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/5">
                    <FaHistory className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Order History</h3>
                    <p className="text-xs text-slate-500">
                      Click to view your orders
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
                <div className="px-5 md:px-6 pb-6 pt-4 border-t border-slate-900/60">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🛒</div>
                    <p className="text-slate-400">No orders yet</p>
                    <p className="text-slate-500 text-sm">
                      Start ordering some delicious food!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "logout" ? "" : "logout")
                }
                className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-slate-900/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/5">
                    <FaSignOutAlt className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Logout</h3>
                    <p className="text-xs text-slate-500">
                      Click to view details
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
                <div className="px-5 md:px-6 pb-6 pt-4 border-t border-slate-900/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                    <p className="text-slate-300">ចង់ចាកចេញពីគណនីនេះទេ?</p>
                    <button
                      onClick={logout}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition"
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
