import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaSync, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

// Modal Component
const Modal = ({ isOpen, onClose, title, message, type = "info", onConfirm, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-5xl text-emerald-500" />;
      case "error":
        return <FaExclamationTriangle className="text-5xl text-red-500" />;
      case "warning":
        return <FaExclamationTriangle className="text-5xl text-yellow-500" />;
      default:
        return <FaExclamationTriangle className="text-5xl text-blue-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "error":
        return "bg-red-500 hover:bg-red-600";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>
          
          <p className="text-slate-300 text-sm mb-6">
            {message}
          </p>
          
          <div className="flex gap-3 justify-center">
            {onConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition text-sm"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 ${getButtonColor()} rounded-xl font-semibold transition text-sm text-white`}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`px-6 py-2 ${getButtonColor()} rounded-xl font-semibold transition text-sm text-white`}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    name_kh: "",
    is_active: true,
    order: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getToken = () => localStorage.getItem("token");

  // Show modal helper
  const showModal = ({ title, message, type = "info", onConfirm = null, confirmText = "Confirm", cancelText = "Cancel" }) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  // Close modal
  const closeModal = () => {
    setModal({
      ...modal,
      isOpen: false,
    });
  };

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
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
        "http://localhost:8000/api/admin/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Categories Response:", response.data);

      if (response.data.status === "success") {
        const data = response.data.data.data || response.data.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setError(response.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to access this page.");
      } else {
        setError("Failed to load categories. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }

    const token = getToken();
    if (!token) {
      showModal({
        title: "Session Expired",
        message: "Please login again.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      const payload = {
        name: formData.name.trim(),
        name_kh: formData.name_kh?.trim() || "",
        is_active: Boolean(formData.is_active),
        order: parseInt(formData.order) || 0,
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:8000/api/admin/categories/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        showModal({
          title: "Success!",
          message: "Category updated successfully!",
          type: "success",
        });
      } else {
        await axios.post(
          "http://localhost:8000/api/admin/categories",
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        showModal({
          title: "Success!",
          message: "Category added successfully!",
          type: "success",
        });
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        showModal({
          title: "Validation Error",
          message: "Please check the form for errors.",
          type: "error",
        });
      } else if (error.response?.status === 401) {
        showModal({
          title: "Session Expired",
          message: "Please login again.",
          type: "error",
        });
      } else {
        showModal({
          title: "Error",
          message: error.response?.data?.message || "Failed to save category. Please try again.",
          type: "error",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      name_kh: category.name_kh || "",
      is_active: category.is_active,
      order: category.order || 0,
    });
    setIsEditing(true);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    // Show delete confirmation modal
    setDeleteTarget(id);
    showModal({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this category? This action cannot be undone.",
      type: "warning",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        const token = getToken();
        if (!token) {
          showModal({
            title: "Session Expired",
            message: "Please login again.",
            type: "error",
          });
          return;
        }

        try {
          await axios.delete(`http://localhost:8000/api/admin/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          showModal({
            title: "Success!",
            message: "Category deleted successfully!",
            type: "success",
          });
          fetchCategories();
        } catch (error) {
          console.error("Error deleting category:", error);
          if (error.response?.status === 422) {
            showModal({
              title: "Cannot Delete",
              message: error.response.data.message || "Cannot delete category with products.",
              type: "error",
            });
          } else {
            showModal({
              title: "Error",
              message: "Failed to delete category. Please try again.",
              type: "error",
            });
          }
        }
      },
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const token = getToken();
    if (!token) {
      showModal({
        title: "Session Expired",
        message: "Please login again.",
        type: "error",
      });
      return;
    }

    try {
      await axios.patch(
        `http://localhost:8000/api/admin/categories/${id}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchCategories();
      showModal({
        title: "Success!",
        message: `Category ${!currentStatus ? "activated" : "deactivated"} successfully!`,
        type: "success",
      });
    } catch (error) {
      showModal({
        title: "Error",
        message: "Failed to update status. Please try again.",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", name_kh: "", is_active: true, order: 0 });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  // Sort categories by order
  const sortedCategories = [...categories].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center">
        <div className="text-red-400 text-xl mb-3">⚠️ {error}</div>
        <button
          onClick={fetchCategories}
          className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition flex items-center gap-2 mx-auto"
        >
          <FaSync className="text-sm" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your food categories
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition font-semibold flex items-center gap-2"
          >
            <FaPlus className="text-sm" /> Add Category
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {isEditing ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white transition text-2xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    className={`w-full px-4 py-2 bg-slate-900 border rounded-xl text-white focus:outline-none focus:border-emerald-500 transition ${
                      errors.name ? "border-red-500" : "border-slate-700"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Name (Khmer)
                  </label>
                  <input
                    type="text"
                    name="name_kh"
                    value={formData.name_kh}
                    onChange={handleChange}
                    placeholder="ឈ្មោះជាភាសាខ្មែរ"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="Display order"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm font-medium text-slate-300">
                    Active
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : isEditing ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  sortedCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                    >
                      <td className="px-4 py-3 text-sm">{category.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {category.name}
                        {category.name_kh && (
                          <span className="text-slate-400 text-xs ml-2">
                            ({category.name_kh})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {category.order || 0}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleToggleStatus(category.id, category.is_active)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            category.is_active
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm transition flex items-center gap-1"
                          >
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition flex items-center gap-1"
                          >
                            <FaTrash className="text-xs" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-400">
          Total: {sortedCategories.length} categories
          {sortedCategories.length > 0 && (
            <span className="ml-4 text-emerald-400">(Sorted by order)</span>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </div>
  );
};

export default Category;