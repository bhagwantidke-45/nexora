import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";

/**
 * KeyboardShortcuts — shows a help modal listing all keyboard shortcuts.
 * Press "?" anywhere to open it.
 * Place once in App.jsx or Navbar.jsx.
 */

const SHORTCUTS = [
  { section: "Navigation" },
  { key: "Alt + N",   action: "Quick add anything" },
  { key: "Ctrl/⌘ + K", action: "Open global search" },
  { key: "?",         action: "Show keyboard shortcuts" },

  { section: "Tasks" },
  { key: "Enter",     action: "Submit form" },
  { key: "Esc",       action: "Close modal / cancel" },

  { section: "AI Assistant" },
  { key: "Enter",     action: "Send message" },
  { key: "Shift + Enter", action: "New line in message" },

  { section: "Focus Timer" },
  { key: "Space",     action: "Play / pause timer (on Focus page)" },
];

const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Only trigger on "?" when not in an input/textarea
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
      ) {
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />

      {/* Panel */}
      <div className="relative w-full max-w-md glass-card p-6 shadow-2xl shadow-black/50 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-primary-400" />
            <h2 className="font-display font-semibold text-white">Keyboard shortcuts</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {SHORTCUTS.map((item, i) => {
            if (item.section) {
              return (
                <p key={i} className="text-[10px] font-medium text-gray-500 uppercase tracking-wider pt-3 pb-1 first:pt-0">
                  {item.section}
                </p>
              );
            }
            return (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-gray-400 text-sm">{item.action}</span>
                <kbd className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-lg border border-white/10 font-mono">
                  {item.key}
                </kbd>
              </div>
            );
          })}
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">Press <kbd className="bg-white/10 px-1 rounded">?</kbd> to toggle this panel</p>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;