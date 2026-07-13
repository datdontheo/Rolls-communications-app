import { useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useDataStore } from '../stores/dataStore';

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { error, clearError } = useDataStore();

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="main-area">
        <Header onMenuToggle={() => setSidebarOpen(o => !o)} />
        {error && (
          <div className="alert alert-error" role="alert" style={{ borderRadius: 0, margin: 0 }}>
            <AlertTriangle size={18} className="alert-icon" />
            <div className="alert-content">
              <div className="alert-title">Something went wrong</div>
              <div className="alert-body">{error}</div>
            </div>
            <button onClick={clearError} className="btn btn-ghost btn-icon btn-sm" aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
