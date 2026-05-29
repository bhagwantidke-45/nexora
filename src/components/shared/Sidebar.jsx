import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, Calendar, BookOpen,
  BarChart2, Target, LogOut, Settings,
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
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#12052a,#1e0a3c)" }}
        >
          <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
            <defs>
              <linearGradient id="lfl-sidebar" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="40%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path
              d="M256 72C256 72 324 118 320 168C346 144 338 104 338 104C338 104 380 148 372 200C364 244 344 272 308 292C292 301 274 306 256 308C238 306 220 301 204 292C168 272 148 244 140 200C132 148 174 104 174 104C174 104 166 144 192 168C188 118 256 72 256 72Z"
              fill="url(#lfl-sidebar)"
            />
            <path
              d="M256 132C256 132 290 158 287 182C304 168 299 146 299 146C299 146 322 172 318 198C314 220 300 236 278 246C271 249 264 251 256 252C248 251 241 249 234 246C212 236 198 220 194 198C190 172 213 146 213 146C213 146 208 168 225 182C222 158 256 132 256 132Z"
              fill="white"
              opacity="0.22"
            />
            <ellipse cx="256" cy="222" rx="30" ry="38" fill="white" opacity="0.10" />
            <circle cx="196" cy="400" r="22" fill="#f97316" opacity="0.9" />
            <circle cx="256" cy="400" r="22" fill="#ec4899" opacity="0.9" />
            <circle cx="316" cy="400" r="22" fill="#a855f7" opacity="0.9" />
          </svg>
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