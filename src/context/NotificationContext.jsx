import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext(null);

let _id = 0;
const nextId = () => ++_id;

/**
 * NotificationProvider — wrap your app with this.
 * Provides useNotifications() hook everywhere.
 *
 * Notification shape:
 *   { id, type: "info"|"success"|"warning"|"error"|"habit"|"task",
 *     title, message, timestamp, read, link }
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const push = useCallback((notif) => {
    const entry = {
      id: nextId(),
      type: "info",
      title: "",
      message: "",
      timestamp: Date.now(),
      read: false,
      link: null,
      ...notif,
    };
    setNotifications((prev) => [entry, ...prev].slice(0, 50)); // cap at 50
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, push, markRead, markAllRead, dismiss, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};