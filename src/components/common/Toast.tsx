import React from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    error: <AlertTriangle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  const backgrounds = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm sm:bottom-6 sm:right-6" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-in slide-in-from-bottom-4 fade-in',
            backgrounds[toast.type]
          )}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => onDismiss(toast.id)}
            className="text-current opacity-70 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    
    if (toast.duration !== 0) {
      setTimeout(() => dismiss(id), toast.duration || 5000);
    }
  }, [dismiss]);

  return { toasts, show, dismiss };
};