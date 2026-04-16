import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, Globe, Download, Trash2, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../AppContext';
import { CURRENCIES } from '../constants';
import { exportToCSV } from '../storage';

export default function Settings() {
  const { settings, expenses, saveUserSettings, clearAll, addCustomCategory, removeCustomCategory } = useApp();
  const [name, setName] = useState(settings?.name || '');
  const [budget, setBudget] = useState(settings?.monthlyBudget.toString() || '');
  const [currencyIdx, setCurrencyIdx] = useState(
    CURRENCIES.findIndex(c => c.code === settings?.currency) || 0
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearText, setClearText] = useState('');
  const [saved, setSaved] = useState(false);

  if (!settings) return null;

  const currency = CURRENCIES[currencyIdx >= 0 ? currencyIdx : 0];
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = () => {
    if (!name.trim() || !budget || parseFloat(budget) <= 0) return;
    saveUserSettings({
      ...settings,
      name: name.trim(),
      monthlyBudget: parseFloat(budget),
      currency: currency.code,
      currencySymbol: currency.symbol,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const csv = exportToCSV(expenses, settings.currencySymbol, settings.customCategories);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (clearText === 'DELETE') {
      clearAll();
    }
  };

  const budgetWarning = parseFloat(budget) < totalSpent && parseFloat(budget) > 0;

  return (
    <div className="space-y-5 pb-4">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <User size={14} /> Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Wallet size={14} /> Monthly Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-purple-400 font-bold">
                {currency.symbol}
              </span>
              <input
                id="settings-budget"
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-navy-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            {budgetWarning && (
              <div className="flex items-center gap-2 mt-2 text-amber-400 text-xs">
                <AlertTriangle size={14} />
                <span>New budget is less than current spending ({settings.currencySymbol}{totalSpent.toLocaleString()})</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Globe size={14} /> Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CURRENCIES.map((c, idx) => (
                <button
                  key={c.code}
                  onClick={() => setCurrencyIdx(idx)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    idx === currencyIdx
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-navy-900/50 text-slate-400 border border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition-all shadow-lg shadow-purple-500/20"
          >
            {saved ? '✅ Verified!' : 'Sync Prefs'}
          </motion.button>
        </div>
      </motion.div>

      {/* Categories Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           Sector Management
        </h2>
        
        <div className="space-y-3 mb-6">
           <p className="text-[10px] font-bold text-slate-500 uppercase ml-1">Custom Sectors</p>
           {(settings.customCategories || []).length === 0 ? (
             <div className="bg-navy-900/40 rounded-xl p-4 text-center border border-dashed border-white/5">
                <p className="text-xs text-slate-500">No custom sectors added yet</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-2">
               {settings.customCategories.map(cat => (
                 <div key={cat.id} className="flex items-center justify-between bg-navy-900/60 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-bold text-white">{cat.label}</span>
                    </div>
                    <button 
                      onClick={() => removeCustomCategory(cat.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="bg-navy-900/40 p-4 rounded-xl border border-white/5 space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Extend Framework</p>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Label" 
              className="bg-navy-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              id="new-cat-label"
            />
            <input 
              type="text" 
              placeholder="Icon (Emoji)" 
              className="bg-navy-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              id="new-cat-icon"
            />
          </div>
          <button 
            onClick={() => {
              const label = (document.getElementById('new-cat-label') as HTMLInputElement).value;
              const icon = (document.getElementById('new-cat-icon') as HTMLInputElement).value;
              if (label && icon) {
                addCustomCategory({
                  id: Date.now().toString(),
                  label,
                  icon,
                  color: '#8b5cf6'
                });
                (document.getElementById('new-cat-label') as HTMLInputElement).value = '';
                (document.getElementById('new-cat-icon') as HTMLInputElement).value = '';
              }
            }}
            className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Add New Sector
          </button>
        </div>
      </motion.div>

      {/* Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Download size={14} /> Export Data
        </h2>
        <p className="text-sm text-slate-400 mb-3">
          Download all your expenses as a CSV file for use in spreadsheets.
        </p>
        <button
          onClick={handleExport}
          disabled={expenses.length === 0}
          className="w-full py-3 rounded-xl font-semibold text-white bg-navy-900/50 border border-white/10 hover:border-purple-500/30 hover:bg-navy-900/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Export as CSV ({expenses.length} expenses)
        </button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5 border-rose-500/20"
      >
        <h2 className="text-sm font-medium text-rose-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Trash2 size={14} /> Danger Zone
        </h2>
        <p className="text-sm text-slate-400 mb-3">
          This will permanently delete all your data, including settings and expenses. This cannot be undone.
        </p>
        
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 rounded-xl font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            Clear All Data
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <p className="text-sm text-rose-300 font-medium">
                Type "DELETE" to confirm:
              </p>
              <input
                id="settings-clear-confirm"
                type="text"
                value={clearText}
                onChange={e => setClearText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-navy-900/50 border border-rose-500/30 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowClearConfirm(false); setClearText(''); }}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-navy-900/50 border border-white/10 hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearText !== 'DELETE'}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Info size={14} /> About
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <p>Student Expense Tracker v1.0.0</p>
          <p>Built with React, TypeScript & Tailwind CSS</p>
          <p className="text-slate-500 text-xs mt-2">Your data is stored locally in your browser.</p>
        </div>
      </motion.div>
    </div>
  );
}
