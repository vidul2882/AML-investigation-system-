import React from 'react';
import { useAML } from '../../context/AMLContext';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAML();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notification-container"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let border = 'border-slate-200 bg-white text-slate-900';
        let Icon = Info;
        let iconColor = 'text-blue-500';

        if (toast.type === 'success') {
          border = 'border-emerald-200 bg-emerald-50/95 text-emerald-950';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'warning') {
          border = 'border-amber-200 bg-amber-50/95 text-amber-950';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        } else if (toast.type === 'error') {
          border = 'border-rose-200 bg-rose-50/95 text-rose-950';
          Icon = AlertOctagon;
          iconColor = 'text-rose-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 transform translate-y-0 ${border}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
