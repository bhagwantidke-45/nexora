import { useState } from "react";
import {
  CheckSquare, Target, Calendar, DollarSign,
  ArrowRight, ArrowLeft, Sparkles, Flame, BookOpen
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Nexora 👋",
    subtitle: "Your all-in-one personal productivity hub. Let's get you set up in 2 minutes.",
    illustration: "welcome",
  },
  {
    id: "goals",
    title: "What do you want to achieve?",
    subtitle: "Select everything that applies — we'll personalise your dashboard.",
    illustration: "goals",
  },
  {
    id: "features",
    title: "Which tools will you use most?",
    subtitle: "We'll highlight these on your home screen.",
    illustration: "features",
  },
  {
    id: "theme",
    title: "Pick your vibe",
    subtitle: "You can always change this later in Settings.",
    illustration: "theme",
  },
  {
    id: "done",
    title: "You're all set! 🎉",
    subtitle: "Everything is ready. Let's start building great habits.",
    illustration: "done",
  },
];

const GOAL_OPTIONS = [
  { id: "productivity",  label: "Boost productivity",  icon: "⚡" },
  { id: "habits",        label: "Build better habits",  icon: "🔥" },
  { id: "finance",       label: "Manage finances",      icon: "💰" },
  { id: "health",        label: "Health & fitness",     icon: "💪" },
  { id: "learning",      label: "Learn new skills",     icon: "📚" },
  { id: "mindfulness",   label: "Mindfulness & focus",  icon: "🧘" },
  { id: "career",        label: "Career growth",        icon: "🚀" },
  { id: "creativity",    label: "Creative projects",    icon: "🎨" },
];

const FEATURE_OPTIONS = [
  { id: "tasks",    label: "Task Manager",  icon: CheckSquare,  path: "/tasks"    },
  { id: "habits",   label: "Habit Tracker", icon: Flame,        path: "/habits"   },
  { id: "calendar", label: "Calendar",      icon: Calendar,     path: "/calendar" },
  { id: "finance",  label: "Finance",       icon: DollarSign,   path: "/finance"  },
  { id: "goals",    label: "Goals",         icon: Target,       path: "/goals"    },
  { id: "records",  label: "Records",       icon: BookOpen,     path: "/records"  },
  { id: "ai",       label: "AI Assistant",  icon: Sparkles,     path: "/ai"       },
];

const THEME_OPTIONS = [
  { id: "purple",  name: "Purple Dreams", emoji: "💜", grad: "from-purple-500 to-violet-600" },
  { id: "ocean",   name: "Ocean Blue",    emoji: "🌊", grad: "from-blue-500 to-cyan-600"    },
  { id: "emerald", name: "Emerald",       emoji: "💚", grad: "from-green-500 to-emerald-600" },
  { id: "rose",    name: "Rose Gold",     emoji: "🌸", grad: "from-pink-500 to-rose-600"    },
  { id: "sunset",  name: "Sunset",        emoji: "🌅", grad: "from-orange-500 to-amber-600" },
  { id: "teal",    name: "Teal",          emoji: "🦚", grad: "from-teal-500 to-cyan-600"    },
];

const Onboarding = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedGoals,    setSelectedGoals]    = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedTheme,    setSelectedTheme]    = useState("purple");
  const [saving, setSaving] = useState(false);

  const toggleGoal    = (id) => setSelectedGoals(    (g) => g.includes(id) ? g.filter((x) => x !== id) : [...g, id]);
  const toggleFeature = (id) => setSelectedFeatures( (f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "userProfiles", user.uid),
        {
          onboardingComplete: true,
          goals:    selectedGoals,
          features: selectedFeatures,
          theme:    selectedTheme,
          completedAt: serverTimestamp(),
        },
        { merge: true }
      );
      onComplete({ theme: selectedTheme });
    } catch (err) {
      console.error("Onboarding save failed:", err);
      onComplete({ theme: selectedTheme });
    } finally {
      setSaving(false);
    }
  };

  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-mesh">
      {/* Glow bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg glass-card p-8 animate-scale-in">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
            style={{ background: "linear-gradient(135deg,#12052a,#1e0a3c)" }}
          >
            <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
              <defs>
                <linearGradient id="lfl-onboard" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="40%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                d="M256 72C256 72 324 118 320 168C346 144 338 104 338 104C338 104 380 148 372 200C364 244 344 272 308 292C292 301 274 306 256 308C238 306 220 301 204 292C168 272 148 244 140 200C132 148 174 104 174 104C174 104 166 144 192 168C188 118 256 72 256 72Z"
                fill="url(#lfl-onboard)"
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
          <span className="font-display font-bold text-lg text-gradient">Nexora</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicator */}
        <p className="text-gray-500 text-xs mb-2">Step {step + 1} of {STEPS.length}</p>

        {/* Title */}
        <h1 className="font-display font-bold text-2xl text-white mb-2 animate-fade-in">
          {STEPS[step].title}
        </h1>
        <p className="text-gray-400 text-sm mb-6 animate-fade-in">{STEPS[step].subtitle}</p>

        {/* Step content */}
        <div className="min-h-[220px] flex flex-col justify-center animate-fade-in">

          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "✅", label: "Tasks & Goals" },
                { icon: "🔥", label: "Habit Streaks" },
                { icon: "📅", label: "Smart Calendar" },
                { icon: "💰", label: "Finance Tracker" },
                { icon: "🎯", label: "Focus Timer" },
                { icon: "🤖", label: "AI Assistant" },
              ].map((f) => (
                <div key={f.label} className="glass-card p-3 text-center">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <p className="text-gray-400 text-xs">{f.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* STEP 1: Goals */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm transition-all text-left ${
                    selectedGoals.includes(g.id)
                      ? "bg-primary-600/30 text-primary-300 border border-primary-500/40"
                      : "glass-card text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-base">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Features */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-2">
              {FEATURE_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleFeature(id)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm transition-all text-left ${
                    selectedFeatures.includes(id)
                      ? "bg-primary-600/30 text-primary-300 border border-primary-500/40"
                      : "glass-card text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* STEP 3: Theme */}
          {step === 3 && (
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                    selectedTheme === t.id
                      ? "border-2 scale-105"
                      : "glass-card hover:scale-105"
                  }`}
                  style={selectedTheme === t.id ? {
                    borderColor: "var(--p500)",
                    boxShadow: "0 0 20px rgba(var(--glow),0.3)",
                  } : {}}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.grad}`} />
                  <span className="text-xs text-gray-300">{t.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="text-6xl mb-4 animate-float">🚀</div>
              <div className="space-y-2">
                {selectedGoals.slice(0, 3).map((g) => {
                  const opt = GOAL_OPTIONS.find((o) => o.id === g);
                  return opt ? (
                    <div key={g} className="flex items-center gap-2 justify-center text-sm text-gray-400">
                      <span>{opt.icon}</span> {opt.label}
                    </div>
                  ) : null;
                })}
                {selectedGoals.length > 3 && (
                  <p className="text-gray-500 text-xs">+{selectedGoals.length - 3} more goals</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary"
              disabled={saving}
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) handleFinish();
              else setStep((s) => s + 1);
            }}
            className="btn-primary flex-1 justify-center"
            disabled={saving}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLast ? (
              <>
                <svg width="16" height="16" viewBox="0 0 512 512" fill="none" className="shrink-0">
                  <defs>
                    <linearGradient id="lfl-btn" x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <path d="M256 72C256 72 324 118 320 168C346 144 338 104 338 104C338 104 380 148 372 200C364 244 344 272 308 292C292 301 274 306 256 308C238 306 220 301 204 292C168 272 148 244 140 200C132 148 174 104 174 104C174 104 166 144 192 168C188 118 256 72 256 72Z" fill="url(#lfl-btn)"/>
                </svg>
                Start using Nexora
              </>
            ) : (
              <>
                {step === 0 ? "Get Started" : "Continue"} <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={handleFinish}
            className="w-full text-center text-gray-600 hover:text-gray-400 text-xs mt-3 transition-colors"
          >
            Skip setup
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;