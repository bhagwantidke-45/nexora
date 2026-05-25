import { Edit2, Trash2, Star, Calendar, Bell } from "lucide-react";

const DateCard = ({ record, onEdit, onDelete, onPin }) => {
  const today = new Date().toISOString().slice(0, 10);

  const daysUntil = () => {
    if (!record.date) return null;
    const diff = new Date(record.date) - new Date(today);
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const days = daysUntil();

  const getStatusColor = () => {
    if (days === null) return "text-gray-400";
    if (days < 0) return "text-gray-500";
    if (days === 0) return "text-green-400";
    if (days <= 3) return "text-red-400";
    if (days <= 7) return "text-yellow-400";
    return "text-gray-400";
  };

  const getStatusText = () => {
    if (days === null) return "";
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return "Today! 🎉";
    if (days === 1) return "Tomorrow!";
    return `In ${days} days`;
  };

  return (
    <div className={`glass-card-hover p-5 flex flex-col gap-3 animate-fade-in ${
      record.pinned ? "border-yellow-500/30" : ""
    } ${days !== null && days >= 0 && days <= 3 ? "border-red-500/20" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <Calendar size={14} className="text-orange-400" />
          </div>
          <p className="text-white font-medium truncate">{record.title}</p>
        </div>
        <button
          onClick={() => onPin(record.id, record.pinned)}
          className={`shrink-0 transition-colors ${
            record.pinned ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"
          }`}
        >
          <Star size={15} fill={record.pinned ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Date */}
      {record.date && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">
            {new Date(record.date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
            })}
          </span>
          <div className={`flex items-center gap-1 text-xs font-medium ${getStatusColor()}`}>
            {days !== null && days >= 0 && days <= 7 && (
              <Bell size={11} className="animate-pulse" />
            )}
            {getStatusText()}
          </div>
        </div>
      )}

      {/* Content */}
      {record.content && (
        <p className="text-gray-400 text-sm line-clamp-2">{record.content}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end mt-auto pt-2 border-t border-white/5 gap-1">
        <button
          onClick={() => onEdit(record)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(record.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default DateCard;