import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, CheckSquare,
  Target, Calendar, Award,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth }   from "../../context/AuthContext";
import { useTheme }  from "../../context/ThemeContext";
import Navbar        from "../shared/Navbar";
import EmptyState    from "../shared/EmptyState";
import { CountUp, SkeletonCard, SkeletonStat } from "../shared/PageTransition";
import { db } from "../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const COLORS = ["#a855f7","#3b82f6","#10b981","#f59e0b","#ef4444"];

const Statistics = () => {
  const { user }   = useAuth();
  const { isDark } = useTheme();

  const [tasks,   setTasks]   = useState([]);
  const [habits,  setHabits]  = useState([]);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let count = 0;
    const done = () => { count++; if (count >= 3) setLoading(false); };

    const u1 = onSnapshot(query(collection(db,"tasks"),  where("userId","==",user.uid)), s=>{setTasks(s.docs.map(d=>({id:d.id,...d.data()}))); done();});
    const u2 = onSnapshot(query(collection(db,"habits"), where("userId","==",user.uid)), s=>{setHabits(s.docs.map(d=>({id:d.id,...d.data()}))); done();});
    const u3 = onSnapshot(query(collection(db,"events"), where("userId","==",user.uid)), s=>{setEvents(s.docs.map(d=>({id:d.id,...d.data()}))); done();});

    return ()=>{u1();u2();u3();};
  }, [user]);

  /* Computed */
  const totalTasks      = tasks.length;
  const completedTasks  = tasks.filter(t=>t.status==="done").length;
  const inProgressTasks = tasks.filter(t=>t.status==="inprogress").length;
  const todoTasks       = tasks.filter(t=>t.status==="todo").length;
  const completionRate  = totalTasks>0 ? Math.round((completedTasks/totalTasks)*100) : 0;

  const priorityData = [
    {name:"High",   value:tasks.filter(t=>t.priority==="high").length},
    {name:"Medium", value:tasks.filter(t=>t.priority==="medium").length},
    {name:"Low",    value:tasks.filter(t=>t.priority==="low").length},
  ].filter(d=>d.value>0);

  const statusData = [
    {name:"To Do",      value:todoTasks,       color:"#6b7280"},
    {name:"In Progress",value:inProgressTasks, color:"#f59e0b"},
    {name:"Done",       value:completedTasks,  color:"#10b981"},
  ].filter(d=>d.value>0);

  const last7Days = Array.from({length:7}, (_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return {date:d.toISOString().slice(0,10), label:d.toLocaleDateString("en-US",{weekday:"short"})};
  });

  const weeklyData = last7Days.map(day=>({
    day: day.label,
    completed: tasks.filter(t=>t.status==="done"&&t.updatedAt?.toDate?.()?.toISOString?.()?.slice(0,10)===day.date).length,
    created:   tasks.filter(t=>t.createdAt?.toDate?.()?.toISOString?.()?.slice(0,10)===day.date).length,
  }));

  const today                = new Date().toISOString().slice(0,10);
  const totalHabits          = habits.length;
  const completedHabitsToday = habits.filter(h=>(h.completedDates||[]).includes(today)).length;
  const avgStreak            = habits.length>0
    ? Math.round(habits.reduce((s,h)=>s+(h.streak||0),0)/habits.length) : 0;

  const habitWeeklyData = last7Days.map(day=>({
    day: day.label,
    completed: habits.filter(h=>(h.completedDates||[]).includes(day.date)).length,
    total: habits.length,
  }));

  /* Custom Tooltip */
  const CustomTooltip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null;
    return (
      <div className="glass-card p-3 text-sm animate-scale-in"
        style={{border:"1px solid rgba(var(--glow),0.2)"}}>
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((p,i)=>(
          <p key={i} style={{color:p.color}}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  const statCards = [
    {label:"Total Tasks",      value:totalTasks,          icon:CheckSquare, color:"from-purple-500 to-primary-600"},
    {label:"Completion Rate",  value:`${completionRate}%`,icon:TrendingUp,  color:"from-green-500 to-emerald-600", isString:true},
    {label:"Total Habits",     value:totalHabits,         icon:Target,      color:"from-orange-500 to-amber-600"},
    {label:"Avg Streak",       value:avgStreak,           icon:Award,       color:"from-blue-500 to-cyan-600",    suffix:"d"},
    {label:"Events",           value:events.length,       icon:Calendar,    color:"from-pink-500 to-rose-600"},
    {label:"Habits Today",     value:completedHabitsToday,icon:CheckSquare, color:"from-teal-500 to-green-600",   suffix:`/${totalHabits}`},
  ];

  if (loading) return (
    <div className={`min-h-screen ${isDark?"bg-mesh":"bg-mesh-light"}`}>
      <Navbar/>
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <div className="h-8 w-48 skeleton rounded-xl mb-6"/>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({length:6}).map((_,i)=><SkeletonStat key={i}/>)}
        </div>
        <SkeletonCard rows={5}/>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark?"bg-mesh":"bg-mesh-light"} pb-24 lg:pb-10`}>
      <Navbar/>
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <BarChart2 size={24} style={{color:"var(--p400)"}}/> Statistics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your productivity overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((card,i)=>{
            const Icon=card.icon;
            return (
              <div
                key={card.label}
                className="glass-card p-5 hover-lift animate-slide-up"
                style={{animationDelay:`${i*60}ms`}}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color}
                                flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon size={18} className="text-white"/>
                </div>
                <p className="text-2xl font-display font-bold text-white">
                  {card.isString
                    ? card.value
                    : <><CountUp end={card.value||0} duration={900}/>{card.suffix||""}</>
                  }
                </p>
                <p className="text-gray-400 text-sm">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        {totalTasks===0 && totalHabits===0 ? (
          <div className="glass-card">
            <EmptyState type="stats"
              title="Not enough data yet"
              description="Complete tasks and habits to start seeing your statistics and progress charts."/>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">

            {/* Weekly Task Activity */}
            <div className="glass-card p-6 hover-lift">
              <h3 className="font-display font-semibold text-white mb-4">
                Weekly Task Activity
              </h3>
              {totalTasks===0 ? (
                <EmptyState type="tasks" title="No task data yet" description="Add tasks to see weekly activity."/>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="day" stroke="#6b7280" tick={{fill:"#6b7280",fontSize:12}}/>
                    <YAxis stroke="#6b7280" tick={{fill:"#6b7280",fontSize:12}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{color:"#9ca3af",fontSize:12}}/>
                    <Bar dataKey="created"   name="Created"   fill="var(--p500)"  radius={[4,4,0,0]} opacity={0.7}/>
                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Habit Weekly */}
              <div className="glass-card p-6 hover-lift">
                <h3 className="font-display font-semibold text-white mb-4">
                  Daily Habit Completion
                </h3>
                {totalHabits===0 ? (
                  <EmptyState type="habits" title="No habits yet" description="Add habits to track daily completion."/>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={habitWeeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="day" stroke="#6b7280" tick={{fill:"#6b7280",fontSize:12}}/>
                      <YAxis stroke="#6b7280" tick={{fill:"#6b7280",fontSize:12}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Line type="monotone" dataKey="completed" name="Completed"
                        stroke="var(--p500)" strokeWidth={2}
                        dot={{fill:"var(--p500)",r:4}}
                        activeDot={{r:6,fill:"var(--p400)"}}/>
                      <Line type="monotone" dataKey="total" name="Total"
                        stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Priority Distribution */}
              <div className="glass-card p-6 hover-lift">
                <h3 className="font-display font-semibold text-white mb-4">
                  Task Priority Distribution
                </h3>
                {priorityData.length>0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={priorityData} cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={5} dataKey="value">
                        {priorityData.map((_,i)=>(
                          <Cell key={i} fill={COLORS[i%COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{color:"#9ca3af",fontSize:12}}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState type="tasks" title="No priority data" description="Add tasks with priority levels."/>
                )}
              </div>
            </div>

            {/* Status Overview */}
            <div className="glass-card p-6 hover-lift">
              <h3 className="font-display font-semibold text-white mb-4">
                Task Status Overview
              </h3>
              {statusData.length===0 ? (
                <EmptyState type="tasks" title="No status data" description="Complete some tasks to see the breakdown."/>
              ) : (
                <div className="space-y-4">
                  {statusData.map(s=>(
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-24 shrink-0">{s.name}</span>
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width:`${totalTasks>0?(s.value/totalTasks)*100:0}%`,
                            backgroundColor: s.color,
                            boxShadow:`0 0 8px ${s.color}60`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-8 text-right">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;