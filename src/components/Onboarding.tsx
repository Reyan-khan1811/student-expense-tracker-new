import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../AppContext';
import { CURRENCIES } from '../constants';
import type { UserSettings } from '../types';

const Logo = () => (
  <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="url(#paint0_linear_logo_onboarding)" />
    <path d="M12 28L20 20L28 28" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 20L20 12L28 20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="paint0_linear_logo_onboarding" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8b5cf6" />
        <stop offset="1" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Onboarding() {
  const { saveUserSettings } = useApp();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [currencyIdx, setCurrencyIdx] = useState(0);
  const [step, setStep] = useState(0);

  const currency = CURRENCIES[currencyIdx];

  const handleSubmit = () => {
    if (!name.trim() || !budget || parseFloat(budget) <= 0) return;
    const settings: UserSettings = {
      name: name.trim(),
      monthlyBudget: parseFloat(budget),
      currency: currency.code,
      currencySymbol: currency.symbol,
      createdAt: new Date().toISOString(),
      customCategories: [],
    };
    saveUserSettings(settings);
  };

  const canProceed = step === 0 ? name.trim().length > 0 : parseFloat(budget) > 0;

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
           <motion.div 
             initial={{ y: -20 }} 
             animate={{ y: 0 }}
             className="mb-6 p-4 glass rounded-3xl border border-white/10 shadow-2xl"
           >
              <Logo />
           </motion.div>
           <h1 className="text-4xl font-black text-white tracking-tighter leading-none text-center">FINFLOW</h1>
           <p className="text-[10px] font-black text-purple-400 mt-2 uppercase tracking-[0.4em]">Initialize Your Economy</p>
        </div>

        <div className="glass rounded-[2.5rem] p-10 border border-white/10 shadow-full relative">

        {step === 0 ? (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h1 className="text-2xl font-black text-white mb-2">Identify User</h1>
            <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-widest">Verification Required</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name Alias</label>
                <input
                  id="onboarding-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter alias..."
                  className="w-full bg-navy-900 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && canProceed && setStep(1)}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => canProceed && setStep(1)}
                disabled={!canProceed}
                className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 to-cyan-600 disabled:opacity-20 disabled:grayscale transition-all shadow-xl shadow-purple-500/20 uppercase tracking-[0.2em] text-xs"
              >
                Proceed Log →
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-black text-white mb-2">Budget Config</h1>
            <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-widest">Monthly Allocation</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Asset Currency</label>
                <div className="grid grid-cols-4 gap-2">
                  {CURRENCIES.map((c, idx) => (
                    <button
                      key={c.code}
                      onClick={() => setCurrencyIdx(idx)}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all ${
                        idx === currencyIdx
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-navy-900 text-slate-600 border border-white/5 hover:border-purple-500/30'
                      }`}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Spending Ceiling</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-purple-400 font-black">
                    {currency.symbol}
                  </span>
                  <input
                    id="onboarding-budget"
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-navy-900 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white text-2xl font-black placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && canProceed && handleSubmit()}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="px-6 py-4 rounded-2xl font-black text-[10px] text-slate-500 bg-white/5 border border-white/5 hover:text-white transition-all uppercase tracking-widest"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!canProceed}
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 to-cyan-600 disabled:opacity-20 transition-all shadow-xl shadow-purple-500/20 uppercase tracking-[0.2em] text-xs"
                >
                  Deploy Flow 🚀
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step indicators */}
        <div className="flex justify-center gap-3 mt-10">
          <div className={`h-1 rounded-full transition-all duration-500 ${step === 0 ? 'bg-purple-500 w-12' : 'bg-white/10 w-4'}`} />
          <div className={`h-1 rounded-full transition-all duration-500 ${step === 1 ? 'bg-purple-500 w-12' : 'bg-white/10 w-4'}`} />
        </div>
      </motion.div>
    </div>
  );
}
