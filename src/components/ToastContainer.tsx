import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../AppContext';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-emerald-400" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-400" />;
      case 'error': return <AlertCircle size={18} className="text-rose-400" />;
      default: return null;
    }
  };

  const getBorder = (type: string) => {
    switch (type) {
      case 'success': return 'border-emerald-500/30';
      case 'warning': return 'border-amber-500/30';
      case 'error': return 'border-rose-500/30';
      default: return 'border-white/10';
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none md:bottom-6">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl pointer-events-auto border ${getBorder(toast.type)} min-w-[280px]`}
          >
            {getIcon(toast.type)}
            <span className="text-sm text-white font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
