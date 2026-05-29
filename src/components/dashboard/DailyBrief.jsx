import { useState, useCallback } from "react";
import { Sparkles, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";

const DailyBrief = ({ tasks = [], habits = [], events = [], userName = "there" }) => {
  const [brief,    setBrief]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    const overdue     = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "done");
    const todayTasks  = tasks.filter((t) => t.dueDate === today && t.status !== "done");
    const todayEvents = events.filter((e) => e.date === today);
    const habitsLeft  = habits.filter((h) => !(h.completedDates || []).includes(today));

    const prompt = `You are Nexora AI giving ${userName} a quick, motivating daily brief. Keep it under 80 words. Use 2-3 bullet points max. Be specific about the data below.

Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
Tasks due today: ${todayTasks.map((t) => t.title).join(", ") || "none"}
Overdue tasks: ${overdue.length}
Events today: ${todayEvents.map((e) => `${e.title}${e.time ? " at " + e.time : ""}`).join(", ") || "none"}
Habits remaining: ${habitsLeft.map((h) => h.title).join(", ") || "all done!"}

Write a punchy, friendly brief that starts with a short greeting using their name and today's context.`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 200,
          messages: [
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      setBrief(text);
    } catch (err) {
      setError("Couldn't load your brief. Check your connection.");
      console.error("DailyBrief error:", err);
    } finally {
      setLoading(false);
    }
  }, [tasks, habits, events, today, userName]);

  return (
    <div className="glass-card p-5 mb-5 relative overflow-hidden animate-slide-up"
      style={{ borderLeft: "3px solid var(--p500)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(var(--glow),0.08) 0%, transparent 70%)` }} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: "var(--p400)" }} className="animate-pulse-slow" />
          <h3 className="font-display font-semibold text-white text-sm">AI Daily Brief</h3>
        </div>
        <div className="flex gap-1">
          {brief && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
            aria-label="Refresh brief"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {!brief && !loading && !error && (
        <div className="text-center py-3">
          <p className="text-gray-500 text-sm mb-3">Get a personalised summary of your day</p>
          <button onClick={generate} className="btn-primary text-sm py-1.5 px-4 mx-auto">
            <Sparkles size={14} /> Generate brief
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 160}ms`, background: "var(--p400)", animationDuration: "0.8s" }} />
            ))}
          </div>
          <span className="text-gray-400 text-sm">Generating your brief…</span>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {brief && expanded && !loading && (
        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line animate-fade-in">
          {brief}
        </div>
      )}

      {brief && !expanded && (
        <p className="text-gray-500 text-xs">Click ↑ to expand</p>
      )}
    </div>
  );
};

export default DailyBrief;