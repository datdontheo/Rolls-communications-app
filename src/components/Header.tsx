import { useLocation } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your business' },
  '/invoices': { title: 'Invoices', subtitle: 'Manage invoices and receipts' },
  '/quotations': { title: 'Quotations', subtitle: 'Client quotes and proposals' },
  '/jobs': { title: 'Jobs', subtitle: 'Track production and delivery' },
  '/clients': { title: 'Clients', subtitle: 'CRM and client relationships' },
  '/financials': { title: 'Financials', subtitle: 'Income and expense tracking' },
  '/inventory': { title: 'Inventory', subtitle: 'Stock levels and materials' },
  '/reports': { title: 'Reports', subtitle: 'Business analytics and insights' },
  '/settings': { title: 'Settings', subtitle: 'Company profile and preferences' },
};

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const page = PAGE_TITLES[location.pathname] || { title: 'Page', subtitle: '' };
  const initials = (user?.username || 'A').charAt(0).toUpperCase();

  return (
    <header className="top-header">
      {/* Mobile burger — sits inside the header, no overlap */}
      <button
        onClick={onMenuToggle}
        className="menu-burger md:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span className="header-title">{page.title}</span>
        {page.subtitle && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1 }}>{page.subtitle}</span>
        )}
      </div>

      <div className="header-search" style={{ marginLeft: 24 }}>
        <Search className="header-search-icon" size={15} />
        <input placeholder="Search anything…" />
      </div>

      <div className="header-actions">
        <button
          onClick={toggle}
          className="btn btn-ghost btn-icon"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="btn btn-ghost btn-icon" title="Notifications">
          <Bell size={18} />
        </button>

        <div className="header-avatar">
          <div className="header-avatar-dot">{initials}</div>
          <span className="header-avatar-name">{user?.username || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
