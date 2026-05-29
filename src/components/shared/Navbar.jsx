// Navbar.jsx — with NotificationCenter + accessibility improvements
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, Calendar, BookOpen,
  BarChart2, Target, LogOut, Menu, X,
  Settings, Search, Sparkles, DollarSign, Timer, Flag,
} from "lucide-react";
import { useAuth }  from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle         from "./ThemeToggle";
import GlobalSearch        from "../search/GlobalSearch";
import NotificationCenter  from "./NotificationCenter";
import toast from "react-hot-toast";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tasks",     icon: CheckSquare,     label: "Tasks"     },
  { path: "/calendar",  icon: Calendar,        label: "Calendar"  },
  { path: "/records",   icon: BookOpen,        label: "Records"   },
  { path: "/habits",    icon: Target,          label: "Habits"    },
  { path: "/goals",     icon: Flag,            label: "Goals"     },
  { path: "/finance",   icon: DollarSign,      label: "Finance"   },
  { path: "/focus",     icon: Timer,           label: "Focus"     },
  { path: "/stats",     icon: BarChart2,       label: "Stats"     },
  { path: "/ai",        icon: Sparkles,        label: "AI"        },
];

/* ── Inline flame logo (consistent with Loader) ── */
const NexoraLogo = ({ size = 20 }) => (
  <div
    className="rounded-xl flex items-center justify-center shadow-lg overflow-hidden transition-all duration-300"
    style={{
      width: size * 1.6,
      height: size * 1.6,
      background: "linear-gradient(135deg,#12052a,#1e0a3c)",
    }}
  >
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="lfl-nav" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M256 72C256 72 324 118 320 168C346 144 338 104 338 104C338 104 380 148 372 200C364 244 344 272 308 292C292 301 274 306 256 308C238 306 220 301 204 292C168 272 148 244 140 200C132 148 174 104 174 104C174 104 166 144 192 168C188 118 256 72 256 72Z"
        fill="url(#lfl-nav)"
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
);

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

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Animated active pill
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

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); navigate("/login"); }
    catch { toast.error("Failed to logout!"); }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-4 py-3"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Nexora home"
          >
            <div className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <NexoraLogo size={20} />
            </div>
            <span className="font-display font-bold text-xl text-gradient hidden sm:block">
              Nexora
            </span>
          </Link>

          {/* Desktop Nav */}
          <div ref={navRef} className="hidden lg:flex items-center gap-0.5 relative overflow-x-auto" role="menubar">
            {/* Animated active pill */}
            <div
              className="absolute top-0 bottom-0 rounded-xl pointer-events-none transition-all duration-300 ease-out"
              style={{
                ...pillStyle,
                background: `rgba(var(--glow),0.15)`,
                border: `1px solid rgba(var(--glow),0.25)`,
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
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors duration-200 z-10 ${
                    active ? "font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                  style={active ? { color: "var(--p400)" } : {}}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-gray-400 hover:text-white transition-all text-sm hover:scale-105"
              aria-label="Search (Ctrl+K)"
            >
              <Search size={14} aria-hidden="true" />
              <span className="hidden sm:block text-xs">Search</span>
              <kbd
                className="hidden sm:block text-xs text-gray-600 bg-white/5 border border-white/10 px-1 rounded"
                aria-hidden="true"
              >
                ⌘K
              </kbd>
            </button>

            {/* Notification bell */}
            <NotificationCenter />

            <ThemeToggle />

            {/* Avatar */}
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 hover:opacity-80 transition-all hover:scale-105"
              aria-label={`Profile — ${user?.displayName || "User"}`}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, var(--grad1), var(--grad2))` }}
                aria-hidden="true"
              >
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              aria-label="Log out"
            >
              <LogOut size={14} aria-hidden="true" /> Logout
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <div className={`transition-all duration-300 ${mobileOpen ? "rotate-90" : ""}`}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute top-16 left-0 right-0 glass-card rounded-none border-x-0 p-4 animate-slide-down max-h-[80vh] overflow-y-auto custom-scrollbar"
            style={{ borderBottom: `1px solid rgba(var(--glow),0.15)` }}
            role="menu"
          >
            <div className="grid grid-cols-2 gap-1 mb-3">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  role="menuitem"
                  aria-current={isActive(path) ? "page" : undefined}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(path) ? "nav-active" : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" /> {label}
                </Link>
              ))}
              <Link
                to="/profile"
                role="menuitem"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/profile") ? "nav-active" : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Settings size={16} aria-hidden="true" /> Settings
              </Link>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, var(--grad1), var(--grad2))` }}
                  aria-hidden="true"
                >
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-300 truncate max-w-[160px]">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} aria-hidden="true" /> Logout
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