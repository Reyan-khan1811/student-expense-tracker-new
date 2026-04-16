import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ClipboardList, BarChart3, Settings as SettingsIcon, Plus, ChevronLeft, ChevronRight, RotateCcw, Calendar } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import { useApp } from '../AppContext';
import Dashboard from './Dashboard';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import CalendarView from './CalendarView';
import SettingsPage from './Settings';
import AddExpenseModal from './AddExpenseModal';
import ToastContainer from './ToastContainer';

type Page = 'dashboard' | 'calendar' | 'expenses' | 'analytics' | 'settings';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="url(#paint0_linear_logo)" />
    <path d="M12 28L20 20L28 28" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 20L20 12L28 20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="paint0_linear_logo" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8b5cf6" />
        <stop offset="1" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Layout() {
  const { currentMonth, setCurrentMonth, resetCurrentMonth, settings } = useApp();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [cmYear, cmMonth] = currentMonth.split('-').map(Number);
  const monthLabel = format(new Date(cmYear, cmMonth - 1), 'MMMM yyyy');
  const isCurrentMonth = currentMonth === format(new Date(), 'yyyy-MM');

  const goToPrevMonth = () => {
    const d = subMonths(new Date(cmYear, cmMonth - 1), 1);
    setCurrentMonth(format(d, 'yyyy-MM'));
  };

  const goToNextMonth = () => {
    if (!isCurrentMonth) {
      const d = addMonths(new Date(cmYear, cmMonth - 1), 1);
      setCurrentMonth(format(d, 'yyyy-MM'));
    }
  };

  const handleReset = () => {
    resetCurrentMonth();
    setShowResetConfirm(false);
  };

  const tabs = [
    { id: 'dashboard' as Page, icon: Home, label: 'Feed' },
    { id: 'calendar' as Page, icon: Calendar, label: 'Timeline' },
    { id: 'expenses' as Page, icon: ClipboardList, label: 'Logs' },
    { id: 'analytics' as Page, icon: BarChart3, label: 'Pulse' },
    { id: 'settings' as Page, icon: SettingsIcon, label: 'Prefs' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <CalendarView />;
      case 'expenses': return <ExpenseList />;
      case 'analytics': return <Analytics />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 p-6 border-r border-white/5 bg-[#1e293b]/50 backdrop-blur-3xl">
        <div className="flex items-center gap-3 mb-12 px-2">
          <Logo />
          <div>
            <h1 className="text-xl font-black text-white leading-none tracking-tighter">FINFLOW</h1>
            <p className="text-[10px] font-bold text-purple-400 mt-1 uppercase tracking-widest">Student Tier</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activePage === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Add expense button (desktop) */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition-all shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
        >
          <Plus size={18} /> New Entry
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-6 relative overflow-x-hidden">
        {/* Top Floating Header */}
        <div className="sticky top-0 z-30 px-4 pt-4">
          <div className="max-w-3xl mx-auto glass rounded-2xl border border-white/5 flex items-center justify-between px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevMonth}
                  className="w-9 h-9 rounded-xl bg-navy-900 border border-white/5 flex items-center justify-center hover:bg-navy-800 transition-all text-slate-500 hover:text-white shadow-inner"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex flex-col items-center min-w-[120px]">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Timeframe</span>
                  <span className="text-sm font-black text-white">{monthLabel}</span>
                </div>
                <button
                  onClick={goToNextMonth}
                  disabled={isCurrentMonth}
                  className="w-9 h-9 rounded-xl bg-navy-900 border border-white/5 flex items-center justify-center hover:bg-navy-800 transition-all text-slate-500 hover:text-white disabled:opacity-20 shadow-inner"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {showResetConfirm ? (
                  <div className="flex items-center gap-2 bg-rose-500/10 p-1 rounded-xl border border-rose-500/20">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-rose-500 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-navy-800 text-slate-400 text-[10px] font-black uppercase tracking-wider hover:bg-navy-700 transition-colors"
                    >
                      Wait
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-navy-900 border border-white/5 text-slate-500 hover:text-white shadow-inner transition-all hover:rotate-12"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "anticipate" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40 glass rounded-[2rem] border border-white/10 shadow-2xl p-1.5 flex justify-between">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all ${
                activePage === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
      </nav>

      {/* FAB - Mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-28 right-6 z-40 w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600 to-cyan-600 text-white shadow-2xl shadow-purple-500/40 flex items-center justify-center border border-white/10"
        animate={{ 
          boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0.4)', '0 0 0 20px rgba(139, 92, 246, 0)', '0 0 0 0 rgba(139, 92, 246, 0.4)'] 
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
