import React, { useState, useEffect } from "react";
import { CiMail, CiLock, CiUser, CiPhone } from "react-icons/ci";
import {
  AiOutlineClose,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignupPopup({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Show popup only if not logged in
  useEffect(() => {
    const hasToken = localStorage.getItem("token");
    if (hasToken) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password_confirmation !== formData.password) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // ✅ Call Register API
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

        // Save token and user data
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

        // Close popup
        setIsOpen(false);

        // Dispatch events
        window.dispatchEvent(new Event("loginStatusChanged"));
        window.dispatchEvent(new Event("authChange"));

        // Show success message
        alert("✅ Registration successful! Welcome to TosEat 🎉");

        // Reset form
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          password_confirmation: "",
        });

        // Navigate to home
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Signup Error:", error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 422) {
          // Validation errors
          const fieldErrors = {};
          Object.keys(data.errors).forEach((key) => {
            // Map backend field names to frontend field names
            const fieldMap = {
              full_name: "full_name",
              password_confirmation: "password_confirmation",
            };
            const frontendKey = fieldMap[key] || key;
            fieldErrors[frontendKey] = data.errors[key][0];
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

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSwitchToLogin = () => {
    setIsOpen(false);
    setTimeout(() => {
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[50] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-md relative shadow-2xl animate-fade-slide-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl transition-colors z-10"
        >
          <AiOutlineClose />
        </button>

        <div className="p-8 pt-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
                TosEat
              </h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">
            SignUp Now
          </h2>
          <p className="text-gray-400 text-center mb-8">
            ទទួលបានការបញ្ចុះតម្លៃ និងការផ្សព្វផ្សាយពិសេសពី TosEat
          </p>

          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <div
                className={`flex items-center bg-gray-800 border rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition-all ${
                  errors.full_name ? "border-red-500" : "border-gray-700"
                }`}
              >
                <CiUser className="text-xl text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full Name / ឈ្មោះពេញ"
                  className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div
                className={`flex items-center bg-gray-800 border rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition-all ${
                  errors.email ? "border-red-500" : "border-gray-700"
                }`}
              >
                <CiMail className="text-xl text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email / អ៊ីម៉ែល"
                  className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <div
                className={`flex items-center bg-gray-800 border rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-700"
                }`}
              >
                <CiPhone className="text-xl text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone / លេខទូរស័ព្ទ (Ex: 012 345 678)"
                  className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div
                className={`flex items-center bg-gray-800 border rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition-all ${
                  errors.password ? "border-red-500" : "border-gray-700"
                }`}
              >
                <CiLock className="text-xl text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password / ពាក្យសម្ងាត់"
                  className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div
                className={`flex items-center bg-gray-800 border rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition-all ${
                  errors.password_confirmation
                    ? "border-red-500"
                    : "border-gray-700"
                }`}
              >
                <CiLock className="text-xl text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm Password / បញ្ជាក់ពាក្យសម្ងាត់"
                  className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
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
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-4 rounded-2xl font-semibold text-lg mt-4 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-white transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  កំពុងចុះឈ្មោះ...
                </span>
              ) : (
                "ចុះឈ្មោះឥឡូវនេះ / Sign Up"
              )}
            </button>

            {/* Link to Login */}
            <p className="text-center text-sm text-gray-400 pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default SignupPopup;
