import { useState, useEffect } from "react";
import { Plus, Trash2, Target, Flame, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";
import Modal from "../shared/Modal";
import {
  getHabitsRealtime,
  addHabit,
  deleteHabit,
  toggleHabitToday,
} from "../../firebase/habits";
import toast from "react-hot-toast";

const COLORS = [
  "#a855f7", "#3b82f6", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"
];

const ICONS = ["💪", "📚", "🏃", "💧", "🧘", "🎯", "✍️", "🍎", "😴", "🧹"];

const HabitTracker = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "💪",
    color: "#a855f7",
    frequency: "daily",
  });

  const today = new Date().toISOString().slice(0, 10);

  // Last 7 days
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
      toast.success("Habit added!");
      setShowForm(false);
      setForm({ title: "", description: "", icon: "💪", color: "#a855f7", frequency: "daily" });
    } catch {
      toast.error("Failed to add habit!");
    }
  };

  const handleToggle = async (habit) => {
    try {
      await toggleHabitToday(habit.id, habit.completedDates || [], habit.streak || 0);
    } catch {
      toast.error("Failed to update habit!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      toast.success("Habit deleted!");
    } catch {
      toast.error("Failed to delete habit!");
    }
  };

  const isCompletedToday = (habit) =>
    (habit.completedDates || []).includes(today);

  const isCompletedOn = (habit, date) =>
    (habit.completedDates || []).includes(date);

  const completedTodayCount = habits.filter(isCompletedToday).length;

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Target size={24} className="text-primary-400" />
              Habit Tracker
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {completedTodayCount}/{habits.length} habits completed today
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={18} /> Add Habit
          </button>
        </div>

        {/* Today's Progress Bar */}
        <div className="glass-card p-5 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white">Today's Progress</h3>
            <span className="text-primary-400 font-bold">
              {habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full transition-all duration-700"
              style={{
                width: `${habits.length > 0 ? (completedTodayCount / habits.length) * 100 : 0}%`
              }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {completedTodayCount} of {habits.length} habits done
          </p>
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <Target size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No habits yet!</p>
            <p className="text-gray-500 text-sm mt-1">Start building good habits today</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto mt-4">
              <Plus size={16} /> Add Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {habits.map((habit) => {
              const completed = isCompletedToday(habit);
              return (
                <div
                  key={habit.id}
                  className={`glass-card p-5 transition-all duration-300 ${
                    completed ? "border-green-500/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Check Button */}
                    <button
                      onClick={() => handleToggle(habit)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 shrink-0 ${
                        completed
                          ? "bg-green-500/20 border border-green-500/30 scale-110"
                          : "bg-white/5 border border-white/10 hover:border-white/20"
                      }`}
                      style={completed ? {} : { borderColor: habit.color + "40" }}
                    >
                      {completed ? (
                        <Check size={20} className="text-green-400" />
                      ) : (
                        <span>{habit.icon}</span>
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${completed ? "text-gray-400 line-through" : "text-white"}`}>
                          {habit.title}
                        </p>
                        {/* Streak */}
                        {habit.streak > 0 && (
                          <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                            <Flame size={10} />
                            {habit.streak} day streak
                          </div>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-gray-500 text-sm truncate">{habit.description}</p>
                      )}

                      {/* Last 7 Days */}
                      <div className="flex gap-1.5 mt-3">
                        {last7Days.map((date) => {
                          const done = isCompletedOn(habit, date);
                          const isT = date === today;
                          return (
                            <div
                              key={date}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                                done
                                  ? "text-white"
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
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Habit" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Read 30 minutes"
              className="input-glass"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              className="input-glass"
            />
          </div>
          {/* Icon Picker */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${
                    form.icon === icon
                      ? "bg-primary-500/30 border border-primary-500/50 scale-110"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
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
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.color === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Add Habit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HabitTracker;