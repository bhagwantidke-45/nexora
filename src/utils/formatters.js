/**
 * formatters.js
 * Centralised formatting utilities used throughout the app.
 * Import individual functions — do not import the whole module.
 */

// ── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees.
 * formatINR(1234567) → "₹12,34,567"
 */
export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format a number as compact INR.
 * formatINRCompact(1234567) → "₹12.3L"
 */
export const formatINRCompact = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

// ── Dates ─────────────────────────────────────────────────────────────────────

/**
 * Format an ISO date string for display.
 * formatDate("2025-01-15") → "Jan 15, 2025"
 */
export const formatDate = (isoDate, options = {}) => {
  if (!isoDate) return "";
  try {
    return new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...options,
    });
  } catch {
    return isoDate;
  }
};

/**
 * Get days until/since a date.
 * getDaysUntil("2025-12-25") → 45   (future)
 * getDaysUntil("2025-01-01") → -14  (past)
 */
export const getDaysUntil = (isoDate) => {
  if (!isoDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  return Math.round((target - today) / 86400000);
};

/**
 * Human-readable relative time.
 * relativeTime("2025-01-10") → "5 days ago" | "In 3 days" | "Today"
 */
export const relativeTime = (isoDate) => {
  const days = getDaysUntil(isoDate);
  if (days === null) return "";
  if (days < 0)  return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

/**
 * Get today's ISO date string.
 */
export const today = () => new Date().toISOString().slice(0, 10);

/**
 * Get the current month ISO string (YYYY-MM).
 */
export const currentMonth = () => new Date().toISOString().slice(0, 7);

// ── Numbers ───────────────────────────────────────────────────────────────────

/**
 * Clamp a number between min and max.
 */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Calculate percentage (handles zero division).
 * percent(3, 10) → 30
 */
export const percent = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 100);
};

/**
 * Format seconds as MM:SS string.
 * formatTimer(90) → "01:30"
 */
export const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ── Strings ───────────────────────────────────────────────────────────────────

/**
 * Get initials from a full name.
 * getInitials("John Doe") → "JD"
 */
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
};

/**
 * Truncate text to a max length with ellipsis.
 */
export const truncate = (text = "", max = 80) => {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
};