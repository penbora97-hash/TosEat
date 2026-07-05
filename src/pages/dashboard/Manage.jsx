import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaImage,
  FaSync,
  FaTimes,
} from "react-icons/fa";
import { HiOutlineSquaresPlus } from "react-icons/hi2";

export default function Manage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    name_kh: "",
    category_id: "",
    price: "",
    stock: "",
    is_available: true,
    image_url: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: "", // 'success', 'error', 'confirm'
    title: "",
    message: "",
    onConfirm: null,
  });

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/categories");
      if (response.data.status === "success") {
        const data = response.data.data || [];
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
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
        "http://localhost:8000/api/admin/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Products Response:", response.data);

      if (response.data.status === "success") {
        const data = response.data.data.data || response.data.data || [];
        setFoods(Array.isArray(data) ? data : []);
      } else {
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to access this page.");
      } else {
        setError("Failed to load products. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foods.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.name_kh?.toLowerCase().includes(q) ||
        item.category?.name?.toLowerCase().includes(q),
    );
  }, [foods, search]);

  const resetForm = () => {
    setForm({
      name: "",
      name_kh: "",
      category_id: "",
      price: "",
      stock: "",
      is_available: true,
      image_url: "",
    });
    setEditingId(null);
  };

  // Modal helpers
  const showModal = (type, title, message, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showModal("error", "Validation Error", "Please enter food name.");
      return;
    }
    if (!form.category_id) {
      showModal("error", "Validation Error", "Please select a category.");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      showModal("error", "Validation Error", "Please enter a valid price.");
      return;
    }

    const token = getToken();
    if (!token) {
      showModal("error", "Session Expired", "Please login again.");
      return;
    }

    try {
      const data = {
        name: form.name.trim(),
        name_kh: form.name_kh?.trim() || "",
        category_id: parseInt(form.category_id),
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        is_available: form.is_available,
        image_url: form.image_url?.trim() || "",
      };

      console.log("Sending data:", data);

      if (editingId) {
        await axios.put(
          `http://localhost:8000/api/admin/products/${editingId}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        showModal("success", "Success", "Product updated successfully!");
      } else {
        await axios.post("http://localhost:8000/api/admin/products", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showModal("success", "Success", "Product added successfully!");
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join("\n");
        showModal("error", "Validation Error", errorMessages);
      } else if (error.response?.status === 401) {
        showModal("error", "Session Expired", "Please login again.");
      } else {
        showModal(
          "error",
          "Error",
          "Failed to save product. Please try again.",
        );
      }
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      name_kh: item.name_kh || "",
      category_id: String(item.category_id || item.category?.id || ""),
      price: String(item.price || ""),
      stock: String(item.stock || 0),
      is_available: item.is_available ?? true,
      image_url: item.image_url || "",
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    showModal(
      "confirm",
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      async () => {
        const token = getToken();
        if (!token) {
          showModal("error", "Session Expired", "Please login again.");
          return;
        }

        try {
          await axios.delete(`http://localhost:8000/api/admin/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          showModal("success", "Success", "Product deleted successfully!");
          fetchProducts();
          if (editingId === id) resetForm();
        } catch (error) {
          console.error("Error deleting product:", error);
          showModal(
            "error",
            "Error",
            "Failed to delete product. Please try again.",
          );
        }
      },
    );
  };

  const handleRefresh = () => {
    fetchCategories();
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading products...</p>
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
          <FaSync className="text-sm" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                      : modal.type === "confirm"
                        ? "text-amber-400"
                        : "text-white"
                }`}
              >
                {modal.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-slate-300 whitespace-pre-line">
                {modal.message}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              {modal.type === "confirm" ? (
                <>
                  <button
                    onClick={() => {
                      if (modal.onConfirm) {
                        modal.onConfirm();
                      }
                      closeModal();
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    modal.type === "success"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Foods</h1>
          <p className="text-sm text-slate-400">
            បន្ថែម កែប្រែ និងលុបមុខម្ហូបក្នុងហាង
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition flex items-center gap-2"
        >
          <FaSync className="text-sm" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-1 bg-slate-950 border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <HiOutlineSquaresPlus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingId ? "Edit Food" : "Add Food"}
              </h2>
              <p className="text-sm text-slate-400">បំពេញព័ត៌មានម្ហូប</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Food Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Bay chha Mres Prov"
              required
            />
            <InputField
              label="Food Name (Khmer)"
              value={form.name_kh}
              onChange={(e) => setForm({ ...form, name_kh: e.target.value })}
              placeholder="ឈ្មោះជាភាសាខ្មែរ"
            />

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500"
                required
              >
                <option value="">-- Select category --</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.name_kh ? `(${cat.name_kh})` : ""}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No categories available
                  </option>
                )}
              </select>
              {categories.length === 0 && (
                <p className="text-amber-400 text-xs mt-1">
                  ⚠️ No categories found. Please add categories first.
                </p>
              )}
            </div>

            {/* ✅ Price - changed to text input */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Price <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="4.50"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 placeholder:text-slate-500 transition"
                required
              />
            </div>

            {/* ✅ Stock - changed to text input */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Stock</label>
              <input
                type="text"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="10"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 placeholder:text-slate-500 transition"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Status
              </label>
              <select
                value={form.is_available ? "Available" : "Unavailable"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_available: e.target.value === "Available",
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <InputField
              label="Image URL"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition"
              >
                <FaPlus /> {editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="xl:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Food List</h2>
              <p className="text-sm text-slate-400">
                {filteredFoods.length} items found
              </p>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food..."
                className="w-full md:w-80 bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-sm border-b border-slate-800">
                  <th className="pb-3 font-medium">Food</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((item) => (
                    <tr
                      key={item.id}
                      className="text-slate-300 hover:bg-slate-900/50 transition"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  const parent = e.target.parentElement;
                                  const fallback =
                                    document.createElement("div");
                                  fallback.className = "text-slate-500";
                                  fallback.innerHTML =
                                    '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                                  parent.appendChild(fallback);
                                }}
                              />
                            ) : (
                              <FaImage className="text-slate-500 w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.name_kh || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{item.category?.name || "N/A"}</td>
                      <td className="py-4 font-semibold text-white">
                        $
                        {typeof item.price === "number"
                          ? item.price.toFixed(2)
                          : parseFloat(item.price)?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-4">{item.stock || 0}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.is_available
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {item.is_available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-slate-500"
                    >
                      {search
                        ? "No food matches your search."
                        : "No food found. Add your first food!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">{label}</label>
      <input
        {...props}
        className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 placeholder:text-slate-500 transition"
      />
    </div>
  );
}
