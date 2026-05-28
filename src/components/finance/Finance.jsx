// Finance.jsx — Skeleton, empty states, theme-aware charts, hover lift, CountUp
import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Plus, Trash2, Edit2, TrendingUp, TrendingDown,
  PieChart, Target, CreditCard, Search, Wallet,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAuth }   from "../../context/AuthContext";
import { useTheme }  from "../../context/ThemeContext";
import Navbar        from "../shared/Navbar";
import Modal         from "../shared/Modal";
import EmptyState    from "../shared/EmptyState";
import { SkeletonCard, SkeletonStat, CountUp } from "../shared/PageTransition";
import {
  addTransaction, updateTransaction, deleteTransaction, getTransactionsRealtime,
  addBudget, updateBudget, deleteBudget, getBudgetsRealtime,
  addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, getSavingsGoalsRealtime,
} from "../../firebase/finance";
import toast from "react-hot-toast";

const EXPENSE_CATEGORIES = [
  "Food & Dining","Transport","Shopping","Entertainment",
  "Health","Education","Bills & Utilities","Rent","Travel","Other",
];
const INCOME_CATEGORIES = ["Salary","Freelance","Business","Investment","Gift","Other"];
const CHART_COLORS = ["#a855f7","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#84cc16","#f97316","#8b5cf6"];

const TAB = { overview:"overview", transactions:"transactions", budget:"budget", savings:"savings" };

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm animate-scale-in"
      style={{ border:"1px solid rgba(var(--glow),0.2)" }}>
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, icon: Icon, gradient, delay = 0 }) => (
  <div
    className="glass-card-hover p-5 animate-slide-up hover-lift"
    style={{ animationDelay:`${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient}
                       flex items-center justify-center shadow-lg`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-display font-bold text-white">
      ₹<CountUp end={value} duration={1000} />
    </p>
    <p className="text-gray-400 text-sm mt-0.5">{label}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════ */
const Finance = () => {
  const { user }   = useAuth();
  const { isDark } = useTheme();

  const [tab,          setTab]          = useState(TAB.overview);
  const [transactions, setTransactions] = useState([]);
  const [budgets,      setBudgets]      = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("all");

  const [showTxForm,     setShowTxForm]     = useState(false);
  const [editTx,         setEditTx]         = useState(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editBudget,     setEditBudget]     = useState(null);
  const [showSavingsForm,setShowSavingsForm]= useState(false);
  const [editSavings,    setEditSavings]    = useState(null);

  const emptyTx = { type:"expense", amount:"", category:"Food & Dining", description:"", date:new Date().toISOString().slice(0,10) };
  const [txForm,      setTxForm]      = useState(emptyTx);
  const [budgetForm,  setBudgetForm]  = useState({ category:"Food & Dining", limit:"", month:new Date().toISOString().slice(0,7) });
  const [savingsForm, setSavingsForm] = useState({ title:"", target:"", saved:"", deadline:"", icon:"🎯" });

  useEffect(() => {
    if (!user) return;
    const u1 = getTransactionsRealtime(user.uid, d => { setTransactions(d); setLoading(false); });
    const u2 = getBudgetsRealtime(user.uid, setBudgets);
    const u3 = getSavingsGoalsRealtime(user.uid, setSavingsGoals);
    return () => { u1(); u2(); u3(); };
  }, [user]);

  useEffect(() => {
    if (editTx) setTxForm({ type:editTx.type, amount:editTx.amount, category:editTx.category, description:editTx.description||"", date:editTx.date });
    else setTxForm(emptyTx);
  }, [editTx]);

  useEffect(() => {
    if (editBudget) setBudgetForm({ category:editBudget.category, limit:editBudget.limit, month:editBudget.month });
    else setBudgetForm({ category:"Food & Dining", limit:"", month:new Date().toISOString().slice(0,7) });
  }, [editBudget]);

  useEffect(() => {
    if (editSavings) setSavingsForm({ title:editSavings.title, target:editSavings.target, saved:editSavings.saved, deadline:editSavings.deadline||"", icon:editSavings.icon||"🎯" });
    else setSavingsForm({ title:"", target:"", saved:"", deadline:"", icon:"🎯" });
  }, [editSavings]);

  const currentMonth = new Date().toISOString().slice(0,7);

  const thisMonthTx  = useMemo(() => transactions.filter(t => t.date?.startsWith(currentMonth)), [transactions,currentMonth]);
  const totalIncome  = useMemo(() => thisMonthTx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0), [thisMonthTx]);
  const totalExpense = useMemo(() => thisMonthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0), [thisMonthTx]);
  const balance      = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const savingsTotal = useMemo(() => savingsGoals.reduce((s,g)=>s+Number(g.saved||0),0), [savingsGoals]);

  const areaData = useMemo(() => {
    const months = Array.from({length:6}, (_,i) => {
      const d = new Date(); d.setMonth(d.getMonth()-(5-i));
      return d.toISOString().slice(0,7);
    });
    return months.map(m => ({
      month: new Date(m+"-01").toLocaleDateString("en-US",{month:"short"}),
      income:  transactions.filter(t=>t.type==="income"  &&t.date?.startsWith(m)).reduce((s,t)=>s+Number(t.amount),0),
      expense: transactions.filter(t=>t.type==="expense" &&t.date?.startsWith(m)).reduce((s,t)=>s+Number(t.amount),0),
    }));
  }, [transactions]);

  const pieData = useMemo(() => {
    const map = {};
    thisMonthTx.filter(t=>t.type==="expense").forEach(t=>{
      map[t.category]=(map[t.category]||0)+Number(t.amount);
    });
    return Object.entries(map).map(([name,value])=>({name,value}));
  }, [thisMonthTx]);

  const budgetUsage = useMemo(() =>
    budgets.filter(b=>b.month===currentMonth).map(b=>{
      const spent=thisMonthTx.filter(t=>t.type==="expense"&&t.category===b.category).reduce((s,t)=>s+Number(t.amount),0);
      return {...b, spent, pct:Math.min(Math.round((spent/Number(b.limit))*100),100)};
    }), [budgets,thisMonthTx,currentMonth]);

  const filtered = useMemo(()=>
    transactions
      .filter(t=>typeFilter==="all"||t.type===typeFilter)
      .filter(t=>t.description?.toLowerCase().includes(search.toLowerCase())||t.category?.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b)=>b.date?.localeCompare(a.date)),
    [transactions,typeFilter,search]);

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.amount||isNaN(txForm.amount)){toast.error("Enter a valid amount");return;}
    try {
      if (editTx){await updateTransaction(editTx.id,txForm);toast.success("Transaction updated!");}
      else{await addTransaction(user.uid,txForm);toast.success("Transaction added!");}
      setShowTxForm(false);setEditTx(null);
    } catch{toast.error("Something went wrong!");}
  };

  const handleTxDelete = async (id) => {
    try{await deleteTransaction(id);toast.success("Deleted!");}
    catch{toast.error("Failed to delete!");}
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      if(editBudget){await updateBudget(editBudget.id,budgetForm);toast.success("Budget updated!");}
      else{await addBudget(user.uid,budgetForm);toast.success("Budget set!");}
      setShowBudgetForm(false);setEditBudget(null);
    } catch{toast.error("Something went wrong!");}
  };

  const handleSavingsSubmit = async (e) => {
    e.preventDefault();
    try {
      if(editSavings){await updateSavingsGoal(editSavings.id,savingsForm);toast.success("Goal updated!");}
      else{await addSavingsGoal(user.uid,savingsForm);toast.success("Goal created!");}
      setShowSavingsForm(false);setEditSavings(null);
    } catch{toast.error("Something went wrong!");}
  };

  const TABS = [
    {id:TAB.overview,     label:"Overview",     icon:PieChart   },
    {id:TAB.transactions, label:"Transactions",  icon:CreditCard },
    {id:TAB.budget,       label:"Budgets",       icon:Target     },
    {id:TAB.savings,      label:"Savings Goals", icon:Wallet     },
  ];
  const SAVING_ICONS=["🎯","🏠","✈️","🚗","💍","📱","💻","🎓","🏋️","💊"];

  if (loading) return (
    <div className={`min-h-screen ${isDark?"bg-mesh":"bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="h-8 w-48 skeleton rounded-xl mb-6"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({length:4}).map((_,i)=><SkeletonStat key={i}/>)}
        </div>
        <SkeletonCard rows={5}/>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark?"bg-mesh":"bg-mesh-light"} pb-24 lg:pb-10`}>
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <DollarSign size={24} style={{color:"var(--p400)"}}/> Finance
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {transactions.length} transactions · {currentMonth}
            </p>
          </div>
          <button onClick={()=>{setEditTx(null);setShowTxForm(true);}} className="btn-primary">
            <Plus size={18}/> Add Transaction
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Monthly Income"  value={totalIncome}  icon={TrendingUp}   gradient="from-green-500 to-emerald-600"  delay={0}/>
          <StatCard label="Monthly Expense" value={totalExpense} icon={TrendingDown}  gradient="from-red-500 to-rose-600"      delay={60}/>
          <StatCard label="Net Balance"     value={Math.abs(balance)} icon={Wallet}  gradient="from-purple-500 to-primary-600" delay={120}/>
          <StatCard label="Total Savings"   value={savingsTotal} icon={Target}       gradient="from-blue-500 to-cyan-600"      delay={180}/>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 custom-scrollbar">
          {TABS.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                          font-medium whitespace-nowrap transition-all duration-200 ${
                tab===id ? "nav-active" : "glass-card text-gray-400 hover:text-white"
              }`}>
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab===TAB.overview && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 hover-lift">
              <h3 className="font-display font-semibold text-white mb-4">Income vs Expense (6 months)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="month" stroke="#6b7280" tick={{fill:"#6b7280",fontSize:12}}/>
                  <YAxis stroke="#6b7280" tick={{fill:"#6b7280",fontSize:12}}
                    tickFormatter={v=>`₹${v>=1000?(v/1000).toFixed(0)+"k":v}`}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{color:"#9ca3af",fontSize:12}}/>
                  <Area type="monotone" dataKey="income"  name="Income"  stroke="#10b981" fill="url(#inc)" strokeWidth={2}/>
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fill="url(#exp)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 hover-lift">
                <h3 className="font-display font-semibold text-white mb-4">Spending by Category</h3>
                {pieData.length>0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RPieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {pieData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{color:"#9ca3af",fontSize:11}}/>
                    </RPieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState type="finance" title="No expenses this month" description="Add some transactions to see your spending breakdown."/>
                )}
              </div>

              <div className="glass-card p-6 hover-lift">
                <h3 className="font-display font-semibold text-white mb-4">Recent Transactions</h3>
                {transactions.length===0 ? (
                  <EmptyState type="finance" title="No transactions yet" description="Add your first transaction to get started." action={()=>{setEditTx(null);setShowTxForm(true);}} actionLabel="Add Transaction"/>
                ) : (
                  <div className="space-y-3">
                    {transactions.sort((a,b)=>b.date?.localeCompare(a.date)).slice(0,6).map((tx,i)=>(
                      <div key={tx.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl
                                   bg-white/5 hover:bg-white/10 transition-all
                                   animate-slide-up"
                        style={{animationDelay:`${i*40}ms`}}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type==="income"?"bg-green-500/20":"bg-red-500/20"}`}>
                          {tx.type==="income"
                            ?<ArrowUpRight size={14} className="text-green-400"/>
                            :<ArrowDownRight size={14} className="text-red-400"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{tx.category}</p>
                          <p className="text-gray-500 text-xs">{tx.date}</p>
                        </div>
                        <p className={`text-sm font-semibold shrink-0 ${tx.type==="income"?"text-green-400":"text-red-400"}`}>
                          {tx.type==="income"?"+":"-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab===TAB.transactions && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search transactions..." className="input-glass pl-9"/>
              </div>
              <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
                className="input-glass w-full sm:w-36">
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {filtered.length===0 ? (
              <div className="glass-card">
                <EmptyState type="finance" title="No transactions found"
                  description="Try adjusting your search or add a new transaction."
                  action={()=>{setEditTx(null);setShowTxForm(true);}} actionLabel="Add Transaction"/>
              </div>
            ) : (
              <div className="glass-card overflow-hidden hover-lift">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Date","Type","Category","Description","Amount",""].map(h=>(
                          <th key={h} className="text-left text-gray-500 font-medium px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((tx,i)=>(
                        <tr key={tx.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-all animate-fade-in"
                          style={{animationDelay:`${i*20}ms`}}>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{tx.date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.type==="income"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"
                            }`}>{tx.type}</span>
                          </td>
                          <td className="px-4 py-3 text-white">{tx.category}</td>
                          <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">{tx.description||"—"}</td>
                          <td className={`px-4 py-3 font-semibold whitespace-nowrap ${tx.type==="income"?"text-green-400":"text-red-400"}`}>
                            {tx.type==="income"?"+":"-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={()=>{setEditTx(tx);setShowTxForm(true);}}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <Edit2 size={13}/>
                              </button>
                              <button onClick={()=>handleTxDelete(tx.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                <Trash2 size={13}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BUDGET ── */}
        {tab===TAB.budget && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <button onClick={()=>{setEditBudget(null);setShowBudgetForm(true);}} className="btn-primary">
                <Plus size={18}/> Set Budget
              </button>
            </div>
            {budgetUsage.length===0 ? (
              <div className="glass-card">
                <EmptyState type="finance" title="No budgets set"
                  description={`Set spending limits for ${currentMonth} to stay on track.`}
                  action={()=>setShowBudgetForm(true)} actionLabel="Set Budget"/>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {budgetUsage.map((b,i)=>(
                  <div key={b.id}
                    className="glass-card p-5 animate-slide-up hover-lift"
                    style={{animationDelay:`${i*60}ms`}}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{b.category}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{b.month}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={()=>{setEditBudget(b);setShowBudgetForm(true);}}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                          <Edit2 size={13}/>
                        </button>
                        <button onClick={()=>deleteBudget(b.id).then(()=>toast.success("Deleted!"))}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">₹{Number(b.spent).toLocaleString("en-IN")} spent</span>
                      <span className={`font-medium ${b.pct>=90?"text-red-400":b.pct>=70?"text-yellow-400":"text-green-400"}`}>
                        {b.pct}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:`${b.pct}%`,
                          background:b.pct>=90?"#ef4444":b.pct>=70?"#f59e0b":"#10b981",
                          boxShadow:`0 0 8px ${b.pct>=90?"rgba(239,68,68,0.4)":b.pct>=70?"rgba(245,158,11,0.4)":"rgba(16,185,129,0.4)"}`,
                        }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      ₹{(Number(b.limit)-Number(b.spent)).toLocaleString("en-IN")} remaining of ₹{Number(b.limit).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SAVINGS ── */}
        {tab===TAB.savings && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <button onClick={()=>{setEditSavings(null);setShowSavingsForm(true);}} className="btn-primary">
                <Plus size={18}/> New Goal
              </button>
            </div>
            {savingsGoals.length===0 ? (
              <div className="glass-card">
                <EmptyState type="finance" title="No savings goals"
                  description="Set a savings target and track your progress."
                  action={()=>setShowSavingsForm(true)} actionLabel="Create Goal"/>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savingsGoals.map((g,i)=>{
                  const pct=Math.min(Math.round((Number(g.saved)/Number(g.target))*100),100);
                  const remaining=Number(g.target)-Number(g.saved);
                  return (
                    <div key={g.id}
                      className="glass-card-hover p-5 animate-slide-up hover-lift"
                      style={{animationDelay:`${i*60}ms`}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{background:"rgba(var(--glow),0.15)"}}>
                            {g.icon||"🎯"}
                          </div>
                          <div>
                            <p className="text-white font-medium">{g.title}</p>
                            {g.deadline&&<p className="text-gray-500 text-xs">by {g.deadline}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={()=>{setEditSavings(g);setShowSavingsForm(true);}}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            <Edit2 size={13}/>
                          </button>
                          <button onClick={()=>deleteSavingsGoal(g.id).then(()=>toast.success("Deleted!"))}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 shrink-0">
                          <svg viewBox="0 0 60 60" className="w-16 h-16 progress-ring">
                            <circle cx="30" cy="30" r="24" fill="none"
                              stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
                            <circle cx="30" cy="30" r="24" fill="none"
                              stroke="var(--p500)" strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={`${2*Math.PI*24}`}
                              strokeDashoffset={`${2*Math.PI*24*(1-pct/100)}`}
                              style={{transition:"stroke-dashoffset 1s ease"}}/>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{pct}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">₹{Number(g.saved).toLocaleString("en-IN")}</p>
                          <p className="text-gray-500 text-xs">of ₹{Number(g.target).toLocaleString("en-IN")}</p>
                          <p className="text-xs mt-1" style={{color:"var(--p400)"}}>
                            ₹{remaining.toLocaleString("en-IN")} to go
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width:`${pct}%`,
                            background:`linear-gradient(90deg, var(--grad1), var(--grad2))`,
                          }}
                        />
                      </div>

                      <button
                        onClick={()=>{
                          const amt=prompt("Add to savings (₹):");
                          if(amt&&!isNaN(amt)){
                            updateSavingsGoal(g.id,{...g,saved:Number(g.saved)+Number(amt)})
                              .then(()=>toast.success(`+₹${Number(amt).toLocaleString("en-IN")} added!`));
                          }
                        }}
                        className="mt-3 w-full btn-secondary text-xs py-1.5 justify-center"
                      >
                        <Plus size={12}/> Add Savings
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Transaction Modal ── */}
      <Modal isOpen={showTxForm} onClose={()=>{setShowTxForm(false);setEditTx(null);}}
        title={editTx?"Edit Transaction":"Add Transaction"} size="sm">
        <form onSubmit={handleTxSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {["income","expense"].map(t=>(
              <button key={t} type="button"
                onClick={()=>setTxForm(f=>({...f,type:t,category:t==="income"?"Salary":"Food & Dining"}))}
                className={`py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  txForm.type===t
                    ?t==="income"?"bg-green-500/20 text-green-400 border border-green-500/30"
                               :"bg-red-500/20 text-red-400 border border-red-500/30"
                    :"glass-card text-gray-400 hover:text-white"
                }`}>{t}</button>
            ))}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Amount (₹) *</label>
            <input type="number" value={txForm.amount}
              onChange={e=>setTxForm(f=>({...f,amount:e.target.value}))}
              placeholder="0.00" className="input-glass" required/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <select value={txForm.category}
              onChange={e=>setTxForm(f=>({...f,category:e.target.value}))}
              className="input-glass">
              {(txForm.type==="income"?INCOME_CATEGORIES:EXPENSE_CATEGORIES).map(c=>(
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Date</label>
            <input type="date" value={txForm.date}
              onChange={e=>setTxForm(f=>({...f,date:e.target.value}))} className="input-glass"/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <input value={txForm.description}
              onChange={e=>setTxForm(f=>({...f,description:e.target.value}))}
              placeholder="Optional note..." className="input-glass"/>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>{setShowTxForm(false);setEditTx(null);}}
              className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editTx?"Update":"Add"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Budget Modal ── */}
      <Modal isOpen={showBudgetForm} onClose={()=>{setShowBudgetForm(false);setEditBudget(null);}}
        title={editBudget?"Edit Budget":"Set Budget"} size="sm">
        <form onSubmit={handleBudgetSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <select value={budgetForm.category}
              onChange={e=>setBudgetForm(f=>({...f,category:e.target.value}))}
              className="input-glass">
              {EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Monthly Limit (₹) *</label>
            <input type="number" value={budgetForm.limit}
              onChange={e=>setBudgetForm(f=>({...f,limit:e.target.value}))}
              placeholder="5000" className="input-glass" required/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Month</label>
            <input type="month" value={budgetForm.month}
              onChange={e=>setBudgetForm(f=>({...f,month:e.target.value}))} className="input-glass"/>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>{setShowBudgetForm(false);setEditBudget(null);}}
              className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editBudget?"Update":"Set Budget"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Savings Modal ── */}
      <Modal isOpen={showSavingsForm} onClose={()=>{setShowSavingsForm(false);setEditSavings(null);}}
        title={editSavings?"Edit Goal":"New Savings Goal"} size="sm">
        <form onSubmit={handleSavingsSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Goal Name *</label>
            <input value={savingsForm.title}
              onChange={e=>setSavingsForm(f=>({...f,title:e.target.value}))}
              placeholder="e.g. New Laptop" className="input-glass" required/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {SAVING_ICONS.map(ic=>(
                <button key={ic} type="button"
                  onClick={()=>setSavingsForm(f=>({...f,icon:ic}))}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${
                    savingsForm.icon===ic?"scale-110":"glass-card hover:bg-white/10"
                  }`}
                  style={savingsForm.icon===ic?{
                    background:"rgba(var(--glow),0.2)",
                    border:"1px solid rgba(var(--glow),0.4)",
                  }:{}}
                >{ic}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Target (₹) *</label>
              <input type="number" value={savingsForm.target}
                onChange={e=>setSavingsForm(f=>({...f,target:e.target.value}))}
                placeholder="50000" className="input-glass" required/>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Already Saved (₹)</label>
              <input type="number" value={savingsForm.saved}
                onChange={e=>setSavingsForm(f=>({...f,saved:e.target.value}))}
                placeholder="0" className="input-glass"/>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target Date</label>
            <input type="date" value={savingsForm.deadline}
              onChange={e=>setSavingsForm(f=>({...f,deadline:e.target.value}))} className="input-glass"/>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>{setShowSavingsForm(false);setEditSavings(null);}}
              className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editSavings?"Update":"Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;