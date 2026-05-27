// Goals.jsx — Confetti on 100%, skeletons, empty state, animated progress, theme-aware
import { useState, useEffect } from "react";
import {
  Target, Plus, Edit2, Trash2, CheckCircle,
  Circle, Flag, Calendar, TrendingUp, Star,
  ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import { useAuth }   from "../../context/AuthContext";
import { useTheme }  from "../../context/ThemeContext";
import Navbar        from "../shared/Navbar";
import Modal         from "../shared/Modal";
import EmptyState    from "../shared/EmptyState";
import { SkeletonGrid } from "../shared/PageTransition";
import { useConfetti }  from "../shared/PageTransition";
import { addGoal, updateGoal, deleteGoal, getGoalsRealtime } from "../../firebase/goals";
import toast from "react-hot-toast";

const CATEGORIES = ["Career","Health","Finance","Education","Personal","Relationships","Travel","Hobby","Other"];
const PRIORITIES  = ["high","medium","low"];
const ICONS = ["🎯","💪","📚","💰","🏃","✈️","🎨","🏠","❤️","🧠","🌟","🚀"];

const PRIORITY_COLOR = {
  high:   "text-red-400 bg-red-500/10 border-red-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  low:    "text-green-400 bg-green-500/10 border-green-500/30",
};

/* ── Goal Card ── */
const GoalCard = ({ goal, onEdit, onDelete, onToggleMilestone, onUpdateProgress, index, fireConfetti }) => {
  const [expanded, setExpanded] = useState(false);
  const completed = goal.milestones?.filter(m => m.done).length || 0;
  const total     = goal.milestones?.length || 0;
  const pct       = goal.progress || 0;
  const daysLeft  = goal.deadline
    ? Math.round((new Date(goal.deadline) - new Date()) / 86400000)
    : null;

  const handleSlider = async (val) => {
    const prev = goal.progress || 0;
    await onUpdateProgress(goal.id, val, goal);
    if (val === 100 && prev < 100) {
      fireConfetti(120);
      toast.success(`🎉 Goal "${goal.title}" completed!`, { duration: 3000 });
    }
  };

  return (
    <div
      className={`glass-card-hover p-5 flex flex-col gap-3 animate-slide-up ${
        pct === 100 ? "border-green-500/30" : ""
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       text-xl shrink-0 animate-float"
            style={{
              background: "rgba(var(--glow),0.15)",
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            {goal.icon || "🎯"}
          </div>
          <div>
            <p className="text-white font-medium">{goal.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[goal.priority] || PRIORITY_COLOR.medium}`}>
              {goal.priority}
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white
                       hover:bg-white/10 transition-all">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400
                       hover:bg-red-500/10 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-gray-400 text-sm line-clamp-2">{goal.description}</p>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400">Progress</span>
          <span className="font-medium" style={{ color: pct === 100 ? "#10b981" : "var(--p400)" }}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? "#10b981"
                : `linear-gradient(90deg, var(--grad1), var(--grad2))`,
              boxShadow: pct > 0 ? `0 0 8px rgba(var(--glow),0.35)` : "none",
            }}
          />
        </div>
        <input type="range" min="0" max="100" value={pct}
          onChange={e => handleSlider(Number(e.target.value))}
          className="w-full mt-2 cursor-pointer accent-purple-500" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        {goal.category && (
          <span className="flex items-center gap-1"><Flag size={11} />{goal.category}</span>
        )}
        {goal.deadline && (
          <span className={`flex items-center gap-1 ${daysLeft !== null && daysLeft < 7 ? "text-red-400" : ""}`}>
            <Calendar size={11} />
            {daysLeft === null ? goal.deadline
              : daysLeft < 0 ? "Overdue!"
              : daysLeft === 0 ? "Due today!"
              : `${daysLeft}d left`}
          </span>
        )}
        {total > 0 && (
          <span className="flex items-center gap-1">
            <CheckCircle size={11} />{completed}/{total} milestones
          </span>
        )}
      </div>

      {/* Milestones */}
      {total > 0 && (
        <div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
            style={{ color: "var(--p400)" }}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Hide" : "Show"} milestones
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5 animate-fade-in">
              {goal.milestones.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5
                             hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => onToggleMilestone(goal, i)}
                >
                  {m.done
                    ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                    : <Circle     size={14} className="text-gray-600 shrink-0" />
                  }
                  <span className={`text-sm ${m.done ? "line-through text-gray-500" : "text-gray-300"}`}>
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════ */
const Goals = () => {
  const { user }     = useAuth();
  const { isDark }   = useTheme();
  const fireConfetti = useConfetti();

  const [goals,     setGoals]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editGoal,  setEditGoal]  = useState(null);
  const [catFilter, setCatFilter] = useState("all");

  const emptyForm = {
    title:"", description:"", category:"Career",
    priority:"medium", deadline:"", icon:"🎯",
    milestones:[], progress:0,
  };
  const [form, setForm]               = useState(emptyForm);
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    if (!user) return;
    return getGoalsRealtime(user.uid, (d) => { setGoals(d); setLoading(false); });
  }, [user]);

  useEffect(() => {
    if (editGoal) {
      setForm({
        title:       editGoal.title,
        description: editGoal.description || "",
        category:    editGoal.category,
        priority:    editGoal.priority,
        deadline:    editGoal.deadline || "",
        icon:        editGoal.icon || "🎯",
        milestones:  editGoal.milestones || [],
        progress:    editGoal.progress || 0,
      });
    } else setForm(emptyForm);
  }, [editGoal]);

  const filtered       = goals.filter(g => catFilter === "all" || g.category === catFilter);
  const completedCount = goals.filter(g => g.progress === 100).length;
  const avgProgress    = goals.length
    ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Goal title required!"); return; }
    try {
      if (editGoal) { await updateGoal(editGoal.id, form); toast.success("Goal updated!"); }
      else          { await addGoal(user.uid, form);        toast.success("Goal created! 🎯"); }
      setShowForm(false); setEditGoal(null);
    } catch { toast.error("Something went wrong!"); }
  };

  const handleDelete = async (id) => {
    try { await deleteGoal(id); toast.success("Goal deleted!"); }
    catch { toast.error("Failed to delete!"); }
  };

  const handleToggleMilestone = async (goal, idx) => {
    const updated = [...(goal.milestones || [])];
    updated[idx]  = { ...updated[idx], done: !updated[idx].done };
    const donePct = Math.round((updated.filter(m => m.done).length / updated.length) * 100);
    await updateGoal(goal.id, { milestones: updated, progress: donePct });
    if (donePct === 100 && (goal.progress || 0) < 100) {
      fireConfetti(100);
      toast.success("🎉 All milestones done!");
    }
  };

  const handleUpdateProgress = async (id, val, goal) => {
    await updateGoal(id, { progress: val });
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setForm(f => ({ ...f, milestones: [...f.milestones, { title: newMilestone.trim(), done: false }] }));
    setNewMilestone("");
  };

  const removeMilestone = (i) =>
    setForm(f => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} pb-24 lg:pb-10`}>
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Target size={24} style={{ color: "var(--p400)" }} /> Goals
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {completedCount}/{goals.length} completed · {avgProgress}% avg
            </p>
          </div>
          <button onClick={() => { setEditGoal(null); setShowForm(true); }} className="btn-primary">
            <Plus size={18} /> New Goal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label:"Total",     value: goals.length,    icon: Target,       g:"from-purple-500 to-primary-600" },
            { label:"Completed", value: completedCount,  icon: CheckCircle,  g:"from-green-500 to-emerald-600"  },
            { label:"Avg",       value: `${avgProgress}%`, icon: TrendingUp, g:"from-blue-500 to-cyan-600"     },
          ].map(({ label, value, icon: Icon, g }, i) => (
            <div
              key={label}
              className="glass-card p-4 animate-slide-up hover-lift"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${g}
                              flex items-center justify-center mb-2 shadow-lg`}>
                <Icon size={16} className="text-white" />
              </div>
              <p className="text-xl font-display font-bold text-white">{value}</p>
              <p className="text-gray-400 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 custom-scrollbar">
          {["all", ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium
                          whitespace-nowrap transition-all ${
                catFilter === c ? "nav-active" : "glass-card text-gray-400 hover:text-white"
              }`}
            >
              {c === "all" ? "All Goals" : c}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              type="goals"
              action={() => { setEditGoal(null); setShowForm(true); }}
              actionLabel="Set First Goal"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                fireConfetti={fireConfetti}
                onEdit={g => { setEditGoal(g); setShowForm(true); }}
                onDelete={handleDelete}
                onToggleMilestone={handleToggleMilestone}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditGoal(null); }}
        title={editGoal ? "Edit Goal" : "New Goal"}
        size="md"
      >
        <form onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">

          {/* Icon */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} type="button"
                  onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${
                    form.icon === ic ? "scale-110" : "glass-card hover:bg-white/10"
                  }`}
                  style={form.icon === ic ? {
                    background: "rgba(var(--glow),0.2)",
                    border: "1px solid rgba(var(--glow),0.4)",
                  } : {}}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
            <input value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Goal title..." className="input-glass" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What do you want to achieve?" rows={2}
              className="input-glass resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category</label>
              <select value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-glass">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Priority</label>
              <select value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="input-glass">
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target Date</label>
            <input type="date" value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="input-glass" />
          </div>

          {/* Milestones */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Milestones</label>
            <div className="flex gap-2 mb-2">
              <input value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addMilestone())}
                placeholder="Add milestone..." className="input-glass" />
              <button type="button" onClick={addMilestone} className="btn-secondary px-3">
                <Plus size={15} />
              </button>
            </div>
            {form.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 mb-1.5">
                <Circle size={12} className="text-gray-600 shrink-0" />
                <span className="text-sm text-gray-300 flex-1">{m.title}</span>
                <button type="button" onClick={() => removeMilestone(i)}
                  className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button"
              onClick={() => { setShowForm(false); setEditGoal(null); }}
              className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editGoal ? "Update" : "Create Goal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;