import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((msg, dur) => showToast(msg, 'success', dur), [showToast]);
  const showError = useCallback((msg, dur) => showToast(msg, 'error', dur), [showToast]);
  const showWarning = useCallback((msg, dur) => showToast(msg, 'warning', dur), [showToast]);
  const showInfo = useCallback((msg, dur) => showToast(msg, 'info', dur), [showToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { message, type } = toast;

  // Icon and border/bg colors based on toast type
  let Icon = Info;
  let themeStyles = '';

  switch (type) {
    case 'success':
      Icon = CheckCircle;
      themeStyles = 'border-emerald-500/20 bg-emerald-950/40 text-emerald-300';
      break;
    case 'error':
      Icon = AlertCircle;
      themeStyles = 'border-rose-500/20 bg-rose-950/40 text-rose-300';
      break;
    case 'warning':
      Icon = AlertTriangle;
      themeStyles = 'border-amber-500/20 bg-amber-950/40 text-amber-300';
      break;
    case 'info':
    default:
      Icon = Info;
      themeStyles = 'border-sky-500/20 bg-sky-950/40 text-sky-300';
      break;
  }

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-in ${themeStyles}`}
      style={{
        animation: 'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-grow text-sm font-medium pr-2 text-left text-on-surface">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-secondary hover:text-on-surface hover:bg-white/10 rounded-lg p-0.5 transition-colors cursor-pointer flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
