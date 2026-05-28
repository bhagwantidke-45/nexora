// HabitTracker.jsx — Confetti, skeletons, empty state, staggered animations
import { useState, useEffect } from "react";
import { Plus, Trash2, Target, Flame, Check } from "lucide-react";
import { useAuth }  from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar       from "../shared/Navbar";
import Modal        from "../shared/Modal";
import EmptyState   from "../shared/EmptyState";
import { SkeletonList } from "../shared/PageTransition";
import { useConfetti }  from "../shared/PageTransition";

  import HabitHeatmap from "./HabitHeatmap";
import {
  getHabitsRealtime, addHabit, deleteHabit, toggleHabitToday,
} from "../../firebase/habits";
import toast from "react-hot-toast";

const COLORS = [
  "#a855f7","#3b82f6","#10b981",
  "#f59e0b","#ef4444","#ec4899","#06b6d4",
];
const ICONS = ["💪","📚","🏃","💧","🧘","🎯","✍️","🍎","😴","🧹"];

/* ── Habit Card ── */
const HabitCard = ({ habit, completed, onToggle, onDelete, last7Days, today, index }) => {
  const isCompletedOn = (date) => (habit.completedDates || []).includes(date);

  return (
    <div
      className={`glass-card p-5 transition-all duration-300 hover-lift animate-slide-up ${
        completed ? "border-green-500/20" : ""
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Check Button */}
        <button
          onClick={() => onToggle(habit)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center
                      text-xl transition-all duration-300 shrink-0 ${
            completed
              ? "scale-110"
              : "bg-white/5 border border-white/10 hover:border-white/20 hover:scale-105"
          }`}
          style={completed
            ? { background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }
            : { borderColor: habit.color + "40" }
          }
        >
          {completed
            ? <Check size={20} className="text-green-400" />
            : <span>{habit.icon}</span>
          }
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium ${completed ? "text-gray-400 line-through" : "text-white"}`}>
              {habit.title}
            </p>
            {habit.streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-400
                              bg-orange-500/10 px-2 py-0.5 rounded-full animate-fade-in">
                <Flame size={10} />
                {habit.streak} day streak
              </div>
            )}
          </div>
          {habit.description && (
            <p className="text-gray-500 text-sm truncate">{habit.description}</p>
          )}

          {/* Last 7 days */}
          <div className="flex gap-1.5 mt-3">
            {last7Days.map((date) => {
              const done = isCompletedOn(date);
              const isT  = date === today;
              return (
                <div
                  key={date}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center
                              text-xs transition-all duration-300 ${
                    done
                      ? "text-white scale-105"
                      : isT
                      ? "bg-white/10 text-gray-400 border border-dashed border-white/20"
                      : "bg-white/5 text-gray-600"
                  }`}
                  style={done ? { backgroundColor: habit.color + "60" } : {}}
                  title={date}
                >
                  {done ? "✓" : new Date(date + "T00:00:00").getDate()}
                </div>
              );
            })}
          </div>
          
<HabitHeatmap completedDates={habit.completedDates || []} color={habit.color} />

        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(habit.id)}
          className="p-2 rounded-xl text-gray-600 hover:text-red-400
                     hover:bg-red-500/10 transition-all shrink-0"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════ */
const HabitTracker = () => {
  const { user }   = useAuth();
  const { isDark } = useTheme();
  const fireConfetti = useConfetti();

  const [habits,   setHabits]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [form, setForm] = useState({
    title: "", description: "", icon: "💪",
    color: "#a855f7", frequency: "daily",
  });

  const today = new Date().toISOString().slice(0, 10);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (!user) return;
    const unsub = getHabitsRealtime(user.uid, (data) => {
      setHabits(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Habit title required!"); return; }
    try {
      await addHabit(user.uid, form);
      toast.success("Habit added! 🎯");
      setShowForm(false);
      setForm({ title:"", description:"", icon:"💪", color:"#a855f7", frequency:"daily" });
    } catch { toast.error("Failed to add habit!"); }
  };

  const handleToggle = async (habit) => {
    const wasCompleted = (habit.completedDates || []).includes(today);
    try {
      await toggleHabitToday(habit.id, habit.completedDates || [], habit.streak || 0);
      // Fire confetti if just completed (not un-completed)
      if (!wasCompleted) {
        fireConfetti(80);
        toast.success(`${habit.icon} Great job! Habit completed!`, { duration: 2000 });
      }
    } catch { toast.error("Failed to update habit!"); }
  };

  const handleDelete = async (id) => {
    try { await deleteHabit(id); toast.success("Habit deleted!"); }
    catch { toast.error("Failed to delete habit!"); }
  };

  const isCompletedToday  = (habit) => (habit.completedDates || []).includes(today);
  const completedCount    = habits.filter(isCompletedToday).length;
  const progressPct       = habits.length > 0
    ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} pb-24 lg:pb-10`}>
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Target size={24} style={{ color: "var(--p400)" }} />
              Habit Tracker
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {completedCount}/{habits.length} habits completed today
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={18} /> Add Habit
          </button>
        </div>

        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="glass-card p-5 mb-6 animate-slide-up hover-lift">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-white">Today's Progress</h3>
              <span className="font-bold animate-count-up" style={{ color: "var(--p400)" }}>
                {progressPct}%
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, var(--grad1), var(--grad2))`,
                  boxShadow: progressPct > 0 ? `0 0 12px rgba(var(--glow),0.4)` : "none",
                }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {completedCount} of {habits.length} habits done
              {progressPct === 100 && " 🎉 All done!"}
            </p>
          </div>
        )}

        {/* Habits list */}
        {loading ? (
          <SkeletonList count={4} />
        ) : habits.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              type="habits"
              action={() => setShowForm(true)}
              actionLabel="Add First Habit"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={isCompletedToday(habit)}
                onToggle={handleToggle}
                onDelete={handleDelete}
                last7Days={last7Days}
                today={today}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title="Add New Habit" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Title *</label>
            <input value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Read 30 minutes"
              className="input-glass" required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
            <input value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              className="input-glass" />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${
                    form.icon === icon
                      ? "scale-110"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  style={form.icon === icon ? {
                    background: "rgba(var(--glow),0.2)",
                    border: "1px solid rgba(var(--glow),0.4)",
                  } : {}}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.color === c
                      ? "scale-125 ring-2 ring-white/50"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              Add Habit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HabitTracker;