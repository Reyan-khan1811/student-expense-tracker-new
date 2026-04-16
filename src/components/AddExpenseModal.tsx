import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../AppContext';
import { DEFAULT_CATEGORIES } from '../constants';
import type { Frequency, Expense } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingExpense?: Expense | null;
}

export default function AddExpenseModal({ isOpen, onClose, editingExpense }: Props) {
  const { settings, addNewExpense, editExpense } = useApp();
  const [amount, setAmount] = useState(editingExpense?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(editingExpense?.categoryId || 'food-canteen');
  const [description, setDescription] = useState(editingExpense?.description || '');
  const [date, setDate] = useState(editingExpense?.date || format(new Date(), 'yyyy-MM-dd'));
  const [frequency, setFrequency] = useState<Frequency>(editingExpense?.frequency || 'one-time');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!settings) return null;

  const allCategories = [...DEFAULT_CATEGORIES, ...(settings.customCategories || [])];

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const data = {
        amount: parseFloat(amount),
        categoryId,
        description: description.trim(),
        date,
        frequency,
      };

      if (editingExpense) {
        editExpense({
          ...editingExpense,
          ...data,
        });
      } else {
        addNewExpense(data);
      }

      setIsSubmitting(false);
      resetForm();
      onClose();
    }, 300);
  };

  const resetForm = () => {
    setAmount('');
    setCategoryId('food-canteen');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setFrequency('one-time');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg"
          >
            <div className="glass rounded-t-[2.5rem] md:rounded-[2rem] p-8 pb-10 border-t border-white/10 shadow-2xl">
              {/* Handle bar (mobile) */}
              <div className="flex justify-center mb-6 md:hidden">
                <div className="w-12 h-1.5 bg-slate-700/50 rounded-full" />
              </div>

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {editingExpense ? 'Edit Entry' : 'New Expense'}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Transaction Logistics</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl bg-navy-900 border border-white/5 flex items-center justify-center hover:bg-navy-800 transition-all"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Amount */}
              <div className="mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-purple-400 font-black">
                    {settings.currencySymbol}
                  </span>
                  <input
                    id="expense-amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="relative w-full bg-navy-900/80 border border-white/10 rounded-2xl pl-16 pr-6 py-6 text-white text-4xl font-black placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Grid */}
              <div className="mb-8">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Sector</label>
                <div className="grid grid-cols-3 gap-3">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border ${
                        categoryId === cat.id
                          ? 'border-2 text-white shadow-xl shadow-current'
                          : 'bg-navy-900/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                      }`}
                      style={categoryId === cat.id ? {
                        borderColor: cat.color,
                        backgroundColor: cat.color + '15',
                        color: cat.color
                      } : undefined}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter truncate w-full text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Selector */}
              <div className="mb-8">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Frequency</label>
                <div className="grid grid-cols-3 gap-2 bg-navy-900/50 p-1.5 rounded-2xl border border-white/5">
                  {(['one-time', 'weekly', 'monthly'] as Frequency[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        frequency === f
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {f.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {/* Description */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Notes</label>
                  <input
                    id="expense-description"
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Reference..."
                    className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                  />
                </div>
                {/* Date */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Timeline</label>
                  <input
                    id="expense-date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-medium [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
                className="w-full py-5 rounded-[1.25rem] font-black text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xl shadow-purple-500/40 text-sm uppercase tracking-[0.3em]"
              >
                {isSubmitting ? 'Processing...' : editingExpense ? 'Update Log' : 'Commit Expense'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
