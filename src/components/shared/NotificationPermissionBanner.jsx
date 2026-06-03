/**
 * NotificationPermissionBanner.jsx
 * Shows a non-intrusive banner asking the user to enable notifications.
 * Appears once; dismissible; respects existing permission state.
 */

import { useState, useEffect } from "react";
import { Bell, X, BellOff } from "lucide-react";
import { getPermissionStatus, requestPermission } from "../../services/notificationService";

const NotificationPermissionBanner = () => {
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [denied,   setDenied]   = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("nexora_notif_dismissed");
    if (dismissed) return;

    const status = getPermissionStatus();
    if (status === "default") {
      // Show after 5s so user is settled
      const t = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const result = await requestPermission();
    setLoading(false);
    if (result === "granted") {
      setShow(false);
    } else {
      setDenied(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("nexora_notif_dismissed", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-50 animate-slide-up">
      <div className="glass-card p-4 shadow-2xl"
        style={{ border: "1px solid rgba(var(--glow),0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(var(--glow),0.15)" }}>
            {denied ? <BellOff size={16} className="text-red-400" /> : <Bell size={16} style={{ color: "var(--p400)" }} />}
          </div>

          <div className="flex-1 min-w-0">
            {denied ? (
              <>
                <p className="text-white text-sm font-medium">Notifications Blocked</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Enable in your browser settings → Site Settings → Notifications.
                </p>
              </>
            ) : (
              <>
                <p className="text-white text-sm font-medium">Enable Notifications</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Get reminders for overdue tasks, habits, events &amp; budget alerts.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleEnable}
                    disabled={loading}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    {loading
                      ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Bell size={11} /> Enable</>
                    }
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Not now
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-gray-500 hover:text-white transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;