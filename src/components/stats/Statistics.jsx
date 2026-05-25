import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, CheckSquare,
  Target, Calendar, Award
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";
import { db } from "../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const Statistics = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubTasks = onSnapshot(
      query(collection(db, "tasks"), where("userId", "==", user.uid)),
      (snap) => setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubHabits = onSnapshot(
      query(collection(db, "habits"), where("userId", "==", user.uid)),
      (snap) => setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubEvents = onSnapshot(
      query(collection(db, "events"), where("userId", "==", user.uid)),
      (snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );

    return () => { unsubTasks(); unsubHabits(); unsubEvents(); };
  }, [user]);

  // Task Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "inprogress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority Distribution
  const priorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "high").length },
    { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length },
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length },
  ].filter((d) => d.value > 0);

  // Status Distribution
  const statusData = [
    { name: "To Do", value: todoTasks, color: "#6b7280" },
    { name: "In Progress", value: inProgressTasks, color: "#f59e0b" },
    { name: "Done", value: completedTasks, color: "#10b981" },
  ].filter((d) => d.value > 0);

  // Last 7 Days Task Completion
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  const weeklyData = last7Days.map((day) => ({
    day: day.label,
    completed: tasks.filter(
      (t) => t.status === "done" && t.updatedAt?.toDate?.()?.toISOString?.()?.slice(0, 10) === day.date
    ).length,
    created: tasks.filter(
      (t) => t.createdAt?.toDate?.()?.toISOString?.()?.slice(0, 10) === day.date
    ).length,
  }));

  // Habit Stats
  const totalHabits = habits.length;
  const today = new Date().toISOString().slice(0, 10);
  const completedHabitsToday = habits.filter((h) =>
    (h.completedDates || []).includes(today)
  ).length;
  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + (h.streak || 0), 0) / habits.length)
    : 0;

  // Habit completion last 7 days
  const habitWeeklyData = last7Days.map((day) => ({
    day: day.label,
    completed: habits.filter((h) => (h.completedDates || []).includes(day.date)).length,
    total: habits.length,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statCards = [
    { label: "Total Tasks", value: totalTasks, icon: CheckSquare, color: "from-purple-500 to-primary-600" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "from-green-500 to-emerald-600" },
    { label: "Total Habits", value: totalHabits, icon: Target, color: "from-orange-500 to-amber-600" },
    { label: "Avg Streak", value: `${avgStreak}d`, icon: Award, color: "from-blue-500 to-cyan-600" },
    { label: "Events", value: events.length, icon: Calendar, color: "from-pink-500 to-rose-600" },
    { label: "Habits Today", value: `${completedHabitsToday}/${totalHabits}`, icon: CheckSquare, color: "from-teal-500 to-green-600" },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <BarChart2 size={24} className="text-primary-400" />
            Statistics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your productivity overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-slide-up">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-card p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-2xl font-display font-bold text-white">{card.value}</p>
                <p className="text-gray-400 text-sm">{card.label}</p>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Weekly Task Activity */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-4">Weekly Task Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
                  <Bar dataKey="created" name="Created" fill="#a855f7" radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Habit Completion + Task Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Habit Weekly */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-white mb-4">Daily Habit Completion</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={habitWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", r: 4 }} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Task Priority Distribution */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-white mb-4">Task Priority Distribution</h3>
                {priorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500 text-sm">No task data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task Status */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-4">Task Status Overview</h3>
              <div className="space-y-3">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-24 shrink-0">{s.name}</span>
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${totalTasks > 0 ? (s.value / totalTasks) * 100 : 0}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-8 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;