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

    const overdue     = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done");
    const todayTasks  = tasks.filter(t => t.dueDate === today && t.status !== "done");
    const inProgress  = tasks.filter(t => t.status === "inprogress");
    const highPrio    = tasks.filter(t => t.priority === "high" && t.status !== "done");
    const todayEvents = events.filter(e => e.date === today);
    const habitsLeft  = habits.filter(h => !(h.completedDates || []).includes(today));
    const habitsDone  = habits.filter(h => (h.completedDates || []).includes(today));

    const prompt = `Write a concise, actionable daily brief for ${userName}. Max 80 words. Use 3-4 bullet points. Be specific — use the EXACT task/habit/event names below.

DATE: ${new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}

OVERDUE (${overdue.length}): ${overdue.map(t => `"${t.title}"`).join(", ") || "none"}
DUE TODAY (${todayTasks.length}): ${todayTasks.map(t => `"${t.title}" [${t.priority}]`).join(", ") || "none"}
IN PROGRESS (${inProgress.length}): ${inProgress.map(t => `"${t.title}"`).join(", ") || "none"}
HIGH PRIORITY pending: ${highPrio.map(t => `"${t.title}"`).join(", ") || "none"}
TODAY'S EVENTS (${todayEvents.length}): ${todayEvents.map(e => `"${e.title}"${e.time ? " at "+e.time : ""}`).join(", ") || "none"}
HABITS PENDING (${habitsLeft.length}): ${habitsLeft.map(h => h.title).join(", ") || "all done!"}
HABITS DONE (${habitsDone.length}): ${habitsDone.map(h => h.title).join(", ") || "none yet"}

Rules: start with a 1-line greeting using their name + date context, then specific bullets. If there are overdue tasks, flag them urgently. End with one motivating sentence.`;

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
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setBrief(data.choices?.[0]?.message?.content || "");
    } catch (err) {
      setError("Couldn't load your brief. Check your connection.");
      console.error("DailyBrief error:", err);
    } finally {
      setLoading(false);
    }
  }, [tasks, habits, events, today, userName]);

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: "var(--p400)" }} className="animate-pulse-slow" />
          <span className="text-xs font-medium text-white">AI Daily Brief</span>
        </div>
        <div className="flex gap-1">
          {brief && (
            <button onClick={() => setExpanded(e => !e)}
              className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
          <button onClick={generate} disabled={loading}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
            title="Generate brief">
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {!brief && !loading && !error && (
        <button onClick={generate}
          className="text-xs flex items-center gap-1.5 transition-colors hover:opacity-80"
          style={{ color: "var(--p400)" }}>
          <Sparkles size={11} /> Generate AI summary of your day
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ animationDelay:`${i*160}ms`, background:"var(--p400)", animationDuration:"0.8s" }} />
          ))}
          <span className="text-gray-500 text-xs">Analysing your data…</span>
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {brief && expanded && !loading && (
        <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-line animate-fade-in">
          {brief}
        </div>
      )}

      {brief && !expanded && (
        <p className="text-gray-600 text-xs cursor-pointer hover:text-gray-400" onClick={() => setExpanded(true)}>
          Tap to expand brief ↑
        </p>
      )}
    </div>
  );
};

export default DailyBrief;