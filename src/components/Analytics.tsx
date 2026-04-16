import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, getDaysInMonth, getDate, getDay, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import { useApp } from '../AppContext';
import { DEFAULT_CATEGORIES } from '../constants';
import {
  Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Lightbulb, Target, Calendar, Zap, Brain, BarChart3 } from 'lucide-react';

export default function Analytics() {
  const { settings, expenses, currentMonth } = useApp();
  const today = useMemo(() => new Date(), []);
  
  if (!settings) return null;

  const { monthlyBudget, currencySymbol, customCategories } = settings;
  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const isCurrentMonth = currentMonth === format(today, 'yyyy-MM');
  const currentDay = isCurrentMonth ? getDate(today) : daysInMonth;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const allCategories = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...(customCategories || [])];
  }, [customCategories]);

  // Category breakdown
  const categoryTotals = useMemo(() => {
    return allCategories.map(cat => ({
      ...cat,
      total: expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0),
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  }, [expenses, allCategories]);

  const topCategory = categoryTotals[0];
  const dailyAvg = totalSpent / (currentDay || 1);

  // Automated Savings Suggestions
  const suggestions = useMemo(() => {
    const list = [];
    
    // Budget check
    if (totalSpent > monthlyBudget) {
      list.push({
        title: "Ceiling Breach Identified",
        desc: "Current deficit exceeding allocation. Immediate logic revision required.",
        icon: "🚨",
        action: "Reduce Variable Sectors",
        color: "#f43f5e"
      });
    }

    // High Daily Avg check
    if (dailyAvg > (monthlyBudget / daysInMonth) * 1.2) {
      list.push({
        title: "Pace Anomaly",
        desc: "Burn rate is 20% higher than ideal trajectory. Projecting early exhaustion.",
        icon: "📉",
        action: "Establish Spending Delay",
        color: "#f59e0b"
      });
    }

    // OTT/Subscription check
    const ottTotal = expenses.filter(e => e.categoryId === 'subscriptions-entertainment').reduce((sum, e) => sum + e.amount, 0);
    if (ottTotal > monthlyBudget * 0.15) {
      list.push({
        title: "Subscription Density",
        desc: "OTT expenditure exceeds 15% of total budget. Potential efficiency leak.",
        icon: "🎬",
        action: "Audit Recurring Subs",
        color: "#ec4899"
      });
    }

    // General high category
    if (topCategory && topCategory.total > monthlyBudget * 0.4) {
      list.push({
        title: `Sector Overload: ${topCategory.label}`,
        desc: `This sector consumes ${Math.round(topCategory.total/monthlyBudget*100)}% of your economy.`,
        icon: topCategory.icon,
        action: "Set Singular Limits",
        color: topCategory.color
      });
    }

    return list.length ? list : [
      {
        title: "System Optimized",
        desc: "All spending metrics within nominal parameters. Efficiency confirmed.",
        icon: "🛡️",
        action: "Maintain Trajectory",
        color: "#10b981"
      }
    ];
  }, [totalSpent, monthlyBudget, dailyAvg, daysInMonth, expenses, topCategory]);

  // Chart Data
  const trendData = useMemo(() => {
    const dailyMap = new Map<number, number>();
    expenses.forEach(e => {
      const day = getDate(parseISO(e.date));
      dailyMap.set(day, (dailyMap.get(day) || 0) + e.amount);
    });

    let cumulative = 0;
    const data = [];
    for (let d = 1; d <= daysInMonth; d++) {
      cumulative += dailyMap.get(d) || 0;
      data.push({
        day: d,
        actual: d <= currentDay ? cumulative : undefined,
        ideal: Math.round((monthlyBudget / daysInMonth) * d),
      });
    }
    return data;
  }, [expenses, daysInMonth, monthlyBudget, currentDay]);

  if (expenses.length === 0) {
    return (
      <div className="space-y-8 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">Economic Pulse</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Initialize logs to begin Pulse sync</p>
        </div>
        <div className="text-center py-24 glass rounded-[2.5rem] border border-dashed border-white/5">
          <p className="text-6xl mb-6 opacity-20 grayscale">📡</p>
          <p className="text-slate-600 text-xs font-black uppercase tracking-[0.3em]">No Signal Detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">Economic Pulse</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Deep Analytics & Projections</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={60} />
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Avg Consumption</p>
           <p className="text-2xl font-black text-white tracking-tighter">{currencySymbol}{Math.round(dailyAvg).toLocaleString()}<span className="text-[10px] text-slate-600 ml-1 font-bold">/LOG</span></p>
        </div>
        <div className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target size={60} />
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Dominant Sector</p>
           <p className="text-2xl font-black text-white tracking-tighter truncate">{topCategory?.label || 'NONE'}</p>
        </div>
      </div>

      {/* Trend Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] p-6 border border-white/5"
      >
        <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Efficiency Trajectory</h2>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-600" /><span className="text-[9px] font-black text-slate-500 uppercase">Actual</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-navy-700" /><span className="text-[9px] font-black text-slate-500 uppercase">Ideal</span></div>
            </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '12px'}}
                itemStyle={{fontWeight: 'bold'}}
              />
              <Area type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              <Line type="monotone" dataKey="ideal" stroke="#1e293b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Savings Advisor */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 ml-1">
           <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings Advisor Projections</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {suggestions.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain size={80} />
              </div>
              <div className="flex gap-4">
                 <div 
                   className="w-12 h-12 rounded-xl bg-navy-900 border border-white/5 flex items-center justify-center text-2xl flex-shrink-0"
                   style={{ color: s.color }}
                 >
                    {s.icon}
                 </div>
                 <div className="flex-1">
                    <h3 className="text-sm font-black text-white tracking-tight uppercase">{s.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">{s.desc}</p>
                    <div className="mt-4 flex items-center gap-2">
                       <span 
                         className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border"
                         style={{ color: s.color, backgroundColor: s.color + '10', borderColor: s.color + '20' }}
                       >
                         {s.action}
                       </span>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Sector Distribution */}
      <div className="glass rounded-[2rem] p-6 border border-white/5">
         <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Sector Capital Weight</h2>
         <div className="space-y-5">
           {categoryTotals.slice(0, 5).map((cat, idx) => {
             const pct = totalSpent > 0 ? (cat.total / totalSpent * 100) : 0;
             return (
               <div key={cat.id} className="group">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-600">0{idx+1}</span>
                       <span className="text-xs font-bold text-white uppercase tracking-tight">{cat.label}</span>
                    </div>
                    <span className="text-xs font-black text-white">{currencySymbol}{cat.total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    />
                  </div>
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
}
