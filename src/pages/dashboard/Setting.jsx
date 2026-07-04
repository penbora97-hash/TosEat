// Setting.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaUser,
  FaLock,
  FaBell,
  FaPalette,
  FaSave,
  FaCamera,
  FaTrash,
  FaUserCircle,
  FaIdCard,
  FaFileInvoice,
} from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdEmail, MdPhone } from "react-icons/md";
import { useUser } from "./UserContext";

export default function Setting() {
  const fileInputRef = useRef(null);
  const { user, updateUser, updateAvatar } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    newPassword_confirmation: "",
    notifications: true,
    emailUpdates: true,
    darkMode: true,
    language: "Khmer",
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        currentPassword: "",
        newPassword: "",
        newPassword_confirmation: "",
        notifications: user.notifications ?? true,
        emailUpdates: user.emailUpdates ?? true,
        darkMode: user.darkMode ?? true,
        language: user.language || "Khmer",
      });
    }
  }, [user]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getToken = () => localStorage.getItem("token");

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = getToken();
    if (!token) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/profile/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        const avatarUrl = response.data.data.avatar_url;
        updateAvatar(avatarUrl);
        alert("Avatar updated successfully!");
        
        // Update user data in localStorage
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.avatar_url = avatarUrl;
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to update avatar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = () => {
    updateAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    // Validate password
    if (form.newPassword && form.newPassword !== form.newPassword_confirmation) {
      alert("New passwords do not match!");
      return;
    }

    setSaving(true);

    try {
      // Update profile
      const profileResponse = await axios.put(
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
        }
      );

      if (profileResponse.data.status === "success") {
        const updatedUser = profileResponse.data.data;
        
        // Update user context
        updateUser(updatedUser);
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const newUserData = {
          ...userData,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          bio: updatedUser.bio,
        };
        localStorage.setItem("user", JSON.stringify(newUserData));
        
        // Update userProfile
        const profileData = JSON.parse(localStorage.getItem("userProfile") || "{}");
        const newProfileData = {
          ...profileData,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          bio: updatedUser.bio,
        };
        localStorage.setItem("userProfile", JSON.stringify(newProfileData));
      }

      // Change password if provided
      if (form.newPassword) {
        const passwordResponse = await axios.post(
          "http://localhost:8000/api/change-password",
          {
            current_password: form.currentPassword,
            new_password: form.newPassword,
            new_password_confirmation: form.newPassword_confirmation,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (passwordResponse.data.status === "success") {
          alert("Password changed successfully!");
          // Clear password fields
          setForm((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            newPassword_confirmation: "",
          }));
        }
      } else {
        alert("Profile updated successfully!");
      }

      // Dispatch event to update navbar
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("loginStatusChanged"));

    } catch (error) {
      console.error("Error saving settings:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join("\n");
        alert(`Validation errors:\n${errorMessages}`);
      } else if (error.response?.status === 401) {
        alert("Current password is incorrect!");
      } else {
        alert("Failed to save settings. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">កំណត់គណនី និងប្រតិបត្តិ</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Section with Avatar */}
          <div>
            <SectionTitle icon={<FaUser />} title="Profile Settings" />

            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6 bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500/30 bg-slate-800">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8000/storage/${user.avatar_url}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=10B981&color=fff&size=150`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      {user?.full_name ? (
                        <span className="text-4xl font-bold text-emerald-400">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <FaUserCircle className="text-6xl text-slate-500" />
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaCamera className="text-sm" />
                  {loading ? "Uploading..." : "Upload New"}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <FaTrash className="text-sm" />
                  Delete avatar
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={form.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                placeholder="Full name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                disabled
                icon={<MdEmail className="text-slate-500" />}
              />
              <Input
                label="Phone Number"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+855 12 345 678"
                icon={<MdPhone className="text-slate-500" />}
              />
              <Input
                label="Address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address"
                icon={<HiOutlineLocationMarker className="text-slate-500" />}
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 placeholder:text-slate-500 min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <SectionTitle icon={<FaLock />} title="Change Password" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Current Password"
                type="password"
                value={form.currentPassword}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={form.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={form.newPassword_confirmation}
                onChange={(e) => handleChange("newPassword_confirmation", e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Leave password fields empty if you don't want to change password.
            </p>
          </div>

          {/* Notifications */}
          <div>
            <SectionTitle icon={<FaBell />} title="Notifications" />
            <div className="space-y-4">
              <ToggleRow
                title="Enable notifications"
                desc="Receive alerts for new orders and updates."
                checked={form.notifications}
                onChange={(v) => handleChange("notifications", v)}
              />
              <ToggleRow
                title="Email updates"
                desc="Get email summaries about activity."
                checked={form.emailUpdates}
                onChange={(v) => handleChange("emailUpdates", v)}
              />
            </div>
          </div>

          {/* Appearance */}
          <div>
            <SectionTitle icon={<FaPalette />} title="Appearance" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleRow
                title="Dark mode"
                desc="Use dark dashboard theme."
                checked={form.darkMode}
                onChange={(v) => handleChange("darkMode", v)}
              />
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Theme Accent</p>
                  <p className="text-sm text-slate-400">Current: Emerald</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <FaSave />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function Input({ label, icon, disabled, ...props }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        )}
        <input
          {...props}
          disabled={disabled}
          className={`w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 placeholder:text-slate-500 transition-all ${
            icon ? "pl-10" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </div>
    </div>
  );
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full transition flex items-center px-1 flex-shrink-0 ${
          checked ? "bg-emerald-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}