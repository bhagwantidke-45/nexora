import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  Calendar,
  BookOpen,
  Target,
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  Bell,
  Star,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [records, setRecords] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    if (!user) return;

    // Fetch Tasks
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Fetch Events
    const eventsQuery = query(
      collection(db, "events"),
      where("userId", "==", user.uid)
    );
    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Fetch Records
    const recordsQuery = query(
      collection(db, "records"),
      where("userId", "==", user.uid)
    );
    const unsubRecords = onSnapshot(recordsQuery, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Fetch Habits
    const habitsQuery = query(
      collection(db, "habits"),
      where("userId", "==", user.uid)
    );
    const unsubHabits = onSnapshot(habitsQuery, (snap) => {
      setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubTasks();
      unsubEvents();
      unsubRecords();
      unsubHabits();
    };
  }, [user]);

  // Computed Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate < today && t.status !== "done"
  );
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today && t.status !== "done"
  );
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const pinnedRecords = records.filter((r) => r.pinned).slice(0, 3);
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming important dates (within 7 days)
  const upcomingDates = records
    .filter((r) => r.type === "date" && r.date)
    .filter((r) => {
      const diff =
        new Date(r.date) - new Date(today);
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });

  const statCards = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: CheckSquare,
      color: "from-purple-500 to-primary-600",
      link: "/tasks",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      link: "/tasks",
    },
    {
      label: "Overdue",
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-600",
      link: "/tasks",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "from-blue-500 to-cyan-600",
      link: "/calendar",
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />

      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-white">
            {greeting()},{" "}
            <span className="text-gradient">
              {user?.displayName?.split(" ")[0] || "there"}
            </span>{" "}
            👋
          </h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Alerts */}
        {(overdueTasks.length > 0 || upcomingDates.length > 0) && (
          <div className="mb-6 space-y-3 animate-slide-up">
            {overdueTasks.length > 0 && (
              <div className="glass-card p-4 border-red-500/30 bg-red-500/10 flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">
                  You have{" "}
                  <span className="font-semibold">{overdueTasks.length}</span>{" "}
                  overdue task{overdueTasks.length > 1 ? "s" : ""}! Please review them.
                </p>
                <Link to="/tasks" className="ml-auto text-red-400 text-sm hover:text-red-300 shrink-0">
                  View →
                </Link>
              </div>
            )}
            {upcomingDates.map((d) => (
              <div key={d.id} className="glass-card p-4 border-yellow-500/30 bg-yellow-500/10 flex items-center gap-3">
                <Bell size={18} className="text-yellow-400 shrink-0" />
                <p className="text-yellow-300 text-sm">
                  <span className="font-semibold">{d.title}</span> is coming up on{" "}
                  {new Date(d.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}!
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} to={card.link}>
                <div className="glass-card-hover p-5 cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <p className="text-2xl font-display font-bold text-white">{card.value}</p>
                  <p className="text-gray-400 text-sm">{card.label}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Progress Ring + Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Progress */}
          <div className="glass-card p-6 animate-slide-up">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-400" />
              Completion Rate
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#gradient)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-display font-bold text-white">{completionRate}%</span>
                  <span className="text-xs text-gray-400">Done</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 text-sm mt-3">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>

          {/* Today's Tasks */}
          <div className="glass-card p-6 lg:col-span-2 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Clock size={18} className="text-primary-400" />
                Today's Tasks
              </h3>
              <Link to="/tasks" className="text-primary-400 text-sm hover:text-primary-300">
                View all →
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No tasks for today! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      task.priority === "high" ? "bg-red-400" :
                      task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                    }`} />
                    <p className="text-white text-sm flex-1 truncate">{task.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high" ? "badge-high" :
                      task.priority === "medium" ? "badge-medium" : "badge-low"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events + Pinned Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Upcoming Events */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Calendar size={18} className="text-primary-400" />
                Upcoming Events
              </h3>
              <Link to="/calendar" className="text-primary-400 text-sm hover:text-primary-300">
                View all →
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming events!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                      style={{ backgroundColor: event.color + "20", border: `1px solid ${event.color}40` }}>
                      <span className="text-xs font-bold" style={{ color: event.color }}>
                        {new Date(event.date).toLocaleDateString("en-US", { day: "numeric" })}
                      </span>
                      <span className="text-xs" style={{ color: event.color }}>
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{event.title}</p>
                      <p className="text-gray-400 text-xs">{event.time || "All day"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pinned Records */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Star size={18} className="text-primary-400" />
                Pinned Records
              </h3>
              <Link to="/records" className="text-primary-400 text-sm hover:text-primary-300">
                View all →
              </Link>
            </div>
            {pinnedRecords.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No pinned records!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pinnedRecords.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-primary-600/30 flex items-center justify-center shrink-0">
                      <BookOpen size={14} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{record.title}</p>
                      <p className="text-gray-400 text-xs capitalize">{record.type}</p>
                    </div>
                    <Star size={14} className="text-yellow-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions FAB */}
        <Link
          to="/tasks"
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-110 transition-all duration-200"
        >
          <Plus size={24} className="text-white" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;