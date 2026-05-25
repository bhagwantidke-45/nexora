import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${
        isDark
          ? "bg-primary-600/50 border border-primary-500/30"
          : "bg-primary-200 border border-primary-300"
      }`}
    >
      {/* Track Icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-yellow-300">
        <Sun size={12} />
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-primary-300">
        <Moon size={12} />
      </span>

      {/* Thumb */}
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark
            ? "translate-x-7 bg-primary-500"
            : "translate-x-0.5 bg-white"
        }`}
      >
        {isDark ? (
          <Moon size={12} className="text-white" />
        ) : (
          <Sun size={12} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;