import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, CheckSquare, Calendar, BookOpen, Target, DollarSign, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTasksRealtime }        from "../../firebase/tasks";
import { getEventsRealtime }       from "../../firebase/calendar";
import { getRecordsRealtime }      from "../../firebase/records";
import { getHabitsRealtime }       from "../../firebase/habits";
import { getGoalsRealtime }        from "../../firebase/goals";
import { getTransactionsRealtime } from "../../firebase/finance";

const TYPE_CONFIG = {
  task:        { icon: CheckSquare, color: "text-purple-400",  bg: "bg-purple-500/10",  label: "Task",        route: "/tasks" },
  event:       { icon: Calendar,    color: "text-blue-400",    bg: "bg-blue-500/10",    label: "Event",       route: "/calendar" },
  record:      { icon: BookOpen,    color: "text-cyan-400",    bg: "bg-cyan-500/10",    label: "Record",      route: "/records" },
  habit:       { icon: Target,      color: "text-orange-400",  bg: "bg-orange-500/10",  label: "Habit",       route: "/habits" },
  goal:        { icon: Target,      color: "text-green-400",   bg: "bg-green-500/10",   label: "Goal",        route: "/goals" },
  transaction: { icon: DollarSign,  color: "text-yellow-400",  bg: "bg-yellow-500/10",  label: "Transaction", route: "/finance" },
};

/**
 * GlobalSearch — a modal-style search overlay.
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 */
const GlobalSearch = ({ isOpen, onClose }) => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const inputRef    = useRef(null);
  const [query, setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);

  /* Load all data once */
  useEffect(() => {
    if (!user || !isOpen) return;
    const unsubs = [];
    const store = {};

    const merge = (key, items) => {
      store[key] = items;
      const flat = [
        ...(store.tasks        || []).map(t => ({ id: t.id, type: "task",        title: t.title,       sub: t.priority,        raw: t })),
        ...(store.events       || []).map(e => ({ id: e.id, type: "event",       title: e.title,       sub: e.date,            raw: e })),
        ...(store.records      || []).map(r => ({ id: r.id, type: "record",      title: r.title,       sub: r.type,            raw: r })),
        ...(store.habits       || []).map(h => ({ id: h.id, type: "habit",       title: h.title,       sub: `${h.streak}d streak`, raw: h })),
        ...(store.goals        || []).map(g => ({ id: g.id, type: "goal",        title: g.title,       sub: g.category,        raw: g })),
        ...(store.transactions || []).map(x => ({ id: x.id, type: "transaction", title: x.category,    sub: `₹${Number(x.amount).toLocaleString("en-IN")} · ${x.type}`, raw: x })),
      ];
      setAllData(flat);
      setLoading(false);
    };

    unsubs.push(getTasksRealtime(user.uid,        d => merge("tasks",        d)));
    unsubs.push(getEventsRealtime(user.uid,       d => merge("events",       d)));
    unsubs.push(getRecordsRealtime(user.uid,      d => merge("records",      d)));
    unsubs.push(getHabitsRealtime(user.uid,       d => merge("habits",       d)));
    unsubs.push(getGoalsRealtime(user.uid,        d => merge("goals",        d)));
    unsubs.push(getTransactionsRealtime(user.uid, d => merge("transactions", d)));

    return () => unsubs.forEach(u => u());
  }, [user, isOpen]);

  /* Filter */
  useEffect(() => {
    if (!query.trim()) { setResults(allData.slice(0, 10)); setSelected(0); return; }
    const q = query.toLowerCase();
    const filtered = allData
      .filter(item => item.title?.toLowerCase().includes(q) || item.sub?.toLowerCase().includes(q) || item.type?.includes(q))
      .slice(0, 12);
    setResults(filtered);
    setSelected(0);
  }, [query, allData]);

  /* Focus on open */
  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(""); }
  }, [isOpen]);

  /* Keyboard nav */
  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) { handleSelect(results[selected]); }
    if (e.key === "Escape") onClose();
  }, [results, selected]);

  const handleSelect = (item) => {
    navigate(TYPE_CONFIG[item.type]?.route || "/dashboard");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl glass-card shadow-2xl shadow-black/50 animate-scale-in overflow-hidden">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, events, records, habits, goals, finances..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-500 hover:text-white transition-colors shrink-0">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:block text-xs text-gray-600 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <Search size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No results for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {!query && (
                <p className="text-xs text-gray-600 px-3 py-2 font-medium uppercase tracking-wider">Recent / All</p>
              )}
              {results.map((item, i) => {
                const cfg = TYPE_CONFIG[item.type];
                const Icon = cfg?.icon || Search;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                      selected === i ? "bg-primary-500/15 border border-primary-500/20" : "hover:bg-white/5"
                    } animate-fade-in`}
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <div className={`w-8 h-8 rounded-lg ${cfg?.bg || "bg-gray-500/10"} flex items-center justify-center shrink-0`}>
                      <Icon size={14} className={cfg?.color || "text-gray-400"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      <p className="text-gray-500 text-xs capitalize truncate">{cfg?.label} · {item.sub}</p>
                    </div>
                    {selected === i && <ArrowRight size={14} className="text-primary-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5 text-xs text-gray-600">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
