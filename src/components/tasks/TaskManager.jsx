import { useState, useEffect } from "react";
import {
  Plus, Search, Filter, LayoutGrid,
  List, Columns, CheckSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import KanbanBoard from "./KanbanBoard";
import Modal from "../shared/Modal";
import { getTasksRealtime, deleteTask, toggleTaskStatus } from "../../firebase/tasks";
import toast from "react-hot-toast";

const VIEWS = ["list", "grid", "kanban"];

const TaskManager = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ priority: "all", status: "all" });
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = getTasksRealtime(user.uid, (data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const filtered = tasks
    .filter((t) => t.title?.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => filter.priority === "all" || t.priority === filter.priority)
    .filter((t) => filter.status === "all" || t.status === filter.status)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success("Task deleted!");
    } catch {
      toast.error("Failed to delete task!");
    }
  };

  const handleToggle = async (taskId, status) => {
    try {
      await toggleTaskStatus(taskId, status);
    } catch {
      toast.error("Failed to update task!");
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTask(null);
  };

  const viewIcons = {
    list: <List size={16} />,
    grid: <LayoutGrid size={16} />,
    kanban: <Columns size={16} />,
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <CheckSquare size={24} className="text-primary-400" />
              Task Manager
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {tasks.length} total · {tasks.filter(t => t.status === "done").length} completed
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>

        {/* Search + Filter + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass pl-10"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="input-glass w-full sm:w-36"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="input-glass w-full sm:w-36"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 glass-card p-1">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === v
                    ? "bg-primary-600/50 text-primary-300"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {viewIcons[v]}
              </button>
            ))}
          </div>
        </div>

        {/* Task Views */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <CheckSquare size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No tasks found!</p>
            <p className="text-gray-500 text-sm mt-1">Create a new task to get started</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto mt-4">
              <Plus size={16} /> Add Task
            </button>
          </div>
        ) : (
          <>
            {/* List View */}
            {view === "list" && (
              <div className="space-y-3 animate-fade-in">
                {filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    view="list"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}

            {/* Grid View */}
            {view === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    view="grid"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
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
        onClose={handleCloseForm}
        title={editTask ? "Edit Task" : "Add New Task"}
        size="md"
      >
        <TaskForm
          editTask={editTask}
          onClose={handleCloseForm}
        />
      </Modal>
    </div>
  );
};

export default TaskManager;