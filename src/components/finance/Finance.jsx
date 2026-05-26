import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Plus, Trash2, Edit2, TrendingUp, TrendingDown,
  PieChart, Target, CreditCard, Search, Filter, Download,
  ArrowUpRight, ArrowDownRight, Wallet, ChevronDown,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";
import Modal from "../shared/Modal";
import {
  addTransaction, updateTransaction, deleteTransaction, getTransactionsRealtime,
  addBudget, updateBudget, deleteBudget, getBudgetsRealtime,
  addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, getSavingsGoalsRealtime,
} from "../../firebase/finance";
import toast from "react-hot-toast";

const EXPENSE_CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Entertainment",
  "Health", "Education", "Bills & Utilities", "Rent", "Travel", "Other",
];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];
const COLORS = ["#a855f7","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#84cc16","#f97316","#8b5cf6"];

const TAB = { overview: "overview", transactions: "transactions", budget: "budget", savings: "savings" };

/* ── Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm border border-primary-500/20 animate-scale-in">
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
const StatCard = ({ label, value, icon: Icon, gradient, change, delay = 0 }) => (
  <div
    className="glass-card-hover p-5 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon size={18} className="text-white" />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
          {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-display font-bold text-white animate-count-up">
      ₹{Number(value).toLocaleString("en-IN")}
    </p>
    <p className="text-gray-400 text-sm mt-0.5">{label}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
const Finance = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [tab, setTab]                     = useState(TAB.overview);
  const [transactions, setTransactions]   = useState([]);
  const [budgets, setBudgets]             = useState([]);
  const [savingsGoals, setSavingsGoals]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [typeFilter, setTypeFilter]       = useState("all");

  /* modals */
  const [showTxForm, setShowTxForm]       = useState(false);
  const [editTx, setEditTx]               = useState(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editBudget, setEditBudget]       = useState(null);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [editSavings, setEditSavings]     = useState(null);

  /* forms */
  const emptyTx = { type: "expense", amount: "", category: "Food & Dining", description: "", date: new Date().toISOString().slice(0,10) };
  const [txForm, setTxForm]               = useState(emptyTx);
  const [budgetForm, setBudgetForm]       = useState({ category: "Food & Dining", limit: "", month: new Date().toISOString().slice(0,7) });
  const [savingsForm, setSavingsForm]     = useState({ title: "", target: "", saved: "", deadline: "", icon: "🎯" });

  /* realtime */
  useEffect(() => {
    if (!user) return;
    const u1 = getTransactionsRealtime(user.uid, (d) => { setTransactions(d); setLoading(false); });
    const u2 = getBudgetsRealtime(user.uid, setBudgets);
    const u3 = getSavingsGoalsRealtime(user.uid, setSavingsGoals);
    return () => { u1(); u2(); u3(); };
  }, [user]);

  useEffect(() => {
    if (editTx) setTxForm({ type: editTx.type, amount: editTx.amount, category: editTx.category, description: editTx.description || "", date: editTx.date });
    else setTxForm(emptyTx);
  }, [editTx]);

  useEffect(() => {
    if (editBudget) setBudgetForm({ category: editBudget.category, limit: editBudget.limit, month: editBudget.month });
    else setBudgetForm({ category: "Food & Dining", limit: "", month: new Date().toISOString().slice(0,7) });
  }, [editBudget]);

  useEffect(() => {
    if (editSavings) setSavingsForm({ title: editSavings.title, target: editSavings.target, saved: editSavings.saved, deadline: editSavings.deadline || "", icon: editSavings.icon || "🎯" });
    else setSavingsForm({ title: "", target: "", saved: "", deadline: "", icon: "🎯" });
  }, [editSavings]);

  /* ── Computed ── */
  const currentMonth = new Date().toISOString().slice(0, 7);

  const thisMonthTx = useMemo(
    () => transactions.filter((t) => t.date?.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const totalIncome  = useMemo(() => thisMonthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0), [thisMonthTx]);
  const totalExpense = useMemo(() => thisMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0), [thisMonthTx]);
  const balance      = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const savingsTotal = useMemo(() => savingsGoals.reduce((s, g) => s + Number(g.saved || 0), 0), [savingsGoals]);

  /* Last 6 months area chart */
  const areaData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      return d.toISOString().slice(0, 7);
    });
    return months.map((m) => ({
      month: new Date(m + "-01").toLocaleDateString("en-US", { month: "short" }),
      income:  transactions.filter(t => t.type === "income"  && t.date?.startsWith(m)).reduce((s,t) => s + Number(t.amount), 0),
      expense: transactions.filter(t => t.type === "expense" && t.date?.startsWith(m)).reduce((s,t) => s + Number(t.amount), 0),
    }));
  }, [transactions]);

  /* Category pie */
  const pieData = useMemo(() => {
    const map = {};
    thisMonthTx.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [thisMonthTx]);

  /* Budget usage */
  const budgetUsage = useMemo(() =>
    budgets.filter(b => b.month === currentMonth).map(b => {
      const spent = thisMonthTx.filter(t => t.type === "expense" && t.category === b.category)
        .reduce((s, t) => s + Number(t.amount), 0);
      return { ...b, spent, pct: Math.min(Math.round((spent / Number(b.limit)) * 100), 100) };
    }),
    [budgets, thisMonthTx, currentMonth]
  );

  /* Filtered transactions */
  const filtered = useMemo(() =>
    transactions
      .filter(t => typeFilter === "all" || t.type === typeFilter)
      .filter(t => t.description?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date?.localeCompare(a.date)),
    [transactions, typeFilter, search]
  );

  /* ── Handlers ── */
  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.amount || isNaN(txForm.amount)) { toast.error("Enter a valid amount"); return; }
    try {
      if (editTx) { await updateTransaction(editTx.id, txForm); toast.success("Transaction updated!"); }
      else        { await addTransaction(user.uid, txForm);       toast.success("Transaction added!"); }
      setShowTxForm(false); setEditTx(null);
    } catch { toast.error("Something went wrong!"); }
  };

  const handleTxDelete = async (id) => {
    try { await deleteTransaction(id); toast.success("Deleted!"); }
    catch { toast.error("Failed to delete!"); }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editBudget) { await updateBudget(editBudget.id, budgetForm); toast.success("Budget updated!"); }
      else            { await addBudget(user.uid, budgetForm);          toast.success("Budget set!"); }
      setShowBudgetForm(false); setEditBudget(null);
    } catch { toast.error("Something went wrong!"); }
  };

  const handleSavingsSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSavings) { await updateSavingsGoal(editSavings.id, savingsForm); toast.success("Goal updated!"); }
      else             { await addSavingsGoal(user.uid, savingsForm);           toast.success("Goal created!"); }
      setShowSavingsForm(false); setEditSavings(null);
    } catch { toast.error("Something went wrong!"); }
  };

  const TABS = [
    { id: TAB.overview,      label: "Overview",      icon: PieChart },
    { id: TAB.transactions,  label: "Transactions",  icon: CreditCard },
    { id: TAB.budget,        label: "Budgets",       icon: Target },
    { id: TAB.savings,       label: "Savings Goals", icon: Wallet },
  ];

  const SAVING_ICONS = ["🎯","🏠","✈️","🚗","💍","📱","💻","🎓","🏋️","💊"];

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <DollarSign size={24} className="text-primary-400" />
              Finance
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {transactions.length} transactions · {currentMonth}
            </p>
          </div>
          <button onClick={() => { setEditTx(null); setShowTxForm(true); }} className="btn-primary">
            <Plus size={18} /> Add Transaction
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="This Month Income"  value={totalIncome}  icon={TrendingUp}   gradient="from-green-500 to-emerald-600" delay={0} />
          <StatCard label="This Month Expense" value={totalExpense} icon={TrendingDown}  gradient="from-red-500 to-rose-600"     delay={60} />
          <StatCard label="Net Balance"        value={balance}      icon={Wallet}       gradient="from-purple-500 to-primary-600" delay={120} />
          <StatCard label="Total Savings"      value={savingsTotal} icon={Target}       gradient="from-blue-500 to-cyan-600"     delay={180} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                tab === id ? "nav-active" : "glass-card text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === TAB.overview && (
          <div className="space-y-6 animate-fade-in">
            {/* Area Chart */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-4">Income vs Expense (6 months)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fill:"#6b7280", fontSize:12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill:"#6b7280", fontSize:12 }}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color:"#9ca3af", fontSize:12 }} />
                  <Area type="monotone" dataKey="income"  name="Income"  stroke="#10b981" fill="url(#income)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fill="url(#expense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-white mb-4">Spending by Category</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RPieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color:"#9ca3af", fontSize:11 }} />
                    </RPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No expenses this month</div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-white mb-4">Recent Transactions</h3>
                {transactions.slice(0, 6).length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No transactions yet</div>
                ) : (
                  <div className="space-y-3">
                    {transactions
                      .sort((a, b) => b.date?.localeCompare(a.date))
                      .slice(0, 6)
                      .map((tx, i) => (
                        <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all animate-slide-up"
                          style={{ animationDelay: `${i * 40}ms` }}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === "income" ? "bg-green-500/20" : "bg-red-500/20"
                          }`}>
                            {tx.type === "income"
                              ? <ArrowUpRight size={14} className="text-green-400" />
                              : <ArrowDownRight size={14} className="text-red-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{tx.category}</p>
                            <p className="text-gray-500 text-xs">{tx.date}</p>
                          </div>
                          <p className={`text-sm font-semibold shrink-0 ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                            {tx.type === "income" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {tab === TAB.transactions && (
          <div className="space-y-4 animate-fade-in">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="input-glass pl-9" />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-glass w-full sm:w-36">
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <CreditCard size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No transactions found</p>
                <button onClick={() => setShowTxForm(true)} className="btn-primary mx-auto mt-4">
                  <Plus size={16} /> Add Transaction
                </button>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Date","Type","Category","Description","Amount",""].map(h => (
                          <th key={h} className="text-left text-gray-500 font-medium px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((tx, i) => (
                        <tr key={tx.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-all animate-fade-in"
                          style={{ animationDelay: `${i * 20}ms` }}>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{tx.date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.type === "income" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            }`}>{tx.type}</span>
                          </td>
                          <td className="px-4 py-3 text-white">{tx.category}</td>
                          <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">{tx.description || "—"}</td>
                          <td className={`px-4 py-3 font-semibold whitespace-nowrap ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                            {tx.type === "income" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => { setEditTx(tx); setShowTxForm(true); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => handleTxDelete(tx.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                <Trash2 size={13} />
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

        {/* ── BUDGET TAB ── */}
        {tab === TAB.budget && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <button onClick={() => { setEditBudget(null); setShowBudgetForm(true); }} className="btn-primary">
                <Plus size={18} /> Set Budget
              </button>
            </div>
            {budgetUsage.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <Target size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No budgets set for {currentMonth}</p>
                <button onClick={() => setShowBudgetForm(true)} className="btn-primary mx-auto mt-4">
                  <Plus size={16} /> Set Budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {budgetUsage.map((b, i) => (
                  <div key={b.id} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i*60}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{b.category}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{b.month}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditBudget(b); setShowBudgetForm(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteBudget(b.id).then(() => toast.success("Deleted!"))}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">₹{Number(b.spent).toLocaleString("en-IN")} spent</span>
                      <span className={`font-medium ${b.pct >= 90 ? "text-red-400" : b.pct >= 70 ? "text-yellow-400" : "text-green-400"}`}>
                        {b.pct}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${b.pct}%`,
                          background: b.pct >= 90 ? "#ef4444" : b.pct >= 70 ? "#f59e0b" : "#10b981",
                        }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      ₹{(Number(b.limit) - Number(b.spent)).toLocaleString("en-IN")} remaining of ₹{Number(b.limit).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SAVINGS TAB ── */}
        {tab === TAB.savings && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <button onClick={() => { setEditSavings(null); setShowSavingsForm(true); }} className="btn-primary">
                <Plus size={18} /> New Goal
              </button>
            </div>
            {savingsGoals.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <Wallet size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No savings goals yet</p>
                <button onClick={() => setShowSavingsForm(true)} className="btn-primary mx-auto mt-4">
                  <Plus size={16} /> Create Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savingsGoals.map((g, i) => {
                  const pct = Math.min(Math.round((Number(g.saved) / Number(g.target)) * 100), 100);
                  const remaining = Number(g.target) - Number(g.saved);
                  return (
                    <div key={g.id} className="glass-card-hover p-5 animate-slide-up" style={{ animationDelay: `${i*60}ms` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-xl">
                            {g.icon || "🎯"}
                          </div>
                          <div>
                            <p className="text-white font-medium">{g.title}</p>
                            {g.deadline && <p className="text-gray-500 text-xs">by {g.deadline}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditSavings(g); setShowSavingsForm(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteSavingsGoal(g.id).then(() => toast.success("Deleted!"))}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Ring */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 shrink-0">
                          <svg viewBox="0 0 60 60" className="w-16 h-16 progress-ring">
                            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                            <circle cx="30" cy="30" r="24" fill="none"
                              stroke="#a855f7" strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={`${2*Math.PI*24}`}
                              strokeDashoffset={`${2*Math.PI*24*(1-pct/100)}`}
                              style={{ transition: "stroke-dashoffset 1s ease" }} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{pct}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">₹{Number(g.saved).toLocaleString("en-IN")}</p>
                          <p className="text-gray-500 text-xs">of ₹{Number(g.target).toLocaleString("en-IN")}</p>
                          <p className="text-primary-400 text-xs mt-1">₹{remaining.toLocaleString("en-IN")} to go</p>
                        </div>
                      </div>

                      <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>

                      {/* Quick add */}
                      <button
                        onClick={() => {
                          const amt = prompt("Add to savings (₹):");
                          if (amt && !isNaN(amt)) {
                            updateSavingsGoal(g.id, { ...g, saved: Number(g.saved) + Number(amt) })
                              .then(() => toast.success(`+₹${Number(amt).toLocaleString("en-IN")} added!`));
                          }
                        }}
                        className="mt-3 w-full btn-secondary text-xs py-1.5 justify-center"
                      >
                        <Plus size={12} /> Add Savings
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
      <Modal isOpen={showTxForm} onClose={() => { setShowTxForm(false); setEditTx(null); }}
        title={editTx ? "Edit Transaction" : "Add Transaction"} size="sm">
        <form onSubmit={handleTxSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {["income","expense"].map(t => (
              <button key={t} type="button"
                onClick={() => setTxForm(f => ({ ...f, type: t, category: t === "income" ? "Salary" : "Food & Dining" }))}
                className={`py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  txForm.type === t
                    ? t === "income" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "glass-card text-gray-400 hover:text-white"
                }`}>{t}</button>
            ))}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Amount (₹) *</label>
            <input type="number" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" className="input-glass" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <select value={txForm.category} onChange={e => setTxForm(f => ({ ...f, category: e.target.value }))} className="input-glass">
              {(txForm.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Date</label>
            <input type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} className="input-glass" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <input value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional note..." className="input-glass" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowTxForm(false); setEditTx(null); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editTx ? "Update" : "Add"}</button>
          </div>
        </form>
      </Modal>

      {/* ── Budget Modal ── */}
      <Modal isOpen={showBudgetForm} onClose={() => { setShowBudgetForm(false); setEditBudget(null); }}
        title={editBudget ? "Edit Budget" : "Set Budget"} size="sm">
        <form onSubmit={handleBudgetSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <select value={budgetForm.category} onChange={e => setBudgetForm(f => ({ ...f, category: e.target.value }))} className="input-glass">
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Monthly Limit (₹) *</label>
            <input type="number" value={budgetForm.limit} onChange={e => setBudgetForm(f => ({ ...f, limit: e.target.value }))}
              placeholder="5000" className="input-glass" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Month</label>
            <input type="month" value={budgetForm.month} onChange={e => setBudgetForm(f => ({ ...f, month: e.target.value }))} className="input-glass" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowBudgetForm(false); setEditBudget(null); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editBudget ? "Update" : "Set Budget"}</button>
          </div>
        </form>
      </Modal>

      {/* ── Savings Modal ── */}
      <Modal isOpen={showSavingsForm} onClose={() => { setShowSavingsForm(false); setEditSavings(null); }}
        title={editSavings ? "Edit Goal" : "New Savings Goal"} size="sm">
        <form onSubmit={handleSavingsSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Goal Name *</label>
            <input value={savingsForm.title} onChange={e => setSavingsForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. New Laptop" className="input-glass" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {SAVING_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setSavingsForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${savingsForm.icon === ic ? "bg-primary-500/30 border border-primary-500/50 scale-110" : "glass-card hover:bg-white/10"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Target (₹) *</label>
              <input type="number" value={savingsForm.target} onChange={e => setSavingsForm(f => ({ ...f, target: e.target.value }))}
                placeholder="50000" className="input-glass" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Already Saved (₹)</label>
              <input type="number" value={savingsForm.saved} onChange={e => setSavingsForm(f => ({ ...f, saved: e.target.value }))}
                placeholder="0" className="input-glass" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target Date</label>
            <input type="date" value={savingsForm.deadline} onChange={e => setSavingsForm(f => ({ ...f, deadline: e.target.value }))} className="input-glass" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowSavingsForm(false); setEditSavings(null); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editSavings ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;
