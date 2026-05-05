import { useEffect, useState } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toastStore: {
  toasts: Toast[];
  listeners: Set<() => void>;
  add: (message: string, type: ToastType) => void;
  remove: (id: string) => void;
  subscribe: (listener: () => void) => () => void;
} = {
  toasts: [],
  listeners: new Set(),
  add(message: string, type: ToastType = 'info') {
    const id = Math.random().toString(36).substr(2, 9);
    this.toasts.push({ id, message, type });
    this.listeners.forEach((listener) => listener());
    setTimeout(() => this.remove(id), 3000);
  },
  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
};

export { toastStore };

export function useToast() {
  return {
    success: (message: string) => toastStore.add(message, 'success'),
    error: (message: string) => toastStore.add(message, 'error'),
    info: (message: string) => toastStore.add(message, 'info'),
  };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastStore.subscribe(() => {
      setToasts([...toastStore.toasts]);
    });
    return unsubscribe;
  }, []);

  const icons: { [key in ToastType]: JSX.Element } = {
    success: <Check size={20} className="text-green-600" />,
    error: <AlertCircle size={20} className="text-red-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };

  const bgColors: { [key in ToastType]: string } = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg border ${bgColors[toast.type]} animate-in fade-in slide-in-from-bottom-4 duration-300`}
        >
          {icons[toast.type]}
          <p className="text-sm font-medium text-[color:var(--color-text-primary)] flex-1">
            {toast.message}
          </p>
          <button
            onClick={() => toastStore.remove(toast.id)}
            className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
