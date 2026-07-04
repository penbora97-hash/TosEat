import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ isOpen, onClose, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      const response = await axios.post("http://localhost:8000/api/login", {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login Response:", response.data);

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

        setFormData({ email: "", password: "", rememberMe: false });
        onClose();

        // ✅ Redirect based on role
        if (user.role === "admin") {
          // Admin → Dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // User → Home
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          setErrors({ general: "Invalid email or password" });
        } else if (status === 403) {
          setErrors({ general: data.message || "Account is deactivated" });
        } else if (status === 422) {
          const fieldErrors = {};
          Object.keys(data.errors).forEach((key) => {
            fieldErrors[key] = data.errors[key][0];
          });
          setErrors(fieldErrors);
        } else {
          setErrors({
            general: data.message || "Login failed. Please try again.",
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
          <h2 className="text-4xl font-bold text-white">Welcome Back!</h2>
          <p className="text-gray-400 text-sm">
            Login to continue to your account
          </p>
        </div>

        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-300 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
                className={`w-full pl-9 pr-3 py-2.5 bg-gray-800 border ${
                  errors.email
                    ? "border-red-500 bg-red-900/20"
                    : "border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 text-white placeholder-gray-500`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                className={`w-full pl-9 pr-10 py-2.5 bg-gray-800 border ${
                  errors.password
                    ? "border-red-500 bg-red-900/20"
                    : "border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 text-white placeholder-gray-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                tabIndex="-1"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 text-emerald-500 border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 bg-gray-700"
              />
              <span>Remember me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-sm text-gray-400 pt-1">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSwitchToRegister) onSwitchToRegister();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
