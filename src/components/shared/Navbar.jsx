// Navbar.jsx — Animated active pill, theme-aware, desktop only (MobileNav handles mobile)
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, Calendar, BookOpen,
  BarChart2, Target, LogOut, Menu, X, Zap,
  Settings, Search, Sparkles, DollarSign, Timer, Flag,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "../search/GlobalSearch";
import toast from "react-hot-toast";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tasks",     icon: CheckSquare,     label: "Tasks"    },
  { path: "/calendar",  icon: Calendar,        label: "Calendar" },
  { path: "/records",   icon: BookOpen,        label: "Records"  },
  { path: "/habits",    icon: Target,          label: "Habits"   },
  { path: "/goals",     icon: Flag,            label: "Goals"    },
  { path: "/finance",   icon: DollarSign,      label: "Finance"  },
  { path: "/focus",     icon: Timer,           label: "Focus"    },
  { path: "/stats",     icon: BarChart2,       label: "Stats"    },
  { path: "/ai",        icon: Sparkles,        label: "AI"       },
];

const Navbar = () => {
  const { user, logout }    = useAuth();
  const { isDark }          = useTheme();
  const location            = useLocation();
  const navigate            = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pillStyle, setPillStyle]   = useState({});
  const navRef    = useRef(null);
  const activeRef = useRef(null);

  /* ── Cmd+K shortcut ── */
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

  /* ── Animated pill: track active link position ── */
  useEffect(() => {
    if (!activeRef.current || !navRef.current) return;
    const navRect  = navRef.current.getBoundingClientRect();
    const itemRect = activeRef.current.getBoundingClientRect();
    setPillStyle({
      left:  itemRect.left  - navRect.left,
      width: itemRect.width,
      opacity: 1,
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); navigate("/login"); }
    catch { toast.error("Failed to logout!"); }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* ── Logo ── */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg
                         transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{
                background: `linear-gradient(135deg, var(--grad1), var(--grad2))`,
                boxShadow:  `0 4px 15px rgba(var(--glow),0.4)`,
              }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gradient hidden sm:block">
              Nexora
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div
            ref={navRef}
            className="hidden lg:flex items-center gap-0.5 relative overflow-x-auto"
          >
            {/* Animated active pill */}
            <div
              className="absolute top-0 bottom-0 rounded-xl pointer-events-none transition-all duration-300 ease-out"
              style={{
                ...pillStyle,
                background:    `rgba(var(--glow),0.15)`,
                border:        `1px solid rgba(var(--glow),0.25)`,
                transitionProperty: "left, width, opacity",
              }}
            />

            {navItems.map(({ path, icon: Icon, label }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  ref={active ? activeRef : null}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                              font-medium whitespace-nowrap transition-colors duration-200 z-10 ${
                    active
                      ? "font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                  style={active ? { color: "var(--p400)" } : {}}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card
                         text-gray-400 hover:text-white transition-all text-sm
                         hover:border-opacity-60 hover:scale-105"
              style={{ "--hover-border": `rgba(var(--glow),0.4)` }}
            >
              <Search size={14} />
              <span className="hidden sm:block text-xs">Search</span>
              <kbd className="hidden sm:block text-xs text-gray-600 bg-white/5
                             border border-white/10 px-1 rounded">⌘K</kbd>
            </button>

            <ThemeToggle />

            {/* Avatar — desktop */}
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 hover:opacity-80
                         transition-all hover:scale-105"
              title="Profile"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center
                           text-white text-sm font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, var(--grad1), var(--grad2))` }}
              >
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>

            {/* Logout — desktop */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                         text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10
                         transition-all"
            >
              <LogOut size={14} /> Logout
            </button>

            {/* Mobile hamburger (for old-style menu, shown alongside MobileNav) */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400
                         hover:text-white transition-all"
            >
              <div className={`transition-all duration-300 ${mobileOpen ? "rotate-90" : ""}`}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Dropdown Menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute top-16 left-0 right-0 glass-card rounded-none
                       border-x-0 p-4 animate-slide-down max-h-[80vh]
                       overflow-y-auto custom-scrollbar"
            style={{ borderBottom: `1px solid rgba(var(--glow),0.15)` }}
          >
            <div className="grid grid-cols-2 gap-1 mb-3">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                              font-medium transition-all ${
                    isActive(path)
                      ? "nav-active"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />{label}
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                            font-medium transition-all ${
                  isActive("/profile")
                    ? "nav-active"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Settings size={16} /> Settings
              </Link>
            </div>

            {/* User row */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center
                             text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, var(--grad1), var(--grad2))` }}
                >
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-300 truncate max-w-[160px]">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                           text-sm text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Search ── */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;