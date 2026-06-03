import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, RotateCcw, Copy, Check, AlertCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../shared/Navbar";
import { getTasksRealtime } from "../../firebase/tasks";
import { getEventsRealtime } from "../../firebase/calendar";
import { getHabitsRealtime } from "../../firebase/habits";
import { getGoalsRealtime } from "../../firebase/goals";
import { getTransactionsRealtime } from "../../firebase/finance";
import { getRecordsRealtime } from "../../firebase/records";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const MAX_HISTORY  = 20;
const RATE_LIMIT   = 10;

const buildSystemPrompt = (appData) => {
  const today = new Date().toISOString().slice(0, 10);
  const now   = new Date();

  const { tasks = [], habits = [], goals = [], events = [], transactions = [], records = [] } = appData;

  // Tasks analysis
  const pendingTasks  = tasks.filter(t => t.status !== "done");
  const overdueTasks  = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done");
  const todayTasks    = tasks.filter(t => t.dueDate === today && t.status !== "done");
  const inProgress    = tasks.filter(t => t.status === "inprogress");
  const completedTasks= tasks.filter(t => t.status === "done");
  const highPriority  = pendingTasks.filter(t => t.priority === "high");

  // Habits analysis
  const habitsToday   = habits.filter(h => (h.completedDates || []).includes(today));
  const habitsPending = habits.filter(h => !(h.completedDates || []).includes(today));

  // Goals analysis
  const activeGoals   = goals.filter(g => g.progress < 100);
  const completedGoals= goals.filter(g => g.progress === 100);

  // Events analysis
  const upcomingEvents= events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);
  const todayEvents   = events.filter(e => e.date === today);

  // Finance analysis
  const currentMonth  = now.toISOString().slice(0, 7);
  const monthTx       = transactions.filter(t => t.date?.startsWith(currentMonth));
  const monthIncome   = monthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense  = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return `You are Nexora AI — a smart personal productivity assistant. You have FULL ACCESS to the user's live app data below. Always answer based on this real data — never say you don't have access to their data.

TODAY: ${today} (${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })})

═══ TASKS (${tasks.length} total) ═══
• Pending: ${pendingTasks.length} | Completed: ${completedTasks.length} | In Progress: ${inProgress.length}
• OVERDUE (${overdueTasks.length}): ${overdueTasks.map(t => `"${t.title}" [${t.priority}] due ${t.dueDate}`).join(", ") || "none"}
• DUE TODAY (${todayTasks.length}): ${todayTasks.map(t => `"${t.title}" [${t.priority}]`).join(", ") || "none"}
• IN PROGRESS (${inProgress.length}): ${inProgress.map(t => `"${t.title}"`).join(", ") || "none"}
• HIGH PRIORITY pending (${highPriority.length}): ${highPriority.map(t => `"${t.title}" due ${t.dueDate || "no date"}`).join(", ") || "none"}
• All pending tasks: ${pendingTasks.map(t => `"${t.title}" [${t.status}/${t.priority}] due:${t.dueDate || "none"}`).join("; ") || "none"}

═══ HABITS (${habits.length} total) ═══
• Done today (${habitsToday.length}): ${habitsToday.map(h => h.title).join(", ") || "none"}
• Still pending today (${habitsPending.length}): ${habitsPending.map(h => `"${h.title}" streak:${h.streak || 0}d`).join(", ") || "none"}

═══ GOALS (${goals.length} total) ═══
• Active (${activeGoals.length}): ${activeGoals.map(g => `"${g.title}" ${g.progress || 0}% [${g.category}] deadline:${g.deadline || "none"}`).join("; ") || "none"}
• Completed (${completedGoals.length}): ${completedGoals.map(g => g.title).join(", ") || "none"}

═══ CALENDAR ═══
• Today's events (${todayEvents.length}): ${todayEvents.map(e => `"${e.title}" ${e.time || "all-day"}`).join(", ") || "none"}
• Upcoming events: ${upcomingEvents.map(e => `"${e.title}" on ${e.date}${e.time ? " at " + e.time : ""}`).join("; ") || "none"}

═══ FINANCE (${currentMonth}) ═══
• Income: ₹${monthIncome.toLocaleString("en-IN")} | Expense: ₹${monthExpense.toLocaleString("en-IN")} | Balance: ₹${(monthIncome - monthExpense).toLocaleString("en-IN")}
• Total transactions this month: ${monthTx.length}

═══ RECORDS (${records.length} total) ═══
• Pinned: ${records.filter(r => r.pinned).map(r => `"${r.title}" [${r.type}]`).join(", ") || "none"}
• Upcoming dates: ${records.filter(r => r.type === "date" && r.date >= today).map(r => `"${r.title}" on ${r.date}`).join(", ") || "none"}

═══ INSTRUCTIONS ═══
- Answer questions about their data directly and specifically using the data above
- When asked about pending/overdue tasks, list them by name
- Be concise, use bullet points for lists
- Be encouraging and actionable
- If asked what to focus on, prioritize: overdue → due today → high priority → in progress`;
};

const renderContent = (text) =>
  text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-white mt-3 mb-1 text-sm">{line.slice(4)}</h3>;
    if (line.startsWith("## "))  return <h2 key={i} className="font-bold text-white mt-3 mb-1">{line.slice(3)}</h2>;
    if (line.startsWith("- ") || line.startsWith("• "))
      return (
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--p400)" }} />
          <span>{line.slice(2)}</span>
        </div>
      );
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="leading-relaxed">{line}</p>;
  });

const TypingDots = () => (
  <div className="flex gap-1.5 py-1 px-1">
    {[0,1,2].map(i => (
      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
        style={{ animationDelay:`${i*160}ms`, background:"var(--p400)", animationDuration:"0.8s" }} />
    ))}
  </div>
);

const Bubble = ({ msg }) => {
  const [copied, setCopied] = useState(false);
  const isUser   = msg.role === "user";
  const isTyping = msg.content === "";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
        style={isUser
          ? { background:"rgba(var(--glow),0.15)", border:"1px solid rgba(var(--glow),0.2)" }
          : { background:`linear-gradient(135deg,var(--grad1),var(--grad2))`, boxShadow:`0 4px 12px rgba(var(--glow),0.3)` }
        }>
        {isUser ? <User size={14} style={{color:"var(--p400)"}} /> : <Sparkles size={14} className="text-white" />}
      </div>
      <div className={`max-w-[80%] group flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "rounded-tr-md" : "rounded-tl-md glass-card"}`}
          style={isUser ? {
            background:`linear-gradient(135deg,rgba(var(--glow),0.25),rgba(var(--glow),0.15))`,
            border:`1px solid rgba(var(--glow),0.25)`, color:"#fff",
          } : { color:"#e5e7eb" }}>
          {isTyping
            ? <TypingDots />
            : isUser
              ? <p className="leading-relaxed">{msg.content}</p>
              : <div className="space-y-0.5">{renderContent(msg.content)}</div>
          }
        </div>
        <div className={`flex items-center gap-2 ${isUser?"flex-row-reverse":""}`}>
          <span className="text-xs text-gray-600">
            {new Date(msg.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
          </span>
          {!isTyping && !isUser && (
            <button onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AIAssistant = () => {
  const { isDark }  = useTheme();
  const { user }    = useAuth();
  const [messages, setMessages] = useState([{
    role:"assistant",
    content:"Hey there! 👋 I'm **Nexora AI**, your personal productivity assistant.\n\nI have access to all your tasks, habits, goals, events, and finances. Ask me anything — like \"what's overdue?\", \"summarize my day\", or \"what should I focus on?\"",
    timestamp:Date.now(),
  }]);
  const [input,    setInput]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState(null);
  const [appData,  setAppData] = useState({ tasks:[], habits:[], goals:[], events:[], transactions:[], records:[] });
  const [dataLoaded, setDataLoaded] = useState(false);

  const msgTimestamps = useRef([]);
  const abortRef      = useRef(null);
  const bottomRef     = useRef(null);
  const textareaRef   = useRef(null);

  // Load all user data
  useEffect(() => {
    if (!user) return;
    const store = {};
    let count = 0;
    const total = 6;
    const tryDone = () => { count++; if (count >= total) setDataLoaded(true); };
    const update  = (key, data) => { store[key] = data; setAppData({ ...store }); tryDone(); };

    const u1 = getTasksRealtime(user.uid,        d => update("tasks", d));
    const u2 = getHabitsRealtime(user.uid,        d => update("habits", d));
    const u3 = getGoalsRealtime(user.uid,         d => update("goals", d));
    const u4 = getEventsRealtime(user.uid,        d => update("events", d));
    const u5 = getTransactionsRealtime(user.uid,  d => update("transactions", d));
    const u6 = getRecordsRealtime(user.uid,       d => update("records", d));

    return () => { u1(); u2(); u3(); u4(); u5(); u6(); };
  }, [user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const checkRateLimit = () => {
    const now = Date.now();
    msgTimestamps.current = msgTimestamps.current.filter(t => now-t < 60000);
    if (msgTimestamps.current.length >= RATE_LIMIT) return false;
    msgTimestamps.current.push(now);
    return true;
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const send = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    if (!checkRateLimit()) { setError("Too many messages. Wait a moment."); return; }

    setInput("");
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newUserMsg    = { role:"user", content:userMsg, timestamp:Date.now() };
    const placeholderId = Date.now() + 1;
    const placeholder   = { role:"assistant", content:"", timestamp:placeholderId };
    const historyForAPI = [...messages, newUserMsg].slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));

    setMessages(m => [...m, newUserMsg, placeholder]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 1024,
          messages: [
            { role: "system", content: buildSystemPrompt(appData) },
            ...historyForAPI,
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data  = await response.json();
      const reply = data.choices?.[0]?.message?.content || "No response. Please try again.";

      setMessages(m => m.map(msg => msg.timestamp === placeholderId ? { ...msg, content: reply } : msg));
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Connection failed. Check your API key.");
      setMessages(m => m.filter(msg => msg.timestamp !== placeholderId));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{ role:"assistant", content:"Chat cleared! 🗑️ I still have access to all your data. What would you like to know?", timestamp:Date.now() }]);
    setError(null);
  };

  const SUGGESTIONS = [
    "What tasks are overdue?",
    "Summarize my day",
    "What should I focus on today?",
    "How are my habits going?",
    "Show my goal progress",
    "What's my financial status this month?",
  ];

  const showSuggestions = messages.length <= 2;

  return (
    <div className={`min-h-screen ${isDark?"bg-mesh":"bg-mesh-light"} flex flex-col`}>
      <Navbar />
      <div className="pt-20 flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 pb-24 lg:pb-6">

        <div className="flex items-center justify-between py-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg animate-float"
              style={{ background:`linear-gradient(135deg,var(--grad1),var(--grad2))`, boxShadow:`0 4px 20px rgba(var(--glow),0.4)`, animationDuration:"4s" }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white">Nexora AI</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-ping-slow"
                  style={{ background: loading ? "#f59e0b" : dataLoaded ? "#10b981" : "#f59e0b" }} />
                <span className="text-xs" style={{ color: loading ? "#f59e0b" : dataLoaded ? "#10b981" : "#f59e0b" }}>
                  {loading ? "Thinking…" : dataLoaded ? `Online · ${appData.tasks.length} tasks loaded` : "Loading your data…"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="btn-secondary text-sm py-1.5 px-3">
            <RotateCcw size={14} /> Clear
          </button>
        </div>

        {error && (
          <div className="mb-3 glass-card p-3 border-red-500/30 bg-red-500/8 flex items-center gap-2 animate-fade-in">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
          </div>
        )}

        <div className="flex-1 glass-card p-4 overflow-y-auto custom-scrollbar space-y-4 mb-4 min-h-[50vh] max-h-[58vh]">
          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`linear-gradient(135deg,var(--grad1),var(--grad2))` }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-md">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {showSuggestions && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 animate-slide-up custom-scrollbar">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="glass-card text-gray-400 hover:text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap transition-all shrink-0 hover-lift">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="glass-card p-3 flex items-end gap-3 animate-slide-up transition-all duration-300"
          style={{ border:`1px solid rgba(var(--glow),0.15)` }}
          onFocusCapture={e => { e.currentTarget.style.border=`1px solid rgba(var(--glow),0.4)`; e.currentTarget.style.boxShadow=`0 0 0 3px rgba(var(--glow),0.08)`; }}
          onBlurCapture={e  => { e.currentTarget.style.border=`1px solid rgba(var(--glow),0.15)`; e.currentTarget.style.boxShadow="none"; }}>
          <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
            placeholder="Ask about your tasks, habits, goals, finances…"
            rows={1} disabled={loading}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none resize-none text-sm leading-relaxed disabled:opacity-50"
            style={{ maxHeight:"120px", overflowY:"auto" }} />
          <button onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            style={{ background:`linear-gradient(135deg,var(--grad1),var(--grad2))`, boxShadow:`0 4px 15px rgba(var(--glow),0.4)` }}>
            <Send size={15} className="text-white" />
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-2">
          Powered by Groq · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;