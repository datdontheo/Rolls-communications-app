import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, Users,
  TrendingUp, Package, BarChart3, Settings,
  LogOut, Menu, X, Sun, Moon, Receipt,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { path: '/invoices', icon: Receipt, label: 'Invoices', section: 'main' },
  { path: '/quotations', icon: FileText, label: 'Quotations', section: 'main' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs', section: 'main' },
  { path: '/clients', icon: Users, label: 'Clients', section: 'main' },
  { path: '/financials', icon: TrendingUp, label: 'Financials', section: 'ops' },
  { path: '/inventory', icon: Package, label: 'Inventory', section: 'ops' },
  { path: '/reports', icon: BarChart3, label: 'Reports', section: 'ops' },
  { path: '/settings', icon: Settings, label: 'Settings', section: 'system' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  const mainNav = navItems.filter(n => n.section === 'main');
  const opsNav = navItems.filter(n => n.section === 'ops');
  const systemNav = navItems.filter(n => n.section === 'system');

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#141414] text-white shadow-lg md:hidden"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          transform: isOpen ? 'translateX(0)' : undefined,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Desktop: static, Mobile: fixed overlay */}
        <style>{`
          @media (min-width: 768px) {
            .sidebar { position: static !important; transform: translateX(0) !important; }
          }
          @media (max-width: 767px) {
            .sidebar { transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important; }
          }
        `}</style>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">RC</div>
            <div className="sidebar-logo-text">
              <div className="brand">Rolls Comm.</div>
              <div className="tagline">Business Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Workspace</div>
          {mainNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </Link>
          ))}

          <div className="nav-section-label" style={{ marginTop: 20 }}>Operations</div>
          {opsNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </Link>
          ))}

          <div className="nav-section-label" style={{ marginTop: 20 }}>System</div>
          {systemNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="sidebar-footer">
          <button onClick={toggle} className="nav-item" style={{ width: '100%' }}>
            {isDark ? <Sun size={16} className="nav-icon" /> : <Moon size={16} className="nav-icon" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', color: '#ef4444' }}>
            <LogOut size={16} className="nav-icon" style={{ color: '#ef4444' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
