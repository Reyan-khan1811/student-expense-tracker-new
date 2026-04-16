import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, parseISO, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../AppContext';
import { getCategoryInfo } from '../constants';
import type { Expense } from '../types';

export default function CalendarView() {
  const { expenses, currentMonth, settings } = useApp();
  const [selectedDay, setSelectedDay] = useState<Date | null>(startOfToday());

  const { currencySymbol } = settings || { currencySymbol: '₹' };

  const [year, month] = currentMonth.split('-').map(Number);
  const monthDate = new Date(year, month - 1);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate),
  });

  const startEmptyDays = getDay(daysInMonth[0]);
  const emptyDays = Array.from({ length: startEmptyDays }, (_, i) => i);

  const getExpensesForDay = (day: Date) => {
    return expenses.filter(e => isSameDay(parseISO(e.date), day));
  };

  const getDailyTotal = (day: Date) => {
    return getExpensesForDay(day).reduce((sum, e) => sum + e.amount, 0);
  };

  const dayExpenses = selectedDay ? getExpensesForDay(selectedDay) : [];

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {daysInMonth.map(day => {
            const total = getDailyTotal(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isToday = isSameDay(day, startOfToday());

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all border ${
                  isSelected
                    ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/20 z-10'
                    : isToday
                    ? 'bg-navy-900 border-purple-500/50 text-purple-400'
                    : 'bg-navy-900/30 border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                {total > 0 && (
                  <div
                    className={`mt-1 h-1 w-1 rounded-full ${
                      total > (settings?.monthlyBudget || 5000) / 30 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedDay.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">
                {format(selectedDay, 'MMMM d, yyyy')}
              </h3>
              <span className="text-xs font-medium text-slate-400">
                Total: <span className="text-white font-bold">{currencySymbol}{getDailyTotal(selectedDay).toLocaleString()}</span>
              </span>
            </div>

            {dayExpenses.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-500">No expenses on this day</p>
            ) : (
              <div className="space-y-2">
                {dayExpenses.map(expense => {
                  const cat = getCategoryInfo(expense.categoryId, settings?.customCategories);
                  return (
                    <div key={expense.id} className="flex items-center gap-3 bg-navy-900/40 rounded-xl p-2.5">
                      <div className="text-lg">{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate font-medium">{expense.description || cat.label}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{expense.frequency}</p>
                      </div>
                      <p className="text-xs font-bold text-white">-{currencySymbol}{expense.amount.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
