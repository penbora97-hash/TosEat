import React, { useState } from "react";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiX,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import axios from "axios";

const Register = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post("http://localhost:8000/api/register", {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      console.log("Register Response:", response.data);

      if (response.data.status === "success") {
        const { user, token } = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const profileData = {
          full_name: user.full_name || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "user",
          bio: user.bio || "",
          avatar_url: user.avatar_url || "",
          is_active: user.is_active,
        };
        localStorage.setItem("userProfile", JSON.stringify(profileData));

        // ✅ Dispatch event to notify Navbar
        window.dispatchEvent(new Event("loginStatusChanged"));
        window.dispatchEvent(new Event("authChange"));

        alert("✅ Registration successful! Welcome to TosEat 🎉");
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Register Error:", error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          const fieldErrors = {};
          Object.keys(data.errors).forEach((key) => {
            fieldErrors[key] = data.errors[key][0];
          });
          setErrors(fieldErrors);
        } else {
          setErrors({
            general: data.message || "Registration failed. Please try again.",
          });
        }
      } else if (error.request) {
        setErrors({
          general: "Cannot connect to server. Please check your connection.",
        });
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl relative animate-fade-slide-up max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-2xl font-bold">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm">
            Join us and start your food journey
          </p>
        </div>

        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Full Name
            </label>
            <div
              className={`flex items-center bg-gray-800 border rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all ${
                errors.full_name ? "border-red-500" : "border-gray-700"
              }`}
            >
              <FiUser className="text-gray-400 mr-3" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                disabled={isLoading}
                required
              />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Email Address
            </label>
            <div
              className={`flex items-center bg-gray-800 border rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all ${
                errors.email ? "border-red-500" : "border-gray-700"
              }`}
            >
              <FiMail className="text-gray-400 mr-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                disabled={isLoading}
                required
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Phone Number
            </label>
            <div
              className={`flex items-center bg-gray-800 border rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all ${
                errors.phone ? "border-red-500" : "border-gray-700"
              }`}
            >
              <FiPhone className="text-gray-400 mr-3" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="012 345 678"
                className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                disabled={isLoading}
                required
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Password
            </label>
            <div
              className={`flex items-center bg-gray-800 border rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all ${
                errors.password ? "border-red-500" : "border-gray-700"
              }`}
            >
              <FiLock className="text-gray-400 mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Confirm Password
            </label>
            <div
              className={`flex items-center bg-gray-800 border rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all ${
                errors.password_confirmation
                  ? "border-red-500"
                  : "border-gray-700"
              }`}
            >
              <FiLock className="text-gray-400 mr-3" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password_confirmation}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-sm text-gray-400 pt-1">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
