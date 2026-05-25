import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";

const VARIANTS = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-500/10 border-green-500/30",
    text: "text-green-300",
    icon_color: "text-green-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-300",
    icon_color: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-300",
    icon_color: "text-yellow-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-300",
    icon_color: "text-blue-400",
  },
};

/**
 * Alert component
 * @param {string} variant - 'success' | 'error' | 'warning' | 'info'
 * @param {string} title - Bold heading (optional)
 * @param {string} message - Alert body text
 * @param {boolean} dismissible - Show close button
 * @param {number} autoClose - Auto-dismiss after N ms (0 = never)
 * @param {function} onClose - Callback when dismissed
 * @param {React.ReactNode} action - Optional action button/link
 */
const Alert = ({
  variant = "info",
  title,
  message,
  dismissible = false,
  autoClose = 0,
  onClose,
  action,
  className = "",
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => handleClose(), autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  return (
    <div
      className={`glass-card p-4 flex items-start gap-3 animate-fade-in ${config.bg} ${className}`}
    >
      <Icon size={18} className={`${config.icon_color} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm ${config.text} mb-0.5`}>{title}</p>
        )}
        {message && (
          <p className={`text-sm ${config.text} opacity-90`}>{message}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {dismissible && (
        <button
          onClick={handleClose}
          className={`shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
