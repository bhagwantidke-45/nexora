/**
 * exportUtils.js
 * Utility functions for exporting app data to CSV or JSON files.
 */

/**
 * Convert an array of objects to a CSV string.
 */
const toCSV = (rows, columns) => {
  if (!rows || rows.length === 0) return "";
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = c.accessor ? c.accessor(row) : row[c.key] ?? "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
};

/**
 * Trigger a browser download for a text blob.
 */
const download = (content, filename, mime = "text/csv;charset=utf-8;") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── Tasks ──────────────────────────────────────────────────────────────────

const TASK_COLUMNS = [
  { label: "Title", key: "title" },
  { label: "Status", key: "status" },
  { label: "Priority", key: "priority" },
  { label: "Due Date", key: "dueDate" },
  { label: "Tags", accessor: (t) => (t.tags || []).join(", ") },
  { label: "Description", key: "description" },
  { label: "Recurring", key: "recurring" },
];

export const exportTasksCSV = (tasks) => {
  const csv = toCSV(tasks, TASK_COLUMNS);
  download(csv, "nexora-tasks.csv");
};

export const exportTasksJSON = (tasks) => {
  const clean = tasks.map(({ id, userId, createdAt, updatedAt, ...rest }) => rest);
  download(JSON.stringify(clean, null, 2), "nexora-tasks.json", "application/json");
};

// ─── Habits ─────────────────────────────────────────────────────────────────

const HABIT_COLUMNS = [
  { label: "Title", key: "title" },
  { label: "Description", key: "description" },
  { label: "Frequency", key: "frequency" },
  { label: "Streak", key: "streak" },
  { label: "Total Completions", accessor: (h) => (h.completedDates || []).length },
];

export const exportHabitsCSV = (habits) => {
  const csv = toCSV(habits, HABIT_COLUMNS);
  download(csv, "nexora-habits.csv");
};

export const exportHabitsJSON = (habits) => {
  const clean = habits.map(({ id, userId, createdAt, updatedAt, ...rest }) => rest);
  download(JSON.stringify(clean, null, 2), "nexora-habits.json", "application/json");
};

// ─── Records ────────────────────────────────────────────────────────────────

const RECORD_COLUMNS = [
  { label: "Title", key: "title" },
  { label: "Type", key: "type" },
  { label: "Content", key: "content" },
  { label: "Date", key: "date" },
  { label: "Phone", key: "phone" },
  { label: "Email", key: "email" },
  { label: "Address", key: "address" },
  { label: "URL", key: "url" },
  { label: "Pinned", accessor: (r) => (r.pinned ? "Yes" : "No") },
];

export const exportRecordsCSV = (records) => {
  const csv = toCSV(records, RECORD_COLUMNS);
  download(csv, "nexora-records.csv");
};

export const exportRecordsJSON = (records) => {
  const clean = records.map(({ id, userId, createdAt, updatedAt, ...rest }) => rest);
  download(JSON.stringify(clean, null, 2), "nexora-records.json", "application/json");
};

// ─── Events ─────────────────────────────────────────────────────────────────

const EVENT_COLUMNS = [
  { label: "Title", key: "title" },
  { label: "Date", key: "date" },
  { label: "Time", key: "time" },
  { label: "End Time", key: "endTime" },
  { label: "Category", key: "category" },
  { label: "All Day", accessor: (e) => (e.allDay ? "Yes" : "No") },
  { label: "Description", key: "description" },
];

export const exportEventsCSV = (events) => {
  const csv = toCSV(events, EVENT_COLUMNS);
  download(csv, "nexora-events.csv");
};

export const exportEventsJSON = (events) => {
  const clean = events.map(({ id, userId, createdAt, updatedAt, ...rest }) => rest);
  download(JSON.stringify(clean, null, 2), "nexora-events.json", "application/json");
};
