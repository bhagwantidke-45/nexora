import { useState, useRef, useEffect } from "react";
import { Plus, X, CheckSquare, Target, Calendar, DollarSign, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { addTask } from "../../firebase/tasks";
import { addHabit } from "../../firebase/habits";
import { addEvent } from "../../firebase/calendar";
import { addTransaction } from "../../firebase/finance";
import { addRecord } from "../../firebase/records";
import toast from "react-hot-toast";

/**
 * QuickAdd — a floating action button that expands into a quick-entry form.
 * Lets users add tasks, habits, events, transactions, or notes from any page.
 *
 * Place once in App.jsx, inside ProtectedRoute scope.
 */

const TYPES = [
  { id: "task",        label: "Task",        icon: CheckSquare, color: "from-purple-500 to-violet-600" },
  { id: "habit",       label: "Habit",       icon: Target,      color: "from-orange-500 to-amber-600"  },
  { id: "event",       label: "Event",       icon: Calendar,    color: "from-blue-500 to-cyan-600"     },
  { id: "transaction", label: "Transaction", icon: DollarSign,  color: "from-green-500 to-emerald-600" },
  { id: "note",        label: "Note",        icon: FileText,    color: "from-pink-500 to-rose-600"     },
];

const QuickAdd = () => {
  const { user } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [type,    setType]    = useState("task");
  const [title,   setTitle]   = useState("");
  const [extra,   setExtra]   = useState(""); // date / amount / content
  const [loading, setLoading] = useState(false);
  const inputRef  = useRef(null);
  const panelRef  = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open, type]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keyboard shortcut: Alt+N
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === "n") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const reset = () => {
    setTitle("");
    setExtra("");
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().slice(0, 10);

      switch (type) {
        case "task":
          await addTask(user.uid, { title: title.trim(), priority: "medium", status: "todo", dueDate: extra || today, tags: [], subtasks: [], recurring: "none" });
          break;
        case "habit":
          await addHabit(user.uid, { title: title.trim(), description: "", icon: "🎯", color: "#a855f7", frequency: "daily" });
          break;
        case "event":
          await addEvent(user.uid, { title: title.trim(), date: extra || today, time: "", endTime: "", color: "#a855f7", category: "general", description: "", allDay: !extra });
          break;
        case "transaction":
          if (!extra || isNaN(Number(extra))) { toast.error("Enter a valid amount"); setLoading(false); return; }
          await addTransaction(user.uid, { type: "expense", amount: Number(extra), category: "Other", description: title.trim(), date: today });
          break;
        case "note":
          await addRecord(user.uid, { type: "note", title: title.trim(), content: extra, pinned: false });
          break;
        default:
          break;
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added! ✨`);
      reset();
      // Keep panel open for rapid entry; user can close manually
      inputRef.current?.focus();
    } catch (err) {
      console.error("QuickAdd error:", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const cfg = TYPES.find((t) => t.id === type);

  const extraLabel = {
    task:        "Due date (optional)",
    habit:       "",
    event:       "Event date",
    transaction: "Amount (₹)",
    note:        "Content (optional)",
  }[type];

  const extraType = {
    task:        "date",
    event:       "date",
    transaction: "number",
    note:        "text",
  }[type];

  return (
    <div ref={panelRef} className="fixed bottom-24 right-5 lg:bottom-8 z-50">
      {/* Expanded panel */}
      {open && (
        <div className="mb-3 w-72 glass-card p-4 shadow-2xl shadow-black/50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white text-sm">Quick add</h3>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Type selector */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setType(id); reset(); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                  type === id
                    ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                    : "glass-card text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "task"        ? "Task title..." :
                type === "habit"       ? "Habit name..." :
                type === "event"       ? "Event title..." :
                type === "transaction" ? "Description..." :
                "Note title..."
              }
              className="input-glass text-sm py-2"
              required
            />

            {type !== "habit" && extraLabel && (
              <input
                type={extraType || "text"}
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder={extraLabel}
                className="input-glass text-sm py-2"
                min={type === "transaction" ? 0 : undefined}
                required={type === "transaction"}
              />
            )}

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary w-full justify-center py-2 text-sm"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : `Add ${cfg?.label}`
              }
            </button>
          </form>

          <p className="text-gray-600 text-[10px] text-center mt-2">Alt+N to open · Esc to close</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close quick add" : "Quick add (Alt+N)"}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-primary hover:shadow-primary-lg transition-all duration-300 ${
          open ? "rotate-45 scale-95" : "hover:scale-110 animate-float"
        }`}
        style={{
          background: open ? "rgba(239,68,68,0.2)" : `linear-gradient(135deg, var(--grad1), var(--grad2))`,
          border: open ? "1px solid rgba(239,68,68,0.3)" : "none",
          animationDelay: "0.5s",
        }}
      >
        <Plus size={24} className={`transition-all duration-300 ${open ? "text-red-400" : "text-white"}`} />
      </button>
    </div>
  );
};

export default QuickAdd;