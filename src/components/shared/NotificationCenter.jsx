import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle, Zap, Target } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { Link } from "react-router-dom";

const TYPE_CONFIG = {
  info:    { icon: Info,          color: "text-blue-400",   bg: "bg-blue-500/10"   },
  success: { icon: CheckCircle,   color: "text-green-400",  bg: "bg-green-500/10"  },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  error:   { icon: AlertCircle,   color: "text-red-400",    bg: "bg-red-500/10"    },
  habit:   { icon: Target,        color: "text-orange-400", bg: "bg-orange-500/10" },
  task:    { icon: Zap,           color: "text-primary-400",bg: "bg-primary-500/10"},
};

const timeAgo = (ts) => {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications();

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl glass-card text-gray-400 hover:text-white transition-all hover:scale-105"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center animate-scale-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-card shadow-2xl shadow-black/50 z-50 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-display font-semibold text-white text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-primary-400">({unreadCount} new)</span>
              )}
            </h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Mark all read"
                >
                  <CheckCheck size={13} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Clear all"
                >
                  <Trash2 size={13} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All caught up!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                const content = (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 last:border-0 ${
                      !n.read ? "bg-primary-500/5" : ""
                    }`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {n.title && (
                        <p className="text-white text-xs font-medium truncate">{n.title}</p>
                      )}
                      <p className="text-gray-400 text-xs leading-relaxed">{n.message}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">{timeAgo(n.timestamp)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="text-gray-600 hover:text-gray-300 transition-colors shrink-0 mt-1"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );

                return n.link ? (
                  <Link to={n.link} key={n.id} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;