// MobileNav.jsx — Bottom tab bar for mobile (hidden on lg+)
// Shows the 5 most important routes + a "More" sheet for the rest

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, Calendar,
  Target, Sparkles, MoreHorizontal, X,
  BookOpen, BarChart2, DollarSign, Timer, Flag,
} from "lucide-react";

const PRIMARY_TABS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home"     },
  { path: "/tasks",     icon: CheckSquare,     label: "Tasks"    },
  { path: "/calendar",  icon: Calendar,        label: "Calendar" },
  { path: "/habits",    icon: Target,          label: "Habits"   },
  { path: "/ai",        icon: Sparkles,        label: "AI"       },
];

const MORE_ITEMS = [
  { path: "/goals",   icon: Flag,       label: "Goals"   },
  { path: "/finance", icon: DollarSign, label: "Finance" },
  { path: "/focus",   icon: Timer,      label: "Focus"   },
  { path: "/records", icon: BookOpen,   label: "Records" },
  { path: "/stats",   icon: BarChart2,  label: "Stats"   },
];

// Nav bar height in px — used to push QuickAdd up when sheet is open
const NAV_HEIGHT = 72;

const MobileNav = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  // Close sheet on route change
  useEffect(() => { setShowMore(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isMoreActive = MORE_ITEMS.some(i => isActive(i.path));

  return (
    <>
      {/* ── Bottom Tab Bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        {/* Glass bar */}
        <div
          className="glass-card rounded-none border-x-0 border-b-0 px-2 py-2"
          style={{ borderRadius: "1.25rem 1.25rem 0 0" }}
        >
          <div className="flex items-center justify-around">
            {PRIMARY_TABS.map(({ path, icon: Icon, label }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0 relative group"
                >
                  {/* Active pill background */}
                  {active && (
                    <span
                      className="absolute inset-x-0 top-0.5 h-8 rounded-xl animate-scale-in"
                      style={{ background: `rgba(var(--glow),0.15)` }}
                    />
                  )}
                  {/* Icon */}
                  <span
                    className={`relative z-10 transition-all duration-300 ${
                      active
                        ? "scale-110 drop-shadow-[0_0_8px_rgba(var(--glow),0.8)]"
                        : "text-gray-500 group-hover:text-gray-300 group-hover:scale-105"
                    }`}
                    style={active ? { color: "var(--p400)" } : {}}
                  >
                    <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                  {/* Label */}
                  <span
                    className={`relative z-10 text-[10px] font-medium transition-all duration-300 ${
                      active ? "font-semibold" : "text-gray-500"
                    }`}
                    style={active ? { color: "var(--p400)" } : {}}
                  >
                    {label}
                  </span>

                  {/* Active dot */}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full animate-scale-in"
                      style={{ background: "var(--p500)" }}
                    />
                  )}
                </Link>
              );
            })}

            {/* More button */}
            <button
              onClick={() => setShowMore(s => !s)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0 relative group"
            >
              {isMoreActive && (
                <span
                  className="absolute inset-x-0 top-0.5 h-8 rounded-xl animate-scale-in"
                  style={{ background: `rgba(var(--glow),0.15)` }}
                />
              )}
              <span
                className={`relative z-10 transition-all duration-300 ${
                  showMore || isMoreActive
                    ? "scale-110"
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
                style={showMore || isMoreActive ? { color: "var(--p400)" } : {}}
              >
                <MoreHorizontal size={20} strokeWidth={showMore ? 2.2 : 1.8} />
              </span>
              <span
                className={`relative z-10 text-[10px] font-medium transition-all ${
                  showMore || isMoreActive ? "font-semibold" : "text-gray-500"
                }`}
                style={showMore || isMoreActive ? { color: "var(--p400)" } : {}}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── More Sheet ── */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowMore(false)}
          />

          {/* Sheet — sits just above the nav bar, leaves room for QuickAdd FAB on the right */}
          <div
            className="lg:hidden fixed left-4 right-20 z-50 glass-card p-4 animate-slide-up"
            style={{
              borderRadius: "1.25rem",
              // bottom = nav bar height (≈72px) + 8px gap
              bottom: `calc(${NAV_HEIGHT}px + 8px)`,
            }}
          >
            {/* Handle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm font-semibold font-display">More Pages</span>
              <button
                onClick={() => setShowMore(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid of more items */}
            <div className="grid grid-cols-5 gap-1">
              {MORE_ITEMS.map(({ path, icon: Icon, label }) => {
                const active = isActive(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all ${
                      active
                        ? "nav-active"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={20} style={active ? { color: "var(--p400)" } : {}} />
                    <span className="text-[10px] font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNav;