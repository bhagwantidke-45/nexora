import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, Calendar, BookOpen,
  BarChart2, Target, LogOut, Menu, X, Zap,
  Settings, Search, Sparkles, DollarSign, Timer,
  Flag,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "../search/GlobalSearch";
import toast from "react-hot-toast";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tasks",     icon: CheckSquare,      label: "Tasks" },
  { path: "/calendar",  icon: Calendar,          label: "Calendar" },
  { path: "/records",   icon: BookOpen,          label: "Records" },
  { path: "/habits",    icon: Target,            label: "Habits" },
  { path: "/goals",     icon: Flag,              label: "Goals" },
  { path: "/finance",   icon: DollarSign,        label: "Finance" },
  { path: "/focus",     icon: Timer,             label: "Focus" },
  { path: "/stats",     icon: BarChart2,         label: "Stats" },
  { path: "/ai",        icon: Sparkles,          label: "AI" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);

  /* Cmd+K / Ctrl+K to open search */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); navigate("/login"); }
    catch { toast.error("Failed to logout!"); }
  };

  /* Active check */
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gradient hidden sm:block">Nexora</span>
          </Link>

          {/* Nav Items - Desktop (scrollable) */}
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link key={path} to={path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive(path) ? "nav-active" : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}>
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search button */}
            <button onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-gray-400 hover:text-white transition-all text-sm">
              <Search size={14} />
              <span className="hidden sm:block text-xs">Search</span>
              <kbd className="hidden sm:block text-xs text-gray-600 bg-white/5 border border-white/10 px-1 rounded">⌘K</kbd>
            </button>

            <ThemeToggle />

            {/* Avatar */}
            <Link to="/profile" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity" title="Profile">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>

            {/* Logout - desktop */}
            <button onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={14} /> Logout
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 glass-card rounded-none border-x-0 p-4 animate-slide-down max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-1 mb-3">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(path) ? "nav-active" : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}>
                  <Icon size={16} />{label}
                </Link>
              ))}
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/profile") ? "nav-active" : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}>
                <Settings size={16} /> Settings
              </Link>
            </div>
            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-300 truncate max-w-[160px]">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
