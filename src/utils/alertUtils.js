/**
 * alertUtils.js
 * Utility functions that derive alert objects from app data.
 * Each function returns an array of alert descriptor objects:
 * { id, variant, title, message, link, linkLabel }
 */

/**
 * Build alerts from overdue tasks
 */
export const getOverdueAlerts = (tasks) => {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== "done"
  );
  if (overdue.length === 0) return [];
  return [
    {
      id: "overdue-tasks",
      variant: "error",
      title: "Overdue Tasks",
      message: `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}. Review them before they pile up!`,
      link: "/tasks",
      linkLabel: "View tasks →",
    },
  ];
};

/**
 * Build alerts from upcoming important dates (within N days)
 */
export const getUpcomingDateAlerts = (records, daysAhead = 7) => {
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);
  const futureStr = future.toISOString().slice(0, 10);

  return records
    .filter((r) => r.type === "date" && r.date && r.date >= today && r.date <= futureStr)
    .map((r) => {
      const diff = Math.round(
        (new Date(r.date) - new Date(today)) / (1000 * 60 * 60 * 24)
      );
      const when =
        diff === 0 ? "Today! 🎉" : diff === 1 ? "Tomorrow" : `In ${diff} days`;
      return {
        id: `date-${r.id}`,
        variant: diff <= 1 ? "warning" : "info",
        title: r.title,
        message: `${when} · ${new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}`,
        link: "/records",
        linkLabel: "View record →",
      };
    });
};

/**
 * Build alerts for habits not yet completed today
 */
export const getHabitAlerts = (habits) => {
  const today = new Date().toISOString().slice(0, 10);
  const notDone = habits.filter(
    (h) => !(h.completedDates || []).includes(today)
  );
  if (notDone.length === 0) return [];
  return [
    {
      id: "habits-pending",
      variant: "info",
      title: "Habits Pending",
      message: `${notDone.length} habit${notDone.length > 1 ? "s" : ""} not yet completed today. Keep your streak going!`,
      link: "/habits",
      linkLabel: "Go to habits →",
    },
  ];
};

/**
 * Combine all alert sources into a single list, ordered by urgency
 */
export const getAllAlerts = (tasks, records, habits) => {
  return [
    ...getOverdueAlerts(tasks),
    ...getUpcomingDateAlerts(records),
    ...getHabitAlerts(habits),
  ];
};
