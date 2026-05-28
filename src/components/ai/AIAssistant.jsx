// AIAssistant.jsx — Uses Vite proxy to avoid CORS (Groq API)
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, RotateCcw, Copy, Check, AlertCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";

const SYSTEM_PROMPT = `You are Nexora AI — a smart, friendly personal productivity assistant built into the Nexora app. Nexora helps users manage tasks, habits, goals, finance, calendar, and records.
Your role:
- Help users plan, organize, and stay productive
- Give practical, actionable advice
- Keep responses concise (use bullets when helpful)
- Be encouraging and motivating
- Suggest how Nexora features can help when relevant
Never respond generically. Always be specific and helpful.`;

const SUGGESTIONS = [
  "Help me plan my week effectively",
  "Give me a productivity tip for today",
  "How can I build a morning routine?",
  "How do I stop procrastinating?",
  "Suggest a 30-day fitness challenge",
  "Help me break a big goal into steps",
];

const MAX_HISTORY = 20;
const RATE_LIMIT  = 10;

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
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([{
    role:"assistant",
    content:"Hey there! 👋 I'm **Nexora AI**, your personal productivity assistant.\n\nHow can I help you today?",
    timestamp:Date.now(),
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const msgTimestamps = useRef([]);
  const abortRef      = useRef(null);
  const bottomRef     = useRef(null);
  const textareaRef   = useRef(null);

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

    const newUserMsg = { role:"user", content:userMsg, timestamp:Date.now() };
    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setLoading(true);

    const placeholderId = Date.now();
    setMessages(m => [...m, { role:"assistant", content:"", timestamp:placeholderId }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const historyForAPI = updatedHistory
        .slice(-MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      // Groq uses OpenAI-compatible API format
      const response = await fetch("/api/groq/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...historyForAPI,
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data  = await response.json();
      // Groq returns OpenAI-style: choices[0].message.content
      const reply = data.choices?.[0]?.message?.content || "No response. Please try again.";

      setMessages(m => m.map(msg =>
        msg.timestamp === placeholderId
          ? { ...msg, content: reply }
          : msg
      ));

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
    setMessages([{ role:"assistant", content:"Chat cleared! 🗑️ How can I help you today?", timestamp:Date.now() }]);
    setError(null);
  };

  const showSuggestions = messages.length <= 2;

  return (
    <div className={`min-h-screen ${isDark?"bg-mesh":"bg-mesh-light"} flex flex-col`}>
      <Navbar />
      <div className="pt-20 flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 pb-24 lg:pb-6">

        {/* Header */}
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
                  style={{ background: loading ? "#f59e0b" : "#10b981" }} />
                <span className="text-xs" style={{ color: loading ? "#f59e0b" : "#10b981" }}>
                  {loading ? "Thinking…" : "Online · Powered by Groq"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="btn-secondary text-sm py-1.5 px-3">
            <RotateCcw size={14} /> Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 glass-card p-3 border-red-500/30 bg-red-500/8 flex items-center gap-2 animate-fade-in">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
          </div>
        )}

        {/* Messages */}
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

        {/* Suggestions */}
        {showSuggestions && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 animate-slide-up custom-scrollbar">
            {SUGGESTIONS.slice(0,4).map(s => (
              <button key={s} onClick={() => send(s)}
                className="glass-card text-gray-400 hover:text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap transition-all shrink-0 hover-lift">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="glass-card p-3 flex items-end gap-3 animate-slide-up transition-all duration-300"
          style={{ border:`1px solid rgba(var(--glow),0.15)` }}
          onFocusCapture={e => { e.currentTarget.style.border=`1px solid rgba(var(--glow),0.4)`; e.currentTarget.style.boxShadow=`0 0 0 3px rgba(var(--glow),0.08)`; }}
          onBlurCapture={e  => { e.currentTarget.style.border=`1px solid rgba(var(--glow),0.15)`; e.currentTarget.style.boxShadow="none"; }}>
          <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
            placeholder="Ask me anything about productivity, planning, habits..."
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