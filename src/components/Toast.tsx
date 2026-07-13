import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast { id: string; message: string; type: ToastType; }

const toastStore = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),
  add(message: string, type: ToastType = 'info') {
    const id = Math.random().toString(36).substr(2, 9);
    this.toasts = [...this.toasts, { id, message, type }];
    this.listeners.forEach(fn => fn());
    setTimeout(() => this.remove(id), 4000);
  },
  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.listeners.forEach(fn => fn());
  },
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  },
};

export { toastStore };

export function useToast() {
  return {
    success: (msg: string) => toastStore.add(msg, 'success'),
    error: (msg: string) => toastStore.add(msg, 'error'),
    info: (msg: string) => toastStore.add(msg, 'info'),
  };
}

const ICONS: Record<ToastType, JSX.Element> = {
  success: <CheckCircle size={18} style={{ color: '#22c55e' }} />,
  error: <AlertCircle size={18} style={{ color: '#ef4444' }} />,
  info: <Info size={18} style={{ color: '#3b82f6' }} />,
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = toastStore.subscribe(() => setToasts([...toastStore.toasts]));
    return unsub;
  }, []);

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          <span className="toast-icon">{ICONS[toast.type]}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => toastStore.remove(toast.id)} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
