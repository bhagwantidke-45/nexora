/**
 * useAppNotifications.js
 * Central hook that watches all app data and fires
 * the right notifications automatically.
 *
 * Place ONCE in App.jsx inside ProtectedRoute.
 */

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasksRealtime }       from "../firebase/tasks";
import { getHabitsRealtime }      from "../firebase/habits";
import { getGoalsRealtime }       from "../firebase/goals";
import { getEventsRealtime }      from "../firebase/calendar";
import { getBudgetsRealtime, getTransactionsRealtime } from "../firebase/finance";
import {
  getPermissionStatus,
  requestPermission,
  notifyOverdueTasks,
  notifyDueTodayTasks,
  notifyHabitReminder,
  notifyHabitStreakMilestone,
  notifyUpcomingEvents,
  notifyGoalCompleted,
  notifyGoalDeadlineApproaching,
  notifyBudgetExceeded,
  notifyBudgetWarning,
  scheduleEventReminder,
  sendDailySummary,
} from "../services/notificationService";

// Keys for localStorage dedup (don't re-fire same notif same day)
const STORAGE_KEY  = "nexora_notif_sent";
const getToday     = () => new Date().toISOString().slice(0, 10);
const wasSentToday = (key) => {
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return store[key] === getToday();
  } catch { return false; }
};
const markSentToday = (key) => {
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    // Purge old keys (keep only today's)
    const today = getToday();
    const fresh = Object.fromEntries(Object.entries(store).filter(([, v]) => v === today));
    fresh[key] = today;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {}
};

const useAppNotifications = () => {
  const { user }   = useAuth();
  const dataRef    = useRef({ tasks:[], habits:[], goals:[], events:[], budgets:[], transactions:[] });
  const scheduledEventsRef = useRef(new Set());

  // ── Request permission on first load ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const status = getPermissionStatus();
    if (status === "default") {
      // Small delay so user is settled in the app first
      const t = setTimeout(() => requestPermission(), 3000);
      return () => clearTimeout(t);
    }
  }, [user]);

  // ── SW navigation message listener ────────────────────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handler = (event) => {
      if (event.data?.type === "NAVIGATE") {
        window.location.href = event.data.url;
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  // ── Run checks when data changes ──────────────────────────────────────────
  const runChecks = useCallback(async () => {
    if (getPermissionStatus() !== "granted") return;
    const { tasks, habits, goals, events, budgets, transactions } = dataRef.current;
    const today = getToday();
    const now   = new Date();
    const hour  = now.getHours();

    // ① Daily summary — 8 AM once per day
    if (hour >= 8 && !wasSentToday("daily_summary")) {
      markSentToday("daily_summary");
      await sendDailySummary({ tasks, habits, events });
    }

    // ② Overdue tasks — once per day after 9 AM
    if (hour >= 9 && !wasSentToday("overdue_tasks")) {
      const overdue = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done");
      if (overdue.length) {
        markSentToday("overdue_tasks");
        await notifyOverdueTasks(tasks);
      }
    }

    // ③ Due today — once per day at 9 AM
    if (hour >= 9 && !wasSentToday("due_today")) {
      const due = tasks.filter(t => t.dueDate === today && t.status !== "done");
      if (due.length) {
        markSentToday("due_today");
        await notifyDueTodayTasks(tasks);
      }
    }

    // ④ Habit reminder — 7 PM if habits still pending
    if (hour >= 19 && !wasSentToday("habit_reminder")) {
      const pending = habits.filter(h => !(h.completedDates || []).includes(today));
      if (pending.length) {
        markSentToday("habit_reminder");
        await notifyHabitReminder(habits);
      }
    }

    // ⑤ Goal deadline approaching — once per day at 10 AM
    if (hour >= 10 && !wasSentToday("goal_deadline")) {
      const approaching = goals.filter(g => {
        if (!g.deadline || g.progress === 100) return false;
        const days = Math.round((new Date(g.deadline) - now) / 86400000);
        return days >= 0 && days <= 3;
      });
      if (approaching.length) {
        markSentToday("goal_deadline");
        await notifyGoalDeadlineApproaching(goals);
      }
    }

    // ⑥ Upcoming events — once per day at 8 AM
    if (hour >= 8 && !wasSentToday("upcoming_events")) {
      const upcoming = events.filter(e => {
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const tStr = tomorrow.toISOString().slice(0, 10);
        return e.date === today || e.date === tStr;
      });
      if (upcoming.length) {
        markSentToday("upcoming_events");
        await notifyUpcomingEvents(events);
      }
    }

    // ⑦ Budget warnings — once per day at 10 AM
    if (hour >= 10 && !wasSentToday("budget_check")) {
      const currentMonth = now.toISOString().slice(0, 7);
      const monthTx = transactions.filter(t => t.date?.startsWith(currentMonth) && t.type === "expense");

      for (const budget of budgets) {
        if (budget.month !== currentMonth) continue;
        const spent = monthTx
          .filter(t => t.category === budget.category)
          .reduce((s, t) => s + Number(t.amount), 0);
        const pct = (spent / Number(budget.limit)) * 100;
        const key = `budget_${budget.id}`;

        if (pct >= 100 && !wasSentToday(`exceeded_${budget.id}`)) {
          markSentToday(`exceeded_${budget.id}`);
          await notifyBudgetExceeded(budget.category, spent, Number(budget.limit));
        } else if (pct >= 80 && !wasSentToday(key)) {
          markSentToday(key);
          await notifyBudgetWarning(budget.category, spent, Number(budget.limit));
        }
      }
      markSentToday("budget_check");
    }

    // ⑧ Schedule timed event reminders (30min + 5min before)
    for (const event of events) {
      if (!event.date || !event.time || scheduledEventsRef.current.has(event.id)) continue;
      const eventTime = new Date(`${event.date}T${event.time}`);
      if (eventTime > now) {
        scheduledEventsRef.current.add(event.id);
        await scheduleEventReminder(event);
      }
    }
  }, []);

  // ── Subscribe to all data ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    // Previous goal states for completion detection
    const prevGoalProgress = {};

    // Previous habit streak for milestone detection
    const prevHabitStreak = {};

    const u1 = getTasksRealtime(uid, (data) => {
      dataRef.current.tasks = data;
      runChecks();
    });

    const u2 = getHabitsRealtime(uid, async (data) => {
      // Check streak milestones before updating
      for (const habit of data) {
        const prev = prevHabitStreak[habit.id];
        if (prev !== undefined && habit.streak > prev) {
          await notifyHabitStreakMilestone(habit);
        }
        prevHabitStreak[habit.id] = habit.streak;
      }
      dataRef.current.habits = data;
      runChecks();
    });

    const u3 = getGoalsRealtime(uid, async (data) => {
      // Check for newly completed goals
      for (const goal of data) {
        const prev = prevGoalProgress[goal.id];
        if (prev !== undefined && prev < 100 && goal.progress === 100) {
          await notifyGoalCompleted(goal);
        }
        prevGoalProgress[goal.id] = goal.progress;
      }
      dataRef.current.goals = data;
      runChecks();
    });

    const u4 = getEventsRealtime(uid, (data) => {
      dataRef.current.events = data;
      runChecks();
    });

    const u5 = getBudgetsRealtime(uid, (data) => {
      dataRef.current.budgets = data;
      runChecks();
    });

    const u6 = getTransactionsRealtime(uid, (data) => {
      dataRef.current.transactions = data;
      runChecks();
    });

    // Re-run checks every 30 minutes (catches time-based triggers)
    const interval = setInterval(runChecks, 30 * 60 * 1000);

    return () => { u1(); u2(); u3(); u4(); u5(); u6(); clearInterval(interval); };
  }, [user, runChecks]);
};

export default useAppNotifications;