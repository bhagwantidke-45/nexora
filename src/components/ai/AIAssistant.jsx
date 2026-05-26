import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Bot, Trash2, Copy, Check, Zap, RotateCcw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";

const SUGGESTIONS = [
  "Help me plan my week effectively",
  "Give me a productivity tip for today",
  "How can I build a morning routine?",
  "Suggest a study schedule for exams",
  "What's the best way to track my finances?",
  "Help me break down a big goal into steps",
  "How do I stop procrastinating?",
  "Give me a 30-day fitness challenge plan",
];

const SYSTEM_PROMPT = `You are Nexora AI — a smart, friendly personal productivity assistant built into the Nexora app. Nexora helps users manage tasks, habits, goals, finance, calendar, and records.

Your role:
- Help users plan, organize, and stay productive
- Give practical, actionable advice
- Keep responses concise but useful (use bullet points and structure when helpful)
- Be encouraging and motivating
- When relevant, suggest how Nexora's features (tasks, habits, goals, finance, focus timer) can help
- Use emojis sparingly for warmth

Never respond in a generic way. Always be specific and helpful.`;

/* ── Message Bubble ── */
const Bubble = ({ msg, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  /* Simple markdown-ish renderer */
  const renderContent = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-white mt-2 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith("## "))  return <h2 key={i} className="font-bold text-white text-lg mt-2 mb-1">{line.slice(3)}</h2>;
      if (line.startsWith("# "))   return <h1 key={i} className="font-bold text-white text-xl mt-2 mb-1">{line.slice(2)}</h1>;
      if (line.startsWith("- ") || line.startsWith("• "))
        return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
      if (line.startsWith("**") && line.endsWith("**"))
        return <p key={i} className="font-bold">{line.slice(2,-2)}</p>;
      if (line === "") return <br key={i} />;
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
        isUser ? "bg-primary-500/20" : "bg-gradient-to-br from-primary-500 to-violet-600 shadow-lg shadow-primary-500/25"
      }`}>
        {isUser ? <User size={14} className="text-primary-400" /> : <Sparkles size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] group relative ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary-600/30 text-white border border-primary-500/30 rounded-tr-md"
            : "glass-card text-gray-200 rounded-tl-md"
        }`}>
          {msg.content === "…" ? (
            <div className="flex gap-1 py-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
                  style={{ animationDelay:`${i*150}ms` }} />
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">{renderContent(msg.content)}</div>
          )}
        </div>

        {/* Copy button */}
        {msg.content !== "…" && !isUser && (
          <button onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity self-start ml-1 p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
        )}

        <span className="text-xs text-gray-600 px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
        </span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════ */
const AIAssistant = () => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey there! 👋 I'm **Nexora AI**, your personal productivity assistant.\n\nI can help you plan your day, set goals, build habits, manage your time, and much more. What would you like to work on today?",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages = [
      ...messages,
      { role: "user", content: userMsg, timestamp: Date.now() },
    ];
    setMessages(newMessages);
    setLoading(true);

    // Add typing indicator
    setMessages(m => [...m, { role: "assistant", content: "…", timestamp: Date.now() }]);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";

      setMessages(m => [
        ...m.slice(0, -1), // remove typing indicator
        { role: "assistant", content: reply, timestamp: Date.now() },
      ]);
    } catch (err) {
      setMessages(m => [
        ...m.slice(0, -1),
        { role: "assistant", content: "⚠️ Connection error. Please check your internet and try again.", timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! 🗑️ How can I help you?",
      timestamp: Date.now(),
    }]);
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} flex flex-col`}>
      <Navbar />
      <div className="pt-20 flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 pb-4">

        {/* Header */}
        <div className="flex items-center justify-between py-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/25 animate-float">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white">Nexora AI</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping-slow" />
                <span className="text-green-400 text-xs">Online</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="btn-secondary text-sm py-1.5 px-3">
            <RotateCcw size={14} /> Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 glass-card p-4 overflow-y-auto custom-scrollbar space-y-4 mb-4 min-h-[50vh] max-h-[60vh]">
          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 animate-slide-up">
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button key={s} onClick={() => send(s)}
                className="glass-card text-gray-400 hover:text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap hover:border-primary-500/30 transition-all shrink-0">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="glass-card p-3 flex items-end gap-3 animate-slide-up border border-white/10 focus-within:border-primary-500/40 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about productivity, planning, habits..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none resize-none text-sm leading-relaxed"
            style={{ maxHeight: "120px", overflowY: "auto" }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", boxShadow: "0 4px 15px rgba(168,85,247,0.4)" }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">Powered by Claude · Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default AIAssistant;
