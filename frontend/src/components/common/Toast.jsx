import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', message, id } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />,
    error: <XCircle className="text-rose-400 shrink-0" size={20} />,
    warning: <AlertTriangle className="text-amber-400 shrink-0" size={20} />,
    info: <Info className="text-sky-400 shrink-0" size={20} />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-900/95 shadow-emerald-950/40',
    error: 'border-rose-500/40 bg-slate-900/95 shadow-rose-950/40',
    warning: 'border-amber-500/40 bg-slate-900/95 shadow-amber-950/40',
    info: 'border-sky-500/40 bg-slate-900/95 shadow-sky-950/40'
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500'
  };

  return (
    <aside
      aria-label="Notification"
      className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${borders[type] || borders.info}`}
      >
        <div className="flex items-start gap-3">
          <div className="pt-0.5">{icons[type] || icons.info}</div>
          <div className="flex-1 text-sm text-slate-100 font-medium leading-relaxed">
            {message}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar countdown */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
          <div
            className={`h-full ${progressColors[type] || progressColors.info} transition-all`}
            style={{
              animation: 'toastCountdown 4.5s linear forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes toastCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </aside>
  );
}

