// TaskManager.jsx — Skeleton, empty state, staggered cards, animated filters, theme-aware
import { useState, useEffect } from "react";
import {
  Plus, Search, Filter, LayoutGrid,
  List, Columns, CheckSquare,
} from "lucide-react";
import { useAuth }   from "../../context/AuthContext";
import { useTheme }  from "../../context/ThemeContext";
import Navbar        from "../shared/Navbar";
import TaskCard      from "./TaskCard";
import TaskForm      from "./TaskForm";
import KanbanBoard   from "./KanbanBoard";
import Modal         from "../shared/Modal";
import EmptyState    from "../shared/EmptyState";
import { SkeletonList } from "../shared/PageTransition";
import { getTasksRealtime, deleteTask, toggleTaskStatus } from "../../firebase/tasks";
import toast from "react-hot-toast";

const VIEWS = ["list", "grid", "kanban"];

const TaskManager = () => {
  const { user }   = useAuth();
  const { isDark } = useTheme();

  const [tasks,    setTasks]    = useState([]);
  const [view,     setView]     = useState("list");
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState({ priority: "all", status: "all" });
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = getTasksRealtime(user.uid, (data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const filtered = tasks
    .filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filter.priority === "all" || t.priority === filter.priority)
    .filter(t => filter.status   === "all" || t.status   === filter.status)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.priority] || 1) - (order[b.priority] || 1);
    });

  const handleDelete = async (id) => {
    try { await deleteTask(id); toast.success("Task deleted!"); }
    catch { toast.error("Failed to delete task!"); }
  };

  const handleToggle = async (id, status) => {
    try { await toggleTaskStatus(id, status); }
    catch { toast.error("Failed to update task!"); }
  };

  const handleEdit = (task) => { setEditTask(task); setShowForm(true); };
  const handleClose = () => { setShowForm(false); setEditTask(null); };

  const completedCount = tasks.filter(t => t.status === "done").length;

  const viewIcons = {
    list:   <List      size={16} />,
    grid:   <LayoutGrid size={16} />,
    kanban: <Columns   size={16} />,
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} pb-24 lg:pb-10`}>
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <CheckSquare size={24} style={{ color: "var(--p400)" }} />
              Task Manager
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {tasks.length} total · {completedCount} completed
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={18} /> Add Task
          </button>
        </div>

        {/* Quick stats bar */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5 animate-slide-up">
            {[
              { label:"To Do",      value: tasks.filter(t=>t.status==="todo").length,       color:"text-gray-400",   bg:"bg-gray-500/10"   },
              { label:"In Progress",value: tasks.filter(t=>t.status==="inprogress").length, color:"text-yellow-400", bg:"bg-yellow-500/10" },
              { label:"Done",       value: completedCount,                                  color:"text-green-400",  bg:"bg-green-500/10"  },
            ].map(({ label, value, color, bg }, i) => (
              <div
                key={label}
                className={`glass-card p-3 text-center hover-lift animate-slide-up`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <p className={`text-2xl font-display font-bold ${color} animate-count-up`}>{value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filters + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up stagger-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-glass pl-10"
            />
          </div>

          {/* Priority filter */}
          <select
            value={filter.priority}
            onChange={e => setFilter({ ...filter, priority: e.target.value })}
            className="input-glass w-full sm:w-36"
          >
            <option value="all">All Priority</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Status filter */}
          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="input-glass w-full sm:w-36"
          >
            <option value="all">All Status</option>
            <option value="todo">📋 To Do</option>
            <option value="inprogress">⚡ In Progress</option>
            <option value="done">✅ Done</option>
          </select>

          {/* View toggle */}
          <div className="flex gap-1 glass-card p-1">
            {VIEWS.map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === v ? "text-white" : "text-gray-400 hover:text-white"
                }`}
                style={view === v ? {
                  background: "rgba(var(--glow),0.2)",
                  boxShadow:  "0 0 8px rgba(var(--glow),0.2)",
                } : {}}
              >
                {viewIcons[v]}
              </button>
            ))}
          </div>
        </div>

        {/* Task Views */}
        {loading ? (
          <SkeletonList count={5} />
        ) : filtered.length === 0 ? (
          <div className={tasks.length === 0 ? "glass-card" : ""}>
            <EmptyState
              type="tasks"
              title={tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
              description={
                tasks.length === 0
                  ? "Create your first task and start getting things done."
                  : "Try adjusting your search or filter."
              }
              action={tasks.length === 0 ? () => setShowForm(true) : undefined}
              actionLabel="Add Task"
            />
          </div>
        ) : (
          <>
            {/* List View */}
            {view === "list" && (
              <div className="space-y-3">
                {filtered.map((task, i) => (
                  <div
                    key={task.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <TaskCard
                      task={task} view="list"
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {view === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((task, i) => (
                  <div
                    key={task.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <TaskCard
                      task={task} view="grid"
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Kanban View */}
            {view === "kanban" && (
              <KanbanBoard
                tasks={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            )}
          </>
        )}
      </div>

      {/* Task Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={editTask ? "Edit Task" : "Add New Task"}
        size="md"
      >
        <TaskForm editTask={editTask} onClose={handleClose} />
      </Modal>
    </div>
  );
};

export default TaskManager;