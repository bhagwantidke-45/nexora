/**
 * notificationService.js
 * Handles browser/PWA push notifications for Nexora.
 *
 * Usage:
 *   import { requestPermission, scheduleNotification, ... } from './notificationService'
 */

// ── Permission ────────────────────────────────────────────────────────────────

export const getPermissionStatus = () => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
};

export const requestPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  const result = await Notification.requestPermission();
  return result;
};

// ── SW registration helper ────────────────────────────────────────────────────

const getSW = async () => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
};

// ── Core: show an immediate notification ─────────────────────────────────────

export const showNotification = async (title, options = {}) => {
  if (Notification.permission !== "granted") return;
  const sw = await getSW();
  if (sw) {
    await sw.showNotification(title, {
      icon:    "/favicon.svg",
      badge:   "/favicon.svg",
      vibrate: [200, 100, 200],
      ...options,
    });
  } else {
    // Fallback for desktop non-SW
    new Notification(title, { icon: "/favicon.svg", ...options });
  }
};

// ── Core: schedule a notification via SW message ──────────────────────────────

export const scheduleNotification = async ({ title, body, url, tag, notifType, delayMs }) => {
  if (Notification.permission !== "granted") return;
  if (!("serviceWorker" in navigator)) return;
  const sw = await getSW();
  if (!sw || !sw.active) return;
  sw.active.postMessage({
    type: "SCHEDULE_NOTIFICATION",
    title,
    body,
    url,
    tag,
    notifType,
    delay: delayMs || 0,
  });
};

// ── Task Notifications ────────────────────────────────────────────────────────

export const notifyOverdueTasks = async (tasks) => {
  const today    = new Date().toISOString().slice(0, 10);
  const overdue  = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done");
  if (!overdue.length) return;

  const names = overdue.slice(0, 3).map(t => `• ${t.title}`).join("\n");
  const extra = overdue.length > 3 ? `\n+ ${overdue.length - 3} more` : "";

  await showNotification(`⚠️ ${overdue.length} Overdue Task${overdue.length > 1 ? "s" : ""}`, {
    body:    `${names}${extra}`,
    tag:     "nexora-task-overdue",
    data:    { url: "/tasks" },
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true,
  });
};

export const notifyDueTodayTasks = async (tasks) => {
  const today  = new Date().toISOString().slice(0, 10);
  const due    = tasks.filter(t => t.dueDate === today && t.status !== "done");
  if (!due.length) return;

  const names = due.slice(0, 3).map(t => `• ${t.title}`).join("\n");
  const extra = due.length > 3 ? `\n+ ${due.length - 3} more` : "";

  await showNotification(`📋 ${due.length} Task${due.length > 1 ? "s" : ""} Due Today`, {
    body:    `${names}${extra}`,
    tag:     "nexora-task-today",
    data:    { url: "/tasks" },
    vibrate: [200, 100, 200],
  });
};

export const notifyTaskAdded = async (task) => {
  await showNotification("✅ Task Created", {
    body:    `"${task.title}" added${task.dueDate ? ` · Due ${task.dueDate}` : ""}`,
    tag:     `nexora-task-added-${task.id}`,
    data:    { url: "/tasks" },
    vibrate: [100],
  });
};

// ── Habit Notifications ───────────────────────────────────────────────────────

export const notifyHabitReminder = async (habits) => {
  const today   = new Date().toISOString().slice(0, 10);
  const pending = habits.filter(h => !(h.completedDates || []).includes(today));
  if (!pending.length) return;

  const names = pending.slice(0, 3).map(h => `• ${h.icon || "🎯"} ${h.title}`).join("\n");
  const extra = pending.length > 3 ? `\n+ ${pending.length - 3} more` : "";

  await showNotification(`🔥 ${pending.length} Habit${pending.length > 1 ? "s" : ""} Pending`, {
    body:    `${names}${extra}\nKeep your streak going!`,
    tag:     "nexora-habit-reminder",
    data:    { url: "/habits" },
    vibrate: [200, 100, 200],
  });
};

export const notifyHabitStreakMilestone = async (habit) => {
  const milestones = [7, 14, 21, 30, 60, 100];
  if (!milestones.includes(habit.streak)) return;

  await showNotification(`🏆 ${habit.streak}-Day Streak!`, {
    body:    `Amazing! You've kept up "${habit.title}" for ${habit.streak} days straight!`,
    tag:     `nexora-streak-${habit.id}`,
    data:    { url: "/habits" },
    vibrate: [200, 100, 200, 100, 400],
  });
};

// ── Event Notifications ───────────────────────────────────────────────────────

export const scheduleEventReminder = async (event) => {
  if (!event.date || !event.time) return;

  const eventDate = new Date(`${event.date}T${event.time}`);
  const now       = new Date();
  const msUntil   = eventDate.getTime() - now.getTime();

  // 30-minute reminder
  const ms30min = msUntil - 30 * 60 * 1000;
  if (ms30min > 0) {
    await scheduleNotification({
      title:     `📅 "${event.title}" in 30 minutes`,
      body:      `Starting at ${event.time}`,
      url:       "/calendar",
      tag:       `nexora-event-30m-${event.id}`,
      notifType: "event_reminder",
      delayMs:   ms30min,
    });
  }

  // 5-minute reminder
  const ms5min = msUntil - 5 * 60 * 1000;
  if (ms5min > 0) {
    await scheduleNotification({
      title:     `🚨 "${event.title}" starts in 5 minutes!`,
      body:      `Don't be late!`,
      url:       "/calendar",
      tag:       `nexora-event-5m-${event.id}`,
      notifType: "event_reminder",
      delayMs:   ms5min,
    });
  }
};

export const notifyUpcomingEvents = async (events) => {
  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const upcoming = events.filter(e => e.date === today || e.date === tomorrowStr);
  if (!upcoming.length) return;

  const todayEvents    = upcoming.filter(e => e.date === today);
  const tomorrowEvents = upcoming.filter(e => e.date === tomorrowStr);

  let body = "";
  if (todayEvents.length)    body += `Today: ${todayEvents.map(e => e.title).join(", ")}\n`;
  if (tomorrowEvents.length) body += `Tomorrow: ${tomorrowEvents.map(e => e.title).join(", ")}`;

  await showNotification(`📅 ${upcoming.length} Upcoming Event${upcoming.length > 1 ? "s" : ""}`, {
    body:    body.trim(),
    tag:     "nexora-events-upcoming",
    data:    { url: "/calendar" },
    vibrate: [200, 100, 200],
  });
};

// ── Goal Notifications ────────────────────────────────────────────────────────

export const notifyGoalCompleted = async (goal) => {
  await showNotification("🎯 Goal Completed! 🎉", {
    body:    `Congratulations! You've completed "${goal.title}"!`,
    tag:     `nexora-goal-done-${goal.id}`,
    data:    { url: "/goals" },
    vibrate: [200, 100, 200, 100, 400],
    requireInteraction: true,
  });
};

export const notifyGoalDeadlineApproaching = async (goals) => {
  const soon = goals.filter(g => {
    if (!g.deadline || g.progress === 100) return false;
    const days = Math.round((new Date(g.deadline) - new Date()) / 86400000);
    return days >= 0 && days <= 3;
  });
  if (!soon.length) return;

  const names = soon.map(g => {
    const days = Math.round((new Date(g.deadline) - new Date()) / 86400000);
    return `• "${g.title}" (${days === 0 ? "today!" : `${days}d left`}, ${g.progress || 0}% done)`;
  }).join("\n");

  await showNotification(`⏰ ${soon.length} Goal${soon.length > 1 ? "s" : ""} Deadline Soon`, {
    body:    names,
    tag:     "nexora-goal-deadline",
    data:    { url: "/goals" },
    vibrate: [300, 100, 300],
    requireInteraction: true,
  });
};

// ── Finance Notifications ─────────────────────────────────────────────────────

export const notifyBudgetExceeded = async (category, spent, limit) => {
  await showNotification("💸 Budget Exceeded!", {
    body:    `Your "${category}" budget is over limit.\nSpent: ₹${spent.toLocaleString("en-IN")} / ₹${limit.toLocaleString("en-IN")}`,
    tag:     `nexora-budget-${category}`,
    data:    { url: "/finance" },
    vibrate: [300, 100, 300],
    requireInteraction: true,
  });
};

export const notifyBudgetWarning = async (category, spent, limit) => {
  const pct = Math.round((spent / limit) * 100);
  await showNotification(`⚠️ Budget Warning: ${category}`, {
    body:    `You've used ${pct}% of your budget.\n₹${spent.toLocaleString("en-IN")} of ₹${limit.toLocaleString("en-IN")}`,
    tag:     `nexora-budget-warn-${category}`,
    data:    { url: "/finance" },
    vibrate: [200, 100, 200],
  });
};

// ── Daily Summary (called once per day) ──────────────────────────────────────

export const sendDailySummary = async ({ tasks, habits, events }) => {
  const today        = new Date().toISOString().slice(0, 10);
  const overdue      = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done");
  const dueToday     = tasks.filter(t => t.dueDate === today && t.status !== "done");
  const habitsPending= habits.filter(h => !(h.completedDates || []).includes(today));
  const todayEvents  = events.filter(e => e.date === today);

  const lines = [];
  if (dueToday.length)     lines.push(`📋 ${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`);
  if (overdue.length)      lines.push(`⚠️ ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`);
  if (todayEvents.length)  lines.push(`📅 ${todayEvents.length} event${todayEvents.length > 1 ? "s" : ""} today`);
  if (habitsPending.length)lines.push(`🔥 ${habitsPending.length} habit${habitsPending.length > 1 ? "s" : ""} to complete`);

  if (!lines.length) {
    lines.push("🎉 All clear! Great job staying on top of things.");
  }

  await showNotification("☀️ Good Morning — Daily Summary", {
    body:    lines.join("\n"),
    tag:     "nexora-daily-summary",
    data:    { url: "/dashboard" },
    vibrate: [200, 100, 200],
  });
};