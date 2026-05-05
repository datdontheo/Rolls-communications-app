import { useLocation } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Header() {
  const location = useLocation();
  const { user } = useAuthStore();

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: { [key: string]: string } = {
      '/': 'Dashboard',
      '/invoices': 'Invoices',
      '/quotations': 'Quotations',
      '/jobs': 'Jobs',
      '/clients': 'Clients',
      '/financials': 'Financials',
      '/inventory': 'Inventory',
      '/reports': 'Reports',
      '/settings': 'Settings',
    };
    return titles[path] || 'Page';
  };

  return (
    <header className="bg-[color:var(--color-bg-card)] border-b border-[color:var(--color-border)] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">
          {getPageTitle()}
        </h1>

        <div className="flex-1 max-w-md hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-secondary)]" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-bg-default)]">
            <User size={18} className="text-[color:var(--color-text-secondary)]" />
            <span className="text-sm font-medium text-[color:var(--color-text-primary)]">{user?.username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
