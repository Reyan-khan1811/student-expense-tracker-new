import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Pencil, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';
import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useApp } from '../AppContext';
import { DEFAULT_CATEGORIES, getCategoryInfo } from '../constants';
import type { Expense } from '../types';
import AddExpenseModal from './AddExpenseModal';

type SortBy = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function ExpenseList() {
  const { settings, expenses, removeExpense } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (!settings) return null;
  const { currencySymbol, customCategories } = settings;

  const allCategories = [...DEFAULT_CATEGORIES, ...(customCategories || [])];

  const filtered = useMemo(() => {
    let result = [...expenses];

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(e => e.categoryId === categoryFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.description.toLowerCase().includes(q) ||
        getCategoryInfo(e.categoryId, customCategories).label.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        default: return 0;
      }
    });

    return result;
  }, [expenses, categoryFilter, search, sortBy, customCategories]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { label: string; expenses: Expense[] }[] = [];
    const groupMap = new Map<string, Expense[]>();

    filtered.forEach(expense => {
      const d = parseISO(expense.date);
      let label: string;
      if (isToday(d)) label = 'Current Block (Today)';
      else if (isYesterday(d)) label = 'Previous Block (Yesterday)';
      else if (isThisWeek(d)) label = 'Earlier This Week';
      else label = format(d, 'MMMM d, yyyy');

      if (!groupMap.has(label)) groupMap.set(label, []);
      groupMap.get(label)!.push(expense);
    });

    groupMap.forEach((exps, label) => {
      groups.push({ label, expenses: exps });
    });

    return groups;
  }, [filtered]);

  const totalFiltered = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered]);

  const handleDelete = (id: string) => {
    removeExpense(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">Transaction Logs</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Immutable History</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-500/5 blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          id="expense-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH LOGS..."
          className="relative w-full bg-navy-900 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-bold text-xs"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${showFilters ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-white'}`}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-3xl p-6 space-y-5 border border-white/5">
              {/* Category chips */}
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Filter by Sector</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      categoryFilter === 'all'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-navy-900 border border-white/5 text-slate-600 hover:text-slate-200'
                    }`}
                  >
                    All Sectors
                  </button>
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        categoryFilter === cat.id
                          ? 'text-white'
                          : 'bg-navy-900 border border-white/5 text-slate-600 hover:text-slate-200'
                      }`}
                      style={categoryFilter === cat.id ? { backgroundColor: cat.color + '30', borderColor: cat.color + '50', color: cat.color } : undefined}
                    >
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense List */}
      {grouped.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/5">
          <p className="text-5xl mb-6 opacity-20 grayscale">📂</p>
          <p className="text-slate-600 text-xs font-black uppercase tracking-[0.3em]">Empty Buffer</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500/50" />
                {group.label}
              </p>
              <div className="space-y-3">
                {group.expenses.map(expense => {
                  const cat = getCategoryInfo(expense.categoryId, settings.customCategories);
                  return (
                    <motion.div
                      key={expense.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-2xl p-4 flex items-center gap-4 group border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-navy-900/50 border border-white/5"
                        style={{ color: cat.color }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate tracking-tight uppercase">
                          {expense.description || cat.label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-lg uppercase">{cat.label}</span>
                           <span className="text-[9px] font-bold text-purple-400 uppercase italic opacity-60">{expense.frequency}</span>
                        </div>
                      </div>
                      <div className="text-right mr-2">
                        <p className="text-base font-black text-white">
                          -{currencySymbol}{expense.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="w-9 h-9 rounded-xl bg-navy-900 border border-white/5 flex items-center justify-center hover:bg-navy-800 text-slate-600 hover:text-purple-400 transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(expense.id)}
                          className="w-9 h-9 rounded-xl bg-navy-900 border border-white/5 flex items-center justify-center hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-all"
                        >
                          {deleteConfirm === expense.id ? <Trash2 size={14} className="text-rose-500" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                      {deleteConfirm === expense.id && (
                        <div className="absolute inset-0 bg-rose-600/90 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center gap-4 animate-in fade-in zoom-in duration-200">
                           <p className="text-white text-xs font-black uppercase tracking-widest">Wipe Entry?</p>
                           <button onClick={() => handleDelete(expense.id)} className="bg-white text-rose-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase">Yes</button>
                           <button onClick={() => setDeleteConfirm(null)} className="text-white text-[10px] font-black uppercase underline decoration-2 underline-offset-4">Abstain</button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {filtered.length > 0 && (
        <div className="glass rounded-3xl p-6 flex justify-between items-center border border-purple-500/20 bg-purple-500/5 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Deficit</span>
            <span className="text-xs font-bold text-slate-400">{filtered.length} Indexed Logs</span>
          </div>
          <span className="text-2xl font-black text-white italic tracking-tighter">
            -{currencySymbol}{totalFiltered.toLocaleString()}
          </span>
        </div>
      )}

      {/* Edit modal */}
      <AddExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        editingExpense={editingExpense}
      />
    </div>
  );
}
