/**
 * src/components/shared/NotificationSetup.jsx
 * Smart Instagram-style notification permission banner.
 * Shows after login — respects user dismiss, tracks in localStorage.
 */

import { useState, useEffect } from "react";
import { Bell, X, Smartphone } from "lucide-react";
import { usePushNotifications } from "../../hooks/usePushNotifications";

const NotificationSetup = () => {
  const {
    isSupported,
    isPWA,
    permission,
    requestPermission,
    showLocalNotification,
  } = usePushNotifications();

  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("nexora-notif-dismissed") === "true"
  );
  const [loading, setLoading]         = useState(false);
  const [showInstallHint, setShowInstallHint] = useState(false);

  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad/.test(navigator.userAgent);
    setShowInstallHint(isChrome && !isPWA && isMobile);
  }, [isPWA]);

  // Hide if: not supported, already dismissed, already answered
  if (!isSupported || dismissed || permission === "denied" || permission === "granted") {
    return null;
  }

  const handleAllow = async () => {
    setLoading(true);
    const result = await requestPermission();
    setLoading(false);

    if (result === "granted") {
      setTimeout(() => {
        showLocalNotification({
          title: "🔥 Nexora Notifications Enabled!",
          body:  "You'll get reminders for tasks, habits, events and monthly finance summaries.",
          url:   "/dashboard",
          tag:   "welcome-notif",
        });
      }, 1500);
    }
    // Dismiss banner regardless
    handleDismiss();
  };

  const handleDismiss = () => {
    localStorage.setItem("nexora-notif-dismissed", "true");
    setDismissed(true);
  };

  return (
    /* Sits above mobile nav (bottom-24) on mobile, standard bottom-6 on desktop */
    <div className="fixed bottom-24 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-40 animate-slide-up">
      <div
        className="glass-card p-4 shadow-2xl shadow-black/40 relative"
        style={{ border: "1px solid rgba(var(--glow),0.25)" }}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3 pr-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--grad1), var(--grad2))" }}
          >
            <Bell size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Turn on notifications</p>
            <p className="text-gray-400 text-xs">Never miss a deadline or habit</p>
          </div>
        </div>

        {/* What you'll get */}
        <div className="space-y-1.5 mb-4">
          {[
            { emoji: "⚠️", text: "Overdue task alerts" },
            { emoji: "🔥", text: "Daily habit reminder at 8 PM" },
            { emoji: "📅", text: "Event reminders 15 min before" },
            { emoji: "📊", text: "Monthly finance summary" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-xs text-gray-400">
              <span>{item.emoji}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Install hint for mobile Chrome non-PWA users */}
        {showInstallHint && (
          <div
            className="mb-3 p-2.5 rounded-xl text-xs text-blue-300 flex items-start gap-2"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <Smartphone size={12} className="shrink-0 mt-0.5" />
            <span>Install Nexora for persistent notifications: tap Share → "Add to Home Screen"</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="btn-secondary flex-1 justify-center text-xs py-2"
          >
            Not now
          </button>
          <button
            onClick={handleAllow}
            disabled={loading}
            className="btn-primary flex-1 justify-center text-xs py-2"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Bell size={12} /> Allow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSetup;