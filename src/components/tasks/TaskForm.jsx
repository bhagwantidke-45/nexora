import { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { addTask, updateTask } from "../../firebase/tasks";
import toast from "react-hot-toast";

const TaskForm = ({ editTask, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    tags: [],
    subtasks: [],
    timeTracked: 0,
    recurring: "none",
  });

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || "",
        description: editTask.description || "",
        priority: editTask.priority || "medium",
        status: editTask.status || "todo",
        dueDate: editTask.dueDate || "",
        tags: editTask.tags || [],
        subtasks: editTask.subtasks || [],
        timeTracked: editTask.timeTracked || 0,
        recurring: editTask.recurring || "none",
      });
    }
  }, [editTask]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const addSubtask = () => {
    setForm({
      ...form,
      subtasks: [...form.subtasks, { title: "", done: false }],
    });
  };

  const updateSubtask = (index, value) => {
    const updated = [...form.subtasks];
    updated[index].title = value;
    setForm({ ...form, subtasks: updated });
  };

  const removeSubtask = (index) => {
    setForm({
      ...form,
      subtasks: form.subtasks.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Task title is required!");
      return;
    }
    setLoading(true);
    try {
      if (editTask) {
        await updateTask(editTask.id, form);
        toast.success("Task updated!");
      } else {
        await addTask(user.uid, form);
        toast.success("Task created!");
      }
      onClose();
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title..."
          className="input-glass"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Task description..."
          rows={3}
          className="input-glass resize-none"
        />
      </div>

      {/* Priority + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="input-glass"
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input-glass"
          >
            <option value="todo">📋 To Do</option>
            <option value="inprogress">⚡ In Progress</option>
            <option value="done">✅ Done</option>
          </select>
        </div>
      </div>

      {/* Due Date + Recurring */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="input-glass"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Recurring</label>
          <select
            name="recurring"
            value={form.recurring}
            onChange={handleChange}
            className="input-glass"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="input-glass"
          />
          <button
            type="button"
            onClick={addTag}
            className="btn-secondary px-3"
          >
            <Plus size={16} />
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs bg-primary-500/10 text-primary-400 px-2 py-1 rounded-full border border-primary-500/20"
              >
                <Tag size={10} />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtasks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-400">Subtasks</label>
          <button
            type="button"
            onClick={addSubtask}
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            <Plus size={12} /> Add Subtask
          </button>
        </div>
        <div className="space-y-2">
          {form.subtasks.map((subtask, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={subtask.title}
                onChange={(e) => updateSubtask(index, e.target.value)}
                placeholder={`Subtask ${index + 1}...`}
                className="input-glass text-sm"
              />
              <button
                type="button"
                onClick={() => removeSubtask(index)}
                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex-1 justify-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 justify-center"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : editTask ? (
            "Update Task"
          ) : (
            "Create Task"
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;