// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineSquares2X2,
  HiOutlineRectangleStack,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiArrowLeftOnRectangle,
  HiChevronLeft,
  HiBars3,
} from "react-icons/hi2";
import { useUser } from "./UserContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useUser();

  // Debug log to check if user data updates
  useEffect(() => {
    console.log("Sidebar user data updated:", user);
  }, [user]);

  const menuItems = [
    {
      name: "Overview",
      to: "/dashboard",
      icon: <HiOutlineSquares2X2 size={22} />,
    },
    {
      name: "Categories",
      to: "/dashboard/categories",
      icon: <HiOutlineRectangleStack size={22} />,
    },
    {
      name: "Manage Foods",
      to: "/dashboard/manage-foods",
      icon: <HiOutlineRectangleStack size={22} />,
    },
    {
      name: "Orders",
      to: "/dashboard/orders",
      icon: <HiOutlineClipboardDocumentList size={22} />,
    },
    {
      name: "Customers",
      to: "/dashboard/customers",
      icon: <HiOutlineUsers size={22} />,
    },
    {
      name: "Settings",
      to: "/dashboard/settings",
      icon: <HiOutlineCog6Tooth size={22} />,
    },
  ];

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return "AK";
  };

  return (
    <aside
      className={`h-full bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}
    >
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {isOpen ? (
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              TosEat{" "}
              <span className="text-xs text-slate-500 font-normal">Admin</span>
            </span>
          ) : (
            <span className="text-xl font-bold text-emerald-400 mx-auto">
              TE
            </span>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 transition"
          >
            {isOpen ? <HiChevronLeft size={20} /> : <HiBars3 size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `w-full flex items-center justify-between p-3 rounded-xl font-medium transition-all group ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"} transition-colors`}
                    >
                      {item.icon}
                    </span>
                    {isOpen && <span className="text-sm">{item.name}</span>}
                  </div>

                  {item.badge && isOpen && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-white text-emerald-600 font-bold" : "bg-emerald-500/10 text-emerald-400"}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/30 flex-shrink-0 bg-slate-800">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  const parent = e.target.parentElement;
                  const initialsDiv = document.createElement("div");
                  initialsDiv.className =
                    "w-full h-full flex items-center justify-center text-emerald-400 font-bold text-sm";
                  initialsDiv.textContent = getInitials();
                  parent.appendChild(initialsDiv);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                {getInitials()}
              </div>
            )}
          </div>
          {isOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {user?.role || "Manager"}
              </span>
            </div>
          )}
        </div>

        <NavLink
          to="/logout"
          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition font-medium text-sm"
        >
          <HiArrowLeftOnRectangle size={22} className="text-slate-400" />
          {isOpen && <span>Logout</span>}
        </NavLink>
      </div>
    </aside>
  );
}
