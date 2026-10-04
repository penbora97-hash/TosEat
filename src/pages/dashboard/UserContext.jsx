// src/pages/dashboard/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser(parsed);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Error loading user:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // ✅ Listen for auth changes
    const handleAuthChange = () => loadUser();
    const handleProfileUpdated = () => loadUser();

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("loginStatusChanged", handleAuthChange);
    window.addEventListener("profileUpdated", handleProfileUpdated);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("loginStatusChanged", handleAuthChange);
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, []);

  // ✅ Update partial user fields (used by Setting.jsx)
  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event("profileUpdated"));
  };

  // ✅ Update avatar specifically (used by Setting.jsx)
  const updateAvatar = (avatarUrl) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), avatar_url: avatarUrl };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });

    // Also sync userProfile in localStorage
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      profile.avatar_url = avatarUrl;
      localStorage.setItem("userProfile", JSON.stringify(profile));
    } catch (e) {
      console.error("Error syncing userProfile:", e);
    }

    window.dispatchEvent(new Event("profileUpdated"));
  };

  const value = {
    user,
    setUser,
    updateUser, // ✅ NEW
    updateAvatar, // ✅ NEW
    loading,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}