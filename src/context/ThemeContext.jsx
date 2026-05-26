import { createContext, useContext, useState, useEffect } from "react";

// ── 10 Premium Themes ────────────────────────────────────────────────────────
export const THEMES = {
  purple: {
    name: "Purple Dreams",
    emoji: "💜",
    vars: {
      "--p50":  "#faf5ff", "--p100": "#f3e8ff", "--p200": "#e9d5ff",
      "--p300": "#d8b4fe", "--p400": "#c084fc", "--p500": "#a855f7",
      "--p600": "#9333ea", "--p700": "#7e22ce", "--p800": "#6b21a8",
      "--p900": "#581c87",
      "--glow":  "168,85,247",
      "--grad1": "#a855f7", "--grad2": "#7c3aed",
      "--badge-bg": "rgba(168,85,247,0.15)", "--badge-text": "#c084fc",
    },
  },
  ocean: {
    name: "Ocean Blue",
    emoji: "🌊",
    vars: {
      "--p50":  "#eff6ff", "--p100": "#dbeafe", "--p200": "#bfdbfe",
      "--p300": "#93c5fd", "--p400": "#60a5fa", "--p500": "#3b82f6",
      "--p600": "#2563eb", "--p700": "#1d4ed8", "--p800": "#1e40af",
      "--p900": "#1e3a8a",
      "--glow":  "59,130,246",
      "--grad1": "#3b82f6", "--grad2": "#1d4ed8",
      "--badge-bg": "rgba(59,130,246,0.15)", "--badge-text": "#60a5fa",
    },
  },
  emerald: {
    name: "Emerald Green",
    emoji: "💚",
    vars: {
      "--p50":  "#ecfdf5", "--p100": "#d1fae5", "--p200": "#a7f3d0",
      "--p300": "#6ee7b7", "--p400": "#34d399", "--p500": "#10b981",
      "--p600": "#059669", "--p700": "#047857", "--p800": "#065f46",
      "--p900": "#064e3b",
      "--glow":  "16,185,129",
      "--grad1": "#10b981", "--grad2": "#047857",
      "--badge-bg": "rgba(16,185,129,0.15)", "--badge-text": "#34d399",
    },
  },
  rose: {
    name: "Rose Gold",
    emoji: "🌸",
    vars: {
      "--p50":  "#fff1f2", "--p100": "#ffe4e6", "--p200": "#fecdd3",
      "--p300": "#fda4af", "--p400": "#fb7185", "--p500": "#f43f5e",
      "--p600": "#e11d48", "--p700": "#be123c", "--p800": "#9f1239",
      "--p900": "#881337",
      "--glow":  "244,63,94",
      "--grad1": "#f43f5e", "--grad2": "#be123c",
      "--badge-bg": "rgba(244,63,94,0.15)", "--badge-text": "#fb7185",
    },
  },
  sunset: {
    name: "Sunset Orange",
    emoji: "🌅",
    vars: {
      "--p50":  "#fff7ed", "--p100": "#ffedd5", "--p200": "#fed7aa",
      "--p300": "#fdba74", "--p400": "#fb923c", "--p500": "#f97316",
      "--p600": "#ea580c", "--p700": "#c2410c", "--p800": "#9a3412",
      "--p900": "#7c2d12",
      "--glow":  "249,115,22",
      "--grad1": "#f97316", "--grad2": "#c2410c",
      "--badge-bg": "rgba(249,115,22,0.15)", "--badge-text": "#fb923c",
    },
  },
  teal: {
    name: "Midnight Teal",
    emoji: "🦚",
    vars: {
      "--p50":  "#f0fdfa", "--p100": "#ccfbf1", "--p200": "#99f6e4",
      "--p300": "#5eead4", "--p400": "#2dd4bf", "--p500": "#14b8a6",
      "--p600": "#0d9488", "--p700": "#0f766e", "--p800": "#115e59",
      "--p900": "#134e4a",
      "--glow":  "20,184,166",
      "--grad1": "#14b8a6", "--grad2": "#0f766e",
      "--badge-bg": "rgba(20,184,166,0.15)", "--badge-text": "#2dd4bf",
    },
  },
  arctic: {
    name: "Arctic Ice",
    emoji: "🧊",
    vars: {
      "--p50":  "#f0f9ff", "--p100": "#e0f2fe", "--p200": "#bae6fd",
      "--p300": "#7dd3fc", "--p400": "#38bdf8", "--p500": "#0ea5e9",
      "--p600": "#0284c7", "--p700": "#0369a1", "--p800": "#075985",
      "--p900": "#0c4a6e",
      "--glow":  "14,165,233",
      "--grad1": "#0ea5e9", "--grad2": "#0369a1",
      "--badge-bg": "rgba(14,165,233,0.15)", "--badge-text": "#38bdf8",
    },
  },
  crimson: {
    name: "Crimson Red",
    emoji: "🔴",
    vars: {
      "--p50":  "#fef2f2", "--p100": "#fee2e2", "--p200": "#fecaca",
      "--p300": "#fca5a5", "--p400": "#f87171", "--p500": "#ef4444",
      "--p600": "#dc2626", "--p700": "#b91c1c", "--p800": "#991b1b",
      "--p900": "#7f1d1d",
      "--glow":  "239,68,68",
      "--grad1": "#ef4444", "--grad2": "#b91c1c",
      "--badge-bg": "rgba(239,68,68,0.15)", "--badge-text": "#f87171",
    },
  },
  amber: {
    name: "Golden Amber",
    emoji: "✨",
    vars: {
      "--p50":  "#fffbeb", "--p100": "#fef3c7", "--p200": "#fde68a",
      "--p300": "#fcd34d", "--p400": "#fbbf24", "--p500": "#f59e0b",
      "--p600": "#d97706", "--p700": "#b45309", "--p800": "#92400e",
      "--p900": "#78350f",
      "--glow":  "245,158,11",
      "--grad1": "#f59e0b", "--grad2": "#b45309",
      "--badge-bg": "rgba(245,158,11,0.15)", "--badge-text": "#fbbf24",
    },
  },
  lavender: {
    name: "Lavender Mist",
    emoji: "🪻",
    vars: {
      "--p50":  "#f5f3ff", "--p100": "#ede9fe", "--p200": "#ddd6fe",
      "--p300": "#c4b5fd", "--p400": "#a78bfa", "--p500": "#8b5cf6",
      "--p600": "#7c3aed", "--p700": "#6d28d9", "--p800": "#5b21b6",
      "--p900": "#4c1d95",
      "--glow":  "139,92,246",
      "--grad1": "#8b5cf6", "--grad2": "#6d28d9",
      "--badge-bg": "rgba(139,92,246,0.15)", "--badge-text": "#a78bfa",
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("nexora-mode");
    return saved ? saved === "dark" : true;
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem("nexora-theme");
    return saved && THEMES[saved] ? saved : "purple";
  });

  // Apply CSS variables whenever theme or mode changes
  useEffect(() => {
    const root = document.documentElement;

    // Mode classes
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("nexora-mode", isDark ? "dark" : "light");

    // Inject theme CSS variables
    const theme = THEMES[colorTheme];
    if (theme) {
      Object.entries(theme.vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
      // Also set legacy --primary for compatibility
      root.style.setProperty("--primary", theme.vars["--p500"]);
      root.style.setProperty("--primary-dark", theme.vars["--p700"]);
      root.style.setProperty("--primary-light", theme.vars["--p300"]);
      root.style.setProperty("--shadow-primary", `rgba(${theme.vars["--glow"]},0.25)`);
      root.style.setProperty("--scrollbar-thumb", `rgba(${theme.vars["--glow"]},0.5)`);
    }

    localStorage.setItem("nexora-theme", colorTheme);
  }, [isDark, colorTheme]);

  const toggleMode = () => setIsDark(d => !d);

  // Legacy alias
  const toggleTheme = toggleMode;

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleMode,
      toggleTheme,   // legacy
      colorTheme,
      setColorTheme,
      themes: THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};