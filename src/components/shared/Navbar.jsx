import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BookOpen,
  BarChart2,
  Target,
  LogOut,
  Menu,
  X,
  Zap,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import toast from "react-hot-toast";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/records", icon: BookOpen, label: "Records" },
  { path: "/habits", icon: Target, label: "Habits" },
  { path: "/stats", icon: BarChart2, label: "Statistics" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch {
      toast.error("Failed to logout!");
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">Nexora</span>
          </Link>

          {/* Nav Items - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* User Avatar → Profile */}
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="Profile & Settings"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm text-gray-300 hidden lg:block">
                {user?.displayName || user?.email}
              </span>
            </Link>

            {/* Settings icon shortcut */}
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-200"
              title="Settings"
            >
              <Settings size={16} />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={16} />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 glass-card rounded-none border-x-0 p-4 animate-slide-down">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                    isActive
                      ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            {/* Profile link */}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                location.pathname === "/profile"
                  ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Settings size={18} />
              Profile & Settings
            </Link>

            {/* Mobile User & Logout */}
            <div className="border-t border-white/10 mt-3 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-300">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
