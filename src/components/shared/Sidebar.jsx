import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, Calendar, BookOpen,
  BarChart2, Target, LogOut, Zap, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import toast from "react-hot-toast";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/records", icon: BookOpen, label: "Records" },
  { path: "/habits", icon: Target, label: "Habits" },
  { path: "/stats", icon: BarChart2, label: "Statistics" },
  { path: "/profile", icon: Settings, label: "Settings" },
];

/**
 * Sidebar — collapsible left navigation panel.
 * Usage: wrap page content in a flex container and render <Sidebar /> beside it.
 *
 * <div className="flex">
 *   <Sidebar />
 *   <main className="flex-1 ...">...</main>
 * </div>
 */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out!");
      navigate("/login");
    } catch {
      toast.error("Failed to logout!");
    }
  };

  return (
    <aside
      className={`relative flex flex-col h-screen sticky top-0 glass-card rounded-none border-y-0 border-l-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/25">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-xl text-gradient">Nexora</span>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-500/20 transition-all border border-white/20 z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ""}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme + User + Logout */}
      <div className="px-2 py-4 border-t border-white/10 space-y-3">
        {!collapsed && (
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-gray-500">Theme</span>
            <ThemeToggle />
          </div>
        )}

        {/* User */}
        <div className={`flex items-center gap-2 px-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.displayName || "User"}
              </p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
