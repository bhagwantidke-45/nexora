// ThemeToggle.jsx — Mode toggle (dark/light), works with new ThemeContext
import { Sun, Moon } from "lucide-react";
import { useTheme }  from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative w-14 h-7 rounded-full transition-all duration-300
                 focus:outline-none focus:ring-2 hover:scale-105 active:scale-95"
      style={{
        background: isDark
          ? `rgba(var(--glow),0.25)`
          : `rgba(var(--glow),0.15)`,
        border: `1px solid rgba(var(--glow),0.3)`,
      }}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-yellow-300 pointer-events-none">
        <Sun size={12} />
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--p300)" }}>
        <Moon size={12} />
      </span>

      {/* Sliding thumb */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full shadow-md
                   flex items-center justify-center
                   transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: isDark ? "translateX(28px)" : "translateX(2px)",
          background: isDark
            ? `linear-gradient(135deg, var(--grad1), var(--grad2))`
            : "#ffffff",
          boxShadow: isDark
            ? `0 2px 8px rgba(var(--glow),0.5)`
            : "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {isDark
          ? <Moon size={12} className="text-white" />
          : <Sun  size={12} className="text-yellow-500" />
        }
      </span>
    </button>
  );
};

export default ThemeToggle;