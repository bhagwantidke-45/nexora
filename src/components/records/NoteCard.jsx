import { Edit2, Trash2, Star, FileText } from "lucide-react";

const NoteCard = ({ record, onEdit, onDelete, onPin }) => {
  return (
    <div className={`glass-card-hover p-5 flex flex-col gap-3 animate-fade-in ${
      record.pinned ? "border-yellow-500/30" : ""
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
            <FileText size={14} className="text-primary-400" />
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

      {/* Content */}
      {record.content && (
        <p className="text-gray-400 text-sm line-clamp-3">{record.content}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <span className="text-xs text-gray-600">
          {record.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
          }) || ""}
        </span>
        <div className="flex gap-1">
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
    </div>
  );
};

export default NoteCard;