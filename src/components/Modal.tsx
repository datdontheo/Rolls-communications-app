import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, title, onClose, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-[color:var(--color-bg-card)] rounded-lg shadow-xl w-full ${sizeClasses[size]}`}>
        <div className="flex items-center justify-between p-6 border-b border-[color:var(--color-border)]">
          <h2 className="text-xl font-bold font-display text-[color:var(--color-text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
