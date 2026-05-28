// Dashboard.jsx — CountUp stats, hover lift, staggered, theme-aware, skeletons
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare, Calendar, BookOpen, Target, AlertTriangle,
  Clock, TrendingUp, Plus, Bell, Star, DollarSign, Timer,
  Sparkles, Flag, Zap, ArrowRight, Flame, Award,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useAuth }  from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar       from "../shared/Navbar";
import { CountUp, SkeletonCard, SkeletonStat } from "../shared/PageTransition";
import { db } from "../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import DailyBrief from "./DailyBrief";


/* ── Quotes ── */
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
];

/* ── Mini Stat Card ── */
const MiniStat = ({ label, value, icon: Icon, gradient, link, delay = 0, animate = false }) => (
  <Link to={link}>
    <div
      className="glass-card-hover p-5 cursor-pointer animate-slide-up hover-lift"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient}
                       flex items-center justify-center mb-3 shadow-lg`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-display font-bold text-white">
        {animate
          ? <CountUp end={typeof value === "number" ? value : 0} suffix={typeof value === "string" && value.includes("d") ? "d" : ""} />
          : value
        }
      </p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  </Link>
);

/* ══════════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user }   = useAuth();
  const { isDark } = useTheme();

  const [tasks,        setTasks]        = useState([]);
  const [events,       setEvents]       = useState([]);
  const [records,      setRecords]      = useState([]);
  const [habits,       setHabits]       = useState([]);
  const [goals,        setGoals]        = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [quote,        setQuote]        = useState(QUOTES[0]);

  const today        = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid  = user.uid;
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 6) setLoading(false); };

    const u1 = onSnapshot(query(collection(db,"tasks"),        where("userId","==",uid)), s => { setTasks(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    const u2 = onSnapshot(query(collection(db,"events"),       where("userId","==",uid)), s => { setEvents(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    const u3 = onSnapshot(query(collection(db,"records"),      where("userId","==",uid)), s => { setRecords(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    const u4 = onSnapshot(query(collection(db,"habits"),       where("userId","==",uid)), s => { setHabits(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    const u5 = onSnapshot(query(collection(db,"goals"),        where("userId","==",uid)), s => { setGoals(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    const u6 = onSnapshot(query(collection(db,"transactions"), where("userId","==",uid)), s => { setTransactions(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });

    return () => { u1(); u2(); u3(); u4(); u5(); u6(); };
  }, [user]);

  /* Computed */
  const completedTasks  = tasks.filter(t => t.status === "done").length;
  const overdueTasks    = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done");
  const todayTasks      = tasks.filter(t => t.dueDate === today && t.status !== "done");
  const completionRate  = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const upcomingEvents  = events.filter(e => e.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0,4);
  const pinnedRecords   = records.filter(r => r.pinned).slice(0,3);
  const habitsToday     = habits.filter(h => (h.completedDates||[]).includes(today)).length;
  const upcomingDates   = records.filter(r =>
    r.type==="date" && r.date && r.date >= today &&
    r.date <= new Date(Date.now()+7*86400000).toISOString().slice(0,10)
  );
  const goalsDone       = goals.filter(g => g.progress === 100).length;
  const avgGoalProgress = goals.length ? Math.round(goals.reduce((s,g)=>s+(g.progress||0),0)/goals.length) : 0;
  const maxStreak       = habits.length ? Math.max(...habits.map(h=>h.streak||0)) : 0;

  const monthTx      = transactions.filter(t => t.date?.startsWith(currentMonth));
  const monthIncome  = monthTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const monthExpense = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const netBalance   = monthIncome - monthExpense;

  const miniStats = [
    { label:"Total Tasks",  value: tasks.length,        icon: CheckSquare,   gradient:"from-purple-500 to-primary-600", link:"/tasks",   delay:0,   animate:true },
    { label:"Completed",    value: completedTasks,      icon: TrendingUp,    gradient:"from-green-500 to-emerald-600",  link:"/tasks",   delay:60,  animate:true },
    { label:"Overdue",      value: overdueTasks.length, icon: AlertTriangle, gradient:"from-red-500 to-rose-600",       link:"/tasks",   delay:120, animate:true },
    { label:"Events Ahead", value: upcomingEvents.length,icon: Calendar,     gradient:"from-blue-500 to-cyan-600",      link:"/calendar",delay:180, animate:true },
    { label:"Goals",        value: goals.length,        icon: Flag,          gradient:"from-amber-500 to-orange-600",   link:"/goals",   delay:240, animate:true },
    { label:"Habit Streak", value: `${maxStreak}d`,     icon: Flame,         gradient:"from-rose-500 to-pink-600",      link:"/habits",  delay:300, animate:false },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
        <Navbar />
        <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
          <div className="h-10 w-72 skeleton rounded-xl mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {Array.from({length:6}).map((_,i) => <SkeletonStat key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {Array.from({length:3}).map((_,i) => <SkeletonCard key={i} rows={4} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} pb-24 lg:pb-10`}>
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">

        {/* ── Greeting ── */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-white">
            {greeting()},{" "}
            <span className="text-gradient">
              {user?.displayName?.split(" ")[0] || "there"}
            </span>{" "}👋
          </h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday:"long", year:"numeric", month:"long", day:"numeric"
            })}
          </p>
        </div>

        {/* ── Quote ── */}
        <div
          className="glass-card p-5 mb-6 relative overflow-hidden animate-slide-up hover-lift"
          style={{ borderLeft: `4px solid var(--p500)` }}
        >
          <div className="absolute top-2 right-3 text-6xl font-display font-bold select-none"
            style={{ color: "rgba(var(--glow),0.08)" }}>"</div>
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="shrink-0 mt-0.5 animate-pulse-slow"
              style={{ color: "var(--p400)" }} />
            <div>
              <p className="text-white text-sm font-medium italic">"{quote.text}"</p>
              <p className="text-gray-500 text-xs mt-1">— {quote.author}</p>
            </div>
          </div>
          <DailyBrief
  tasks={tasks}
  habits={habits}
  events={events}
  userName={user?.displayName?.split(" ")[0]}
/>
        </div>

        {/* ── Alerts ── */}
        {(overdueTasks.length > 0 || upcomingDates.length > 0) && (
          <div className="mb-6 space-y-2 animate-slide-up">
            {overdueTasks.length > 0 && (
              <div className="glass-card p-4 border-red-500/30 bg-red-500/8
                              flex items-center gap-3 animate-fade-in">
                <AlertTriangle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-300 text-sm flex-1">
                  <span className="font-semibold">{overdueTasks.length}</span>{" "}
                  overdue task{overdueTasks.length > 1 ? "s" : ""}!
                </p>
                <Link to="/tasks"
                  className="text-red-400 text-xs hover:text-red-300 flex items-center gap-1">
                  View <ArrowRight size={12} />
                </Link>
              </div>
            )}
            {upcomingDates.map(d => (
              <div key={d.id}
                className="glass-card p-4 border-yellow-500/30 bg-yellow-500/8
                           flex items-center gap-3 animate-fade-in">
                <Bell size={16} className="text-yellow-400 shrink-0 animate-pulse-slow" />
                <p className="text-yellow-300 text-sm flex-1">
                  <span className="font-semibold">{d.title}</span> is coming up on{" "}
                  {new Date(d.date+"T00:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}!
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Mini Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {miniStats.map(s => <MiniStat key={s.label} {...s} />)}
        </div>

        {/* ── Row 1: Progress Ring + Today Tasks + Finance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Progress Ring */}
          <div className="glass-card p-6 animate-slide-up stagger-1 hover-lift">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} style={{ color:"var(--p400)" }} /> Completion
            </h3>
            <div className="flex items-center justify-center mb-3">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 progress-ring" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke="url(#dash-grad)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*50}`}
                    strokeDashoffset={`${2*Math.PI*50*(1-completionRate/100)}`}
                    style={{ transition:"stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)" }}
                  />
                  <defs>
                    <linearGradient id="dash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="var(--grad1)" />
                      <stop offset="100%" stopColor="var(--grad2)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-display font-bold text-white">
                    <CountUp end={completionRate} suffix="%" duration={1200} />
                  </span>
                  <span className="text-xs text-gray-400">Done</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 text-xs">
              {completedTasks} of {tasks.length} tasks
            </p>

            {/* Habit mini bar */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400 flex items-center gap-1">
                  <Flame size={11} className="text-orange-400" /> Habits today
                </span>
                <span className="text-white font-medium">{habitsToday}/{habits.length}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${habits.length > 0 ? (habitsToday/habits.length)*100 : 0}%`,
                    background: "linear-gradient(90deg,#f97316,#f59e0b)",
                  }}
                />
              </div>
            </div>

            {/* Goals mini bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400 flex items-center gap-1">
                  <Flag size={11} className="text-amber-400" /> Goals avg
                </span>
                <span className="text-white font-medium">{avgGoalProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:`${avgGoalProgress}%`,
                    background:"linear-gradient(90deg,#f59e0b,#f97316)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Today Tasks */}
          <div className="glass-card p-6 animate-slide-up stagger-2 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Clock size={16} style={{ color:"var(--p400)" }} /> Today's Tasks
              </h3>
              <Link to="/tasks"
                className="text-xs hover:opacity-70 flex items-center gap-1 transition-opacity"
                style={{ color:"var(--p400)" }}>
                All <ArrowRight size={11} />
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckSquare size={28} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">All clear for today! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0,5).map((task, i) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl
                               bg-white/5 hover:bg-white/10 transition-all
                               animate-slide-up"
                    style={{ animationDelay:`${i*50}ms` }}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      task.priority==="high" ? "bg-red-400"
                      : task.priority==="medium" ? "bg-yellow-400"
                      : "bg-green-400"
                    }`} />
                    <p className="text-white text-xs flex-1 truncate">{task.title}</p>
                    <span className={
                      task.priority==="high" ? "badge-high"
                      : task.priority==="medium" ? "badge-medium"
                      : "badge-low"
                    }>{task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Finance Widget */}
          <div className="glass-card p-6 animate-slide-up stagger-3 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <DollarSign size={16} style={{ color:"var(--p400)" }} /> This Month
              </h3>
              <Link to="/finance"
                className="text-xs hover:opacity-70 flex items-center gap-1 transition-opacity"
                style={{ color:"var(--p400)" }}>
                Detail <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl
                              bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={14} className="text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Income</span>
                </div>
                <span className="text-green-400 font-bold text-sm">
                  ₹{monthIncome.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl
                              bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <ArrowDownRight size={14} className="text-red-400" />
                  <span className="text-red-400 text-xs font-medium">Expense</span>
                </div>
                <span className="text-red-400 font-bold text-sm">
                  ₹{monthExpense.toLocaleString("en-IN")}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                netBalance >= 0
                  ? "bg-primary-500/10 border-primary-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}>
                <span className="text-gray-300 text-xs font-medium">Net Balance</span>
                <span className={`font-bold text-sm ${netBalance >= 0 ? "" : "text-red-400"}`}
                  style={netBalance >= 0 ? { color:"var(--p400)" } : {}}>
                  {netBalance >= 0 ? "+" : ""}₹{netBalance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Events + Pinned + Goals ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Upcoming Events */}
          <div className="glass-card p-6 animate-slide-up stagger-1 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Calendar size={16} style={{ color:"var(--p400)" }} /> Upcoming
              </h3>
              <Link to="/calendar"
                className="text-xs hover:opacity-70 flex items-center gap-1"
                style={{ color:"var(--p400)" }}>
                All <ArrowRight size={11} />
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <Calendar size={28} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((ev, i) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl
                               bg-white/5 hover:bg-white/10 transition-all
                               animate-fade-in"
                    style={{ animationDelay:`${i*40}ms` }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex flex-col items-center
                                 justify-center shrink-0"
                      style={{
                        backgroundColor: `${ev.color}20`,
                        border:`1px solid ${ev.color}40`,
                      }}
                    >
                      <span className="text-xs font-bold leading-none" style={{ color:ev.color }}>
                        {new Date(ev.date).toLocaleDateString("en-US",{day:"numeric"})}
                      </span>
                      <span className="text-xs leading-none" style={{ color:ev.color }}>
                        {new Date(ev.date).toLocaleDateString("en-US",{month:"short"})}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-medium truncate">{ev.title}</p>
                      <p className="text-gray-500 text-xs">{ev.time || "All day"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pinned Records */}
          <div className="glass-card p-6 animate-slide-up stagger-2 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Star size={16} style={{ color:"var(--p400)" }} /> Pinned
              </h3>
              <Link to="/records"
                className="text-xs hover:opacity-70 flex items-center gap-1"
                style={{ color:"var(--p400)" }}>
                All <ArrowRight size={11} />
              </Link>
            </div>
            {pinnedRecords.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen size={28} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No pinned records</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pinnedRecords.map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl
                               bg-white/5 hover:bg-white/10 transition-all
                               animate-fade-in"
                    style={{ animationDelay:`${i*40}ms` }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background:"rgba(var(--glow),0.2)" }}
                    >
                      <BookOpen size={12} style={{ color:"var(--p400)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{r.title}</p>
                      <p className="text-gray-500 text-xs capitalize">{r.type}</p>
                    </div>
                    <Star size={11} className="text-yellow-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals Preview */}
          <div className="glass-card p-6 animate-slide-up stagger-3 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Flag size={16} style={{ color:"var(--p400)" }} /> Goals
              </h3>
              <Link to="/goals"
                className="text-xs hover:opacity-70 flex items-center gap-1"
                style={{ color:"var(--p400)" }}>
                All <ArrowRight size={11} />
              </Link>
            </div>
            {goals.length === 0 ? (
              <div className="text-center py-6">
                <Target size={28} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No goals yet</p>
                <Link to="/goals"
                  className="text-xs mt-1 flex items-center justify-center gap-1
                             hover:opacity-70 transition-opacity"
                  style={{ color:"var(--p400)" }}>
                  <Plus size={11} /> Set a goal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0,3).map((g, i) => (
                  <div
                    key={g.id}
                    className="animate-fade-in"
                    style={{ animationDelay:`${i*50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-medium truncate flex-1 mr-2">
                        {g.icon} {g.title}
                      </span>
                      <span className="text-xs font-bold shrink-0"
                        style={{ color:"var(--p400)" }}>
                        {g.progress||0}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:`${g.progress||0}%`,
                          background:`linear-gradient(90deg, var(--grad1), var(--grad2))`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3: Focus + AI shortcuts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-slide-up stagger-4">

          {/* Focus shortcut */}
          <div className="glass-card p-6 relative overflow-hidden group hover-lift">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background:`linear-gradient(135deg, rgba(var(--glow),0.06), transparent)` }}
            />
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Timer size={16} style={{ color:"var(--p400)" }} /> Focus Timer
                </h3>
                <p className="text-gray-500 text-xs mt-1">Ready to enter deep work mode?</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center animate-float"
                style={{ background:"rgba(var(--glow),0.15)" }}
              >
                <Zap size={18} style={{ color:"var(--p400)" }} />
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/focus" className="btn-primary text-sm py-2 flex-1 justify-center">
                <Timer size={15} /> Start 25 min
              </Link>
              <Link to="/focus" className="btn-secondary text-sm py-2 px-4">
                Custom
              </Link>
            </div>
          </div>

          {/* AI shortcut */}
          <div className="glass-card p-6 relative overflow-hidden group hover-lift">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background:`linear-gradient(135deg, rgba(var(--glow),0.06), transparent)` }}
            />
            <div className="absolute top-3 right-3 w-20 h-20 rounded-full blur-xl"
              style={{ background:"rgba(var(--glow),0.05)" }} />
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <Sparkles size={16} style={{ color:"var(--p400)" }} /> Nexora AI
                </h3>
                <p className="text-gray-500 text-xs mt-1">Your personal productivity assistant</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center
                           shadow-lg animate-float"
                style={{
                  background:`linear-gradient(135deg, var(--grad1), var(--grad2))`,
                  boxShadow:`0 4px 16px rgba(var(--glow),0.35)`,
                  animationDelay:"1s",
                }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
            <Link to="/ai" className="btn-primary text-sm py-2 w-full justify-center">
              <Sparkles size={15} /> Chat with AI Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/tasks"
        className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 rounded-2xl
                   flex items-center justify-center shadow-primary
                   hover:shadow-primary-lg hover:scale-110 transition-all
                   duration-200 animate-float z-30"
        style={{
          background:`linear-gradient(135deg, var(--grad1), var(--grad2))`,
          boxShadow:`0 8px 24px rgba(var(--glow),0.45)`,
          animationDelay:"0.5s",
        }}
      >
        <Plus size={24} className="text-white" />
      </Link>
    </div>
  );
};

export default Dashboard;