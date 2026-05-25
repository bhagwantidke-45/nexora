import { useState } from "react";
import {
  Edit2, Trash2, Clock, Tag,
  CheckCircle, Circle, AlertCircle, Timer
} from "lucide-react";
import { format } from "date-fns";

const priorityConfig = {
  high: { label: "High", class: "badge-high", dot: "bg-red-400" },
  medium: { label: "Medium", class: "badge-medium", dot: "bg-yellow-400" },
  low: { label: "Low", class: "badge-low", dot: "bg-green-400" },
};

const statusConfig = {
  todo: { label: "To Do", icon: Circle, color: "text-gray-400" },
  inprogress: { label: "In Progress", icon: AlertCircle, color: "text-yellow-400" },
  done: { label: "Done", icon: CheckCircle, color: "text-green-400" },
};

const TaskCard = ({ task, view, onEdit, onDelete, onToggle }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.todo;
  const StatusIcon = status.icon;

  const isOverdue =
    task.dueDate &&
    task.dueDate < new Date().toISOString().slice(0, 10) &&
    task.status !== "done";

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return format(new Date(date + "T00:00:00"), "MMM d, yyyy");
    } catch {
      return date;
    }
  };

  if (view === "list") {
    return (
      <div className={`glass-card-hover p-4 flex items-center gap-4 animate-fade-in ${
        task.status === "done" ? "opacity-60" : ""
      } ${isOverdue ? "border-red-500/30" : ""}`}>
        {/* Status Toggle */}
        <button
          onClick={() => onToggle(task.id, task.status)}
          className={`shrink-0 ${status.color} hover:scale-110 transition-transform`}
        >
          <StatusIcon size={22} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-white font-medium truncate ${
            task.status === "done" ? "line-through text-gray-500" : ""
          }`}>
            {task.title}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${
                isOverdue ? "text-red-400" : "text-gray-400"
              }`}>
                <Clock size={12} />
                {isOverdue ? "Overdue · " : ""}{formatDate(task.dueDate)}
              </span>
            )}
            {task.tags && task.tags.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Tag size={12} />
                {task.tags.slice(0, 2).join(", ")}
              </span>
            )}
            {task.timeTracked > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Timer size={12} />
                {task.timeTracked}m
              </span>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <span className={priority.class}>{priority.label}</span>

        {/* Status Badge */}
        <span className="text-xs text-gray-400 hidden sm:block">{status.label}</span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Delete Confirm */}
        {showConfirm && (
          <div className="absolute right-4 top-4 glass-card p-3 z-10 flex gap-2 animate-fade-in">
            <button
              onClick={() => { onDelete(task.id); setShowConfirm(false); }}
              className="btn-danger text-xs py-1 px-2"
            >
              Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="btn-secondary text-xs py-1 px-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid View
  return (
    <div className={`glass-card-hover p-5 flex flex-col gap-3 animate-fade-in relative ${
      task.status === "done" ? "opacity-60" : ""
    } ${isOverdue ? "border-red-500/30" : ""}`}>
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onToggle(task.id, task.status)}
          className={`shrink-0 mt-0.5 ${status.color} hover:scale-110 transition-transform`}
        >
          <StatusIcon size={20} />
        </button>
        <span className={priority.class}>{priority.label}</span>
      </div>

      {/* Title */}
      <p className={`text-white font-medium ${
        task.status === "done" ? "line-through text-gray-500" : ""
      }`}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-gray-400 text-sm line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/20">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        {task.dueDate ? (
          <span className={`flex items-center gap-1 text-xs ${
            isOverdue ? "text-red-400" : "text-gray-400"
          }`}>
            <Clock size={11} />
            {formatDate(task.dueDate)}
          </span>
        ) : (
          <span />
        )}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;