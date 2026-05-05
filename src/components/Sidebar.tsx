import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  TrendingUp,
  Box,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { Moon, Sun } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/invoices', icon: FileText, label: 'Invoices' },
    { path: '/quotations', icon: FileText, label: 'Quotations' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/financials', icon: TrendingUp, label: 'Financials' },
    { path: '/inventory', icon: Box, label: 'Inventory' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-[color:var(--color-primary)] text-white' : 'text-[color:var(--color-text-sidebar)] hover:bg-opacity-20 hover:bg-white';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[color:var(--color-bg-sidebar)] p-2 rounded-lg text-[color:var(--color-text-sidebar)]"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static w-64 h-screen bg-[color:var(--color-bg-sidebar)] text-[color:var(--color-text-sidebar)] transition-transform duration-300 ease-in-out z-40 flex flex-col border-r border-[color:var(--color-border)]`}
      >
        <div className="p-6 border-b border-[color:var(--color-border)]">
          <h1 className="text-2xl font-bold font-display text-[color:var(--color-primary)]">
            RC
          </h1>
          <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">Rolls Communications</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${isActive(item.path)}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[color:var(--color-border)] space-y-3">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[color:var(--color-text-sidebar)] hover:bg-opacity-20 hover:bg-white transition-all duration-200"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{isDark ? 'Light' : 'Dark'} Mode</span>
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[color:var(--color-text-sidebar)] hover:bg-opacity-20 hover:bg-white transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
