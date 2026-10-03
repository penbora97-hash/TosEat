import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// ✅ Auto attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Auto handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userProfile");
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("loginStatusChanged"));
    }
    return Promise.reject(error);
  },
);

// ✅ Storage URL helper
export const STORAGE_BASE_URL =
  import.meta.env.VITE_STORAGE_BASE_URL || "http://localhost:8000";

export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const clean = path.replace(/^\/+/, "");

  if (clean.startsWith("storage/")) return `${STORAGE_BASE_URL}/${clean}`;
  return `${STORAGE_BASE_URL}/storage/${clean}`;
};

export default api;