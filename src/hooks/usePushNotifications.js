/**
 * src/hooks/usePushNotifications.js
 * Full PWA push notification support — request permission, subscribe,
 * send local/scheduled notifications. Works when app is installed from Chrome.
 */

import { useState, useEffect, useCallback } from "react";

export const usePushNotifications = () => {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [swRegistration, setSwRegistration] = useState(null);
  const [isSupported, setIsSupported]       = useState(false);
  const [isPWA, setIsPWA]                   = useState(false);

  useEffect(() => {
    // Detect installed PWA
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");
    setIsPWA(standaloneMode);

    // Feature detection
    const supported =
      "serviceWorker" in navigator &&
      "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      navigator.serviceWorker.ready
        .then((reg) => setSwRegistration(reg))
        .catch(() => {});
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied";
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return "denied";
    }
  }, []);

  /**
   * Show a local notification immediately.
   * Uses SW showNotification for persistence (works when backgrounded).
   */
  const showLocalNotification = useCallback(
    async ({
      title,
      body,
      icon = "/favicon.svg",
      url = "/dashboard",
      tag,
      requireInteraction = false,
    }) => {
      let perm = permission;
      if (perm === "default") {
        perm = await requestPermission();
      }
      if (perm !== "granted") return false;

      try {
        const reg = swRegistration || (await navigator.serviceWorker.ready);
        await reg.showNotification(title, {
          body,
          icon,
          badge: "/favicon.svg",
          tag: tag || `nexora-${Date.now()}`,
          requireInteraction,
          vibrate: [200, 100, 200],
          data: { url },
          actions: [
            { action: "open",    title: "Open" },
            { action: "dismiss", title: "Dismiss" },
          ],
        });
        return true;
      } catch {
        // Fallback: basic Notification API
        try {
          const n = new Notification(title, { body, icon });
          n.onclick = () => { window.focus(); window.location.href = url; };
          return true;
        } catch {
          return false;
        }
      }
    },
    [permission, requestPermission, swRegistration]
  );

  const scheduleNotification = useCallback(
    (payload, delayMs) => {
      const timer = setTimeout(() => showLocalNotification(payload), delayMs);
      return () => clearTimeout(timer);
    },
    [showLocalNotification]
  );

  return {
    isSupported,
    isPWA,
    permission,
    swRegistration,
    requestPermission,
    showLocalNotification,
    scheduleNotification,
  };
};

// ── Standalone helper ────────────────────────────────────────────────────────
export async function sendNotification({ title, body, icon = "/favicon.svg", url = "/dashboard", tag }) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body, icon,
      badge: "/favicon.svg",
      tag: tag || `nexora-${Date.now()}`,
      vibrate: [200, 100, 200],
      data: { url },
    });
  } catch {
    new Notification(title, { body, icon });
  }
}

/**
 * NotificationScheduler — static class for scheduling recurring/timed alerts.
 */
export class NotificationScheduler {
  static timers = new Map();

  static scheduleHabitReminder(habits, showFn) {
    this.clear("habit-reminder");

    const now     = new Date();
    const evening = new Date();
    evening.setHours(20, 0, 0, 0); // 8 PM
    if (evening <= now) evening.setDate(evening.getDate() + 1);

    const delay = evening - now;
    const timer = setTimeout(() => {
      const today   = new Date().toISOString().slice(0, 10);
      const pending = habits.filter(
        (h) => !(h.completedDates || []).includes(today)
      );
      if (pending.length > 0) {
        showFn({
          title: "🔥 Habit Reminder",
          body:  `${pending.length} habit${pending.length > 1 ? "s" : ""} still pending today! Keep your streak going.`,
          url:   "/habits",
          tag:   "habit-reminder",
        });
      }
    }, delay);

    this.timers.set("habit-reminder", timer);
  }

  static scheduleOverdueTaskAlert(tasks, showFn) {
    this.clear("task-overdue");

    const today   = new Date().toISOString().slice(0, 10);
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "done"
    );

    if (overdue.length > 0) {
      // Fire 60 seconds after app load
      const timer = setTimeout(() => {
        showFn({
          title: "⚠️ Overdue Tasks",
          body:  `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}. Tap to review.`,
          url:   "/tasks",
          tag:   "task-overdue",
        });
      }, 60_000);
      this.timers.set("task-overdue", timer);
    }
  }

  static scheduleUpcomingEventAlert(events, showFn) {
    const now = Date.now();

    events.forEach((event) => {
      if (!event.date || !event.time) return;
      const eventTime    = new Date(`${event.date}T${event.time}`).getTime();
      const reminderTime = eventTime - 15 * 60 * 1000; // 15 min before

      if (reminderTime > now) {
        const key = `event-${event.id}`;
        this.clear(key);
        const timer = setTimeout(() => {
          showFn({
            title: `📅 ${event.title}`,
            body:  `Starting in 15 minutes at ${event.time}`,
            url:   "/calendar",
            tag:   key,
          });
        }, reminderTime - now);
        this.timers.set(key, timer);
      }
    });
  }

  static scheduleMonthlySummaryAlert(showFn) {
    const now     = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(22, 0, 0, 0); // 10 PM on last day of month

    const delay = lastDay - now;
    // Only schedule if last day is within next 7 days and is in the future
    if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
      this.clear("monthly-summary");
      const timer = setTimeout(() => {
        showFn({
          title:              "📊 Monthly Finance Summary Ready",
          body:               "Your monthly income & expense summary is ready. Tap to view.",
          url:                "/finance",
          tag:                "monthly-summary",
          requireInteraction: true,
        });
      }, delay);
      this.timers.set("monthly-summary", timer);
    }
  }

  static clear(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  static clearAll() {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }
}