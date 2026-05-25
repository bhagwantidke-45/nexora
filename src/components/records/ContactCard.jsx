import { Edit2, Trash2, Star, User, Phone, Mail, MapPin } from "lucide-react";

const ContactCard = ({ record, onEdit, onDelete, onPin }) => {
  return (
    <div className={`glass-card-hover p-5 flex flex-col gap-3 animate-fade-in ${
      record.pinned ? "border-yellow-500/30" : ""
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <span className="text-blue-400 font-bold text-sm">
              {record.title?.charAt(0).toUpperCase()}
            </span>
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

      {/* Contact Info */}
      <div className="space-y-2">
        {record.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone size={12} className="text-green-400 shrink-0" />
            <a href={`tel:${record.phone}`} className="hover:text-white transition-colors">
              {record.phone}
            </a>
          </div>
        )}
        {record.email && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail size={12} className="text-blue-400 shrink-0" />
            <a href={`mailto:${record.email}`} className="hover:text-white transition-colors truncate">
              {record.email}
            </a>
          </div>
        )}
        {record.address && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin size={12} className="text-red-400 shrink-0" />
            <span className="truncate">{record.address}</span>
          </div>
        )}
        {record.content && (
          <p className="text-gray-500 text-xs line-clamp-2 mt-1">{record.content}</p>
        )}
      </div>

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

export default ContactCard;