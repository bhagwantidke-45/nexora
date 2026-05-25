export const getOverdueTasks = (tasks) => {
  const today = new Date().toISOString().slice(0, 10);
  return tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== "done"
  );
};

export const getUpcomingTasks = (tasks, days = 3) => {
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date();
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().slice(0, 10);
  return tasks.filter(
    (t) => t.dueDate && t.dueDate >= today && t.dueDate <= futureStr && t.status !== "done"
  );
};

export const getUpcomingDates = (records, days = 7) => {
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date();
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().slice(0, 10);
  return records.filter(
    (r) => r.type === "date" && r.date && r.date >= today && r.date <= futureStr
  );
};

export const getTodayTasks = (tasks) => {
  const today = new Date().toISOString().slice(0, 10);
  return tasks.filter((t) => t.dueDate === today && t.status !== "done");
};