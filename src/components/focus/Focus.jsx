import { useState, useEffect, useRef, useCallback } from "react";
import {
  Timer, Play, Pause, RotateCcw, Brain,
  Volume2, VolumeX, Settings, Zap, CheckCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";

const MODES = {
  pomodoro: { label: "Focus",       duration: 25 * 60, color: "#a855f7", bg: "from-purple-500 to-violet-600" },
  short:    { label: "Short Break", duration: 5  * 60, color: "#10b981", bg: "from-emerald-500 to-green-600" },
  long:     { label: "Long Break",  duration: 15 * 60, color: "#3b82f6", bg: "from-blue-500 to-cyan-600"    },
  deep:     { label: "Deep Work",   duration: 90 * 60, color: "#f59e0b", bg: "from-amber-500 to-orange-600" },
};

const SOUNDS = [
  { id: "none",   label: "None",        emoji: "🔇" },
  { id: "rain",   label: "Rain",        emoji: "🌧️" },
  { id: "forest", label: "Forest",      emoji: "🌲" },
  { id: "cafe",   label: "Café",        emoji: "☕" },
  { id: "waves",  label: "Ocean Waves", emoji: "🌊" },
];

/* ── Circular progress ring ── */
const Ring = ({ pct, color, size = 260, stroke = 14 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }} />
    </svg>
  );
};

/* ── Safe browser notification ── */
const showNotification = (title, body) => {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(title, { body });
      });
    }
  } catch (_) {
    // Notifications not supported — silently ignore
  }
};

/* ══════════════════════════════════════════════════════════════════════════════ */
const Focus = () => {
  const { isDark } = useTheme();
  const [mode, setMode]         = useState("pomodoro");
  const [seconds, setSeconds]   = useState(MODES.pomodoro.duration);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocus, setTotalFocus]   = useState(0);
  const [sound, setSound]       = useState("none");
  const [muted, setMuted]       = useState(false);
  const [customMin, setCustomMin]     = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [completedSessions, setCompletedSessions] = useState([]);
  const intervalRef = useRef(null);

  const cfg   = MODES[mode] || MODES.pomodoro;
  const total = mode === "custom" ? customMin * 60 : cfg.duration;
  const pct   = Math.round(((total - seconds) / total) * 100);

  const fmt = (s) => {
    const m  = Math.floor(s / 60);
    const sc = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sc).padStart(2, "0")}`;
  };

  const reset = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSeconds(mode === "custom" ? customMin * 60 : (MODES[mode]?.duration ?? 25 * 60));
  }, [mode, customMin]);

  useEffect(() => { reset(); }, [mode]);

  /* Page title */
  useEffect(() => {
    document.title = running ? `${fmt(seconds)} · Nexora Focus` : "Nexora";
    return () => { document.title = "Nexora"; };
  }, [seconds, running]);

  /* Countdown */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "pomodoro" || mode === "deep") {
              setSessions((n) => n + 1);
              setTotalFocus((t) => t + total);
              setCompletedSessions((cs) => [
                ...cs,
                { mode, duration: total, time: new Date().toLocaleTimeString() },
              ]);
              showNotification("🎯 Session complete!", "Great work! Take a break.");
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, total]);

  const toggle = () => {
    if (seconds === 0) { reset(); return; }
    setRunning((r) => !r);
  };

  const focusHours = Math.floor(totalFocus / 3600);
  const focusMins  = Math.floor((totalFocus % 3600) / 60);

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Timer size={24} className="text-primary-400" /> Focus Timer
            </h1>
            <p className="text-gray-400 text-sm mt-1">Stay in flow. Get things done.</p>
          </div>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className={`p-2.5 rounded-xl transition-all ${showSettings ? "nav-active" : "glass-card text-gray-400 hover:text-white"}`}
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Timer ── */}
          <div className="lg:col-span-2 glass-card p-8 flex flex-col items-center animate-scale-in">

            {/* Mode tabs */}
            <div className="flex gap-2 mb-8 flex-wrap justify-center">
              {Object.entries(MODES).map(([k, v]) => (
                <button key={k} onClick={() => setMode(k)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    mode === k
                      ? "text-white shadow-lg"
                      : "glass-card text-gray-400 hover:text-white"
                  }`}
                  style={mode === k ? {
                    background: `linear-gradient(135deg, ${v.color}99, ${v.color}66)`,
                    border: `1px solid ${v.color}44`,
                  } : {}}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Ring */}
            <div className="relative mb-6 animate-float" style={{ animationDuration: "4s" }}>
              <Ring pct={pct} color={cfg.color} />
              {/* Glow overlay */}
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: running ? `0 0 60px ${cfg.color}44` : "none",
                  transition: "box-shadow 0.5s ease",
                  borderRadius: "50%",
                }} />
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-5xl text-white tracking-tight">
                  {fmt(seconds)}
                </span>
                <span className="text-gray-400 text-sm mt-1">{cfg.label}</span>
                {running && (
                  <span className="flex items-center gap-1 text-xs mt-2 animate-pulse-slow"
                    style={{ color: cfg.color }}>
                    <Zap size={10} /> In flow
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button onClick={reset}
                className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110">
                <RotateCcw size={18} />
              </button>
              <button onClick={toggle}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}99)`,
                  boxShadow: `0 8px 30px ${cfg.color}44`,
                }}>
                {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              <button onClick={() => setMuted((m) => !m)}
                className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Sound selector */}
            <div className="flex gap-2 mt-6 flex-wrap justify-center">
              {SOUNDS.map((s) => (
                <button key={s.id} onClick={() => setSound(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    sound === s.id ? "nav-active" : "glass-card text-gray-400 hover:text-white"
                  }`}>
                  <span>{s.emoji}</span>{s.label}
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full mt-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Session progress</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                  }} />
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="space-y-4">

            {/* Today Stats */}
            <div className="glass-card p-5 animate-slide-up stagger-1">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Brain size={16} className="text-primary-400" /> Today's Focus
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Sessions",   value: sessions,                  color: "text-primary-400" },
                  { label: "Focus Time", value: `${focusHours}h ${focusMins}m`, color: "text-green-400"  },
                  { label: "Deep Work",  value: `${completedSessions.filter((s) => s.mode === "deep").length}x`, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <span className={`font-bold font-display ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pomodoro set tracker */}
            <div className="glass-card p-5 animate-slide-up stagger-2">
              <h3 className="font-display font-semibold text-white mb-3 text-sm">Pomodoro Set</h3>
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}
                    className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                      i < sessions % 4 ? "bg-primary-500" : "bg-white/10"
                    }`} />
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {sessions % 4}/4 — {sessions > 0 && sessions % 4 === 0 ? "Take a long break! ☕" : "Keep going!"}
              </p>
            </div>

            {/* Custom timer settings */}
            {showSettings && (
              <div className="glass-card p-5 animate-scale-in">
                <h3 className="font-display font-semibold text-white mb-3 text-sm flex items-center gap-2">
                  <Settings size={14} /> Custom Timer
                </h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Duration (minutes)</label>
                  <input
                    type="number" min="1" max="180"
                    value={customMin}
                    onChange={(e) => setCustomMin(Number(e.target.value))}
                    className="input-glass mb-3"
                  />
                  <button
                    onClick={() => {
                      setMode("custom");
                      setSeconds(customMin * 60);
                      setShowSettings(false);
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    Apply Custom Timer
                  </button>
                </div>
              </div>
            )}

            {/* Completed sessions */}
            {completedSessions.length > 0 && (
              <div className="glass-card p-5 animate-slide-up">
                <h3 className="font-display font-semibold text-white mb-3 text-sm flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-400" /> Completed
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {[...completedSessions].reverse().slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 animate-fade-in">
                      <span className="text-gray-300 text-xs capitalize">
                        {s.mode} · {Math.round(s.duration / 60)}min
                      </span>
                      <span className="text-gray-600 text-xs">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Focus;