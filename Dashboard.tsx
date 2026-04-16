import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, getDaysInMonth, getDate, parseISO, isSameDay, startOfWeek } from 'date-fns';
import { useApp } from '../AppContext';
import { DEFAULT_CATEGORIES } from '../constants';
import { Calendar, Zap, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { settings, expenses, currentMonth } = useApp();
  const now = useMemo(() => new Date(), []);
  
  if (!settings) return null;

  const { name, monthlyBudget, currencySymbol } = settings;
  const [year, month] = currentMonth.split('-').map(Number);
  
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const remaining = monthlyBudget - totalSpent;

  // Days Until Broke calculation
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const isCurrentMonth = currentMonth === format(now, 'yyyy-MM');
  const currentDay = getDate(now);
  const daysElapsed = isCurrentMonth ? currentDay : daysInMonth;
  const dailyAvg = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
  const daysUntilBroke = dailyAvg > 0 ? Math.round(remaining / dailyAvg) : Infinity;
  const daysLeftInMonth = isCurrentMonth ? daysInMonth - currentDay : 0;
  const dailySafeLimit = daysLeftInMonth > 0 ? remaining / daysLeftInMonth : remaining;

  // Category list with custom categories
  const allCategories = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...(settings.customCategories || [])];
  }, [settings.customCategories]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
    });
    return allCategories.map(cat => ({
      ...cat,
      amount: map.get(cat.id) || 0,
      percentage: totalSpent > 0 ? ((map.get(cat.id) || 0) / totalSpent * 100) : 0,
    })).filter(c => c.amount > 0);
  }, [expenses, totalSpent, allCategories]);

  // Period-based spending (Daily, Weekly, Monthly)
  const stats = useMemo(() => {
    const todayExpenses = expenses.filter(e => isSameDay(parseISO(e.date), now));
    const dailyTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekExpenses = expenses.filter(e => {
      const d = parseISO(e.date);
      // Use getTime() for TS-safe comparisons
      return d.getTime() >= weekStart.getTime() && d.getTime() <= now.getTime();
    });
    const weeklyTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      daily: dailyTotal,
      weekly: weeklyTotal,
      monthly: totalSpent
    };
  }, [expenses, now, totalSpent]);

  // Visual helpers
  const getProgressColor = (pct: number) => {
    if (pct < 50) return '#10b981'; // Green
    if (pct < 85) return '#f59e0b'; // Yellow
    return '#f43f5e'; // Red
  };

  const getDaysColor = () => {
    if (daysUntilBroke === Infinity || totalSpent === 0) return { color: 'text-emerald-400', bg: 'bg-emerald-400', hex: '#10b981' };
    if (daysUntilBroke > 15) return { color: 'text-emerald-400', bg: 'bg-emerald-400', hex: '#10b981' };
    if (daysUntilBroke > 7) return { color: 'text-amber-400', bg: 'bg-amber-400', hex: '#f59e0b' };
    return { color: 'text-rose-400', bg: 'bg-rose-400', hex: '#f43f5e' };
  };

  const getDaysMessage = () => {
    if (totalSpent === 0) return "INF Forever - start spending!";
    if (daysUntilBroke === Infinity) return "INF Forever";
    if (remaining <= 0) return "You're already over budget! 💸";
    if (daysUntilBroke > 15) return "Safe spending zone! 🎉";
    if (daysUntilBroke > 7) return "Moderate spending... 🤔";
    return "Budget risk zone! 🚨";
  };

  const daysStyle = getDaysColor();
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const monthLabel = format(new Date(year, month - 1), 'MMMM yyyy');

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hi, {name}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">{monthLabel}</p>
        </div>
        <div className="bg-navy-800/50 p-2 rounded-2xl border border-white/5 flex gap-1">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
             <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* Period Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Today', value: stats.daily, color: stats.daily > monthlyBudget/30 ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'Weekly', value: stats.weekly, color: stats.weekly > monthlyBudget/4 ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'Monthly', value: stats.monthly, color: percentage > 85 ? 'text-rose-400' : percentage > 50 ? 'text-amber-400' : 'text-emerald-400' },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-2xl p-3 border border-white/5 text-center"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{item.label}</p>
            <p className={`text-sm font-black ${item.color}`}>{currencySymbol}{item.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Budget Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 p-8 opacity-5">
           <TrendingUp size={120} className="text-white" />
         </div>
        
        <div className="flex flex-col items-center">
          {/* Progress Ring */}
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" stroke="#0f172a" strokeWidth="12" fill="none" opacity="0.3" />
              <motion.circle
                cx="80" cy="80" r="70"
                stroke={getProgressColor(percentage)}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spent</span>
              <span className="text-3xl font-black text-white">{currencySymbol}{totalSpent.toLocaleString()}</span>
              <span className="text-xs font-medium text-slate-400 opacity-60">Limit: {currencySymbol}{monthlyBudget.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress bar info */}
          <div className="w-full mt-6">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase mb-2">
              <span>{Math.round(percentage)}% used</span>
              <span>{Math.round(Math.max(0, 100 - percentage))}% available</span>
            </div>
            <div className="h-3 bg-navy-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getProgressColor(percentage) }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Days Until Broke */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass rounded-3xl p-6 relative overflow-hidden border border-white/5 ${daysUntilBroke <= 3 && totalSpent > 0 ? 'danger-pulse' : ''}`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
               <Zap size={16} />
            </div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sustainability</h2>
          </div>
        </div>
        
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <motion.p
              className={`text-6xl font-black italic tracking-tighter ${daysStyle.color}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {totalSpent === 0 ? 'INF' : remaining <= 0 ? '0' : daysUntilBroke === Infinity ? 'INF' : daysUntilBroke}
            </motion.p>
            <p className={`text-xs font-bold mt-1 ${daysStyle.color}`}>
              Days Remaining
            </p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Pace Status</p>
             <div 
               className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${daysStyle.color}`}
               style={{ backgroundColor: daysStyle.hex + '1a' }}
             >
               {getDaysMessage()}
             </div>
          </div>
        </div>

        {totalSpent > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-navy-900/50 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Consumption</p>
              <p className="text-lg font-black text-white">{currencySymbol}{Math.round(dailyAvg)}/day</p>
            </div>
            <div className="bg-navy-900/50 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Safe Threshold</p>
              <p className="text-lg font-black text-emerald-400">{currencySymbol}{Math.round(dailySafeLimit)}/day</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Categories Horizontal View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Sectors</h2>
        </div>
        
        <div className="space-y-4">
          {categoryData.slice(0, 4).map(cat => (
            <div key={cat.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-white/5 border border-white/5">
                {cat.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-white tracking-tight">{cat.label}</span>
                  <span className="text-sm font-black text-white">{currencySymbol}{cat.amount.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-navy-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
" ,Description:
