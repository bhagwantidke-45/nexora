// NotFound.jsx — Animated 404 page with SVG illustration
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Zap } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} flex items-center justify-center px-4`}>
      <div className="max-w-lg w-full text-center animate-page">

        {/* SVG Illustration */}
        <div className="relative mb-8 flex justify-center">
          <svg
            viewBox="0 0 320 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-72 h-52 animate-float"
            style={{ animationDuration: "5s" }}
          >
            {/* Background glow */}
            <ellipse cx="160" cy="190" rx="120" ry="18"
              fill="rgba(var(--glow),0.08)" />

            {/* 4 — left */}
            <path d="M20 140 L20 60 L70 140 L90 140 M70 140 L70 170"
              stroke="rgba(var(--glow),0.7)" strokeWidth="14"
              strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* 0 — center */}
            <rect x="115" y="50" width="90" height="120" rx="45"
              stroke="rgba(var(--glow),0.7)" strokeWidth="14" fill="none"/>
            <ellipse cx="160" cy="110" rx="18" ry="30"
              fill="rgba(var(--glow),0.08)"/>

            {/* 4 — right */}
            <path d="M225 140 L225 60 L275 140 L295 140 M275 140 L275 170"
              stroke="rgba(var(--glow),0.7)" strokeWidth="14"
              strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* Floating stars / sparkles */}
            <circle cx="50"  cy="30" r="3" fill="rgba(var(--glow),0.5)" className="animate-ping-slow" style={{animationDelay:"0s"}}/>
            <circle cx="270" cy="25" r="2" fill="rgba(var(--glow),0.4)" className="animate-ping-slow" style={{animationDelay:"0.4s"}}/>
            <circle cx="300" cy="80" r="3" fill="rgba(var(--glow),0.35)" className="animate-ping-slow" style={{animationDelay:"0.8s"}}/>
            <circle cx="10"  cy="100" r="2" fill="rgba(var(--glow),0.3)" className="animate-ping-slow" style={{animationDelay:"1.2s"}}/>

            {/* Broken link lines */}
            <line x1="140" y1="195" x2="155" y2="195"
              stroke="rgba(var(--glow),0.3)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
            <line x1="165" y1="195" x2="180" y2="195"
              stroke="rgba(var(--glow),0.3)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
          </svg>

          {/* Logo in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, var(--grad1), var(--grad2))` }}
            >
              <Zap size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="animate-slide-up stagger-1">
          <h1 className="font-display font-bold text-4xl text-white mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm mx-auto">
            Looks like this page took a break. It doesn't exist or was moved somewhere else.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 animate-slide-up stagger-2">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 animate-fade-in stagger-3">
          <p className="text-gray-600 text-xs mb-3 uppercase tracking-wider font-medium">
            Quick Links
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Tasks",    path: "/tasks"    },
              { label: "Calendar", path: "/calendar" },
              { label: "Habits",   path: "/habits"   },
              { label: "Goals",    path: "/goals"    },
              { label: "Finance",  path: "/finance"  },
              { label: "AI Chat",  path: "/ai"       },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="glass-card px-3 py-1.5 text-xs text-gray-400 hover:text-white
                           hover:border-opacity-50 transition-all rounded-xl hover-lift"
                style={{ "--hover-border": "rgba(var(--glow),0.3)" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;