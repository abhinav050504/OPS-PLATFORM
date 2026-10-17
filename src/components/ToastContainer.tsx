import React from 'react';
import { useOps } from '../context/OpsContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useOps();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-900/95';
      case 'error':
        return 'border-rose-500/50 bg-slate-900/95';
      case 'warning':
        return 'border-amber-500/50 bg-slate-900/95';
      default:
        return 'border-indigo-500/40 bg-slate-900/95';
    }
  };

  return (
    <aside aria-label="Notifications" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-slideUp flex items-start gap-3 ${getBorderColor(
            toast.type
          )}`}
        >
          {getIcon(toast.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-white">{toast.title}</span>
              <span className="text-[10px] font-mono text-slate-500">{toast.timestamp}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.description}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-500 hover:text-slate-300 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </aside>
  );
};
