
import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const toastStyles = {
  success: {
    icon: CheckCircle2,
    container: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-800',
  },
  error: {
    icon: AlertCircle,
    container: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-800',
  },
  info: {
    icon: Info,
    container: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800',
  },
};

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const type = toast.type || 'info';
  const style = toastStyles[type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-[calc(100%-2.5rem)] animate-in slide-in-from-right duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg ${style.container}`}
        role="alert"
      >
        <Icon
          size={22}
          className={`${style.iconColor} shrink-0 mt-0.5`}
        />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.textColor}`}>
            {toast.message || toast.title || 'Notification'}
          </p>

          {toast.description && (
            <p className={`text-xs mt-1 ${style.textColor} opacity-80`}>
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`${style.iconColor} hover:opacity-70 transition-opacity`}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
