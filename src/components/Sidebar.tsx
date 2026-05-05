import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users,
  TrendingUp, BarChart3, Settings,
  LogOut, Sun, Moon, Receipt, X,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useDataStore } from '../stores/dataStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { path: '/invoices', icon: Receipt, label: 'Invoices', section: 'main' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs', section: 'main' },
  { path: '/clients', icon: Users, label: 'Clients', section: 'main' },
  { path: '/financials', icon: TrendingUp, label: 'Financials', section: 'ops' },
  { path: '/reports', icon: BarChart3, label: 'Reports', section: 'ops' },
  { path: '/settings', icon: Settings, label: 'Settings', section: 'system' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const { settings } = useDataStore();

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
      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          transition: 'transform 0.25s ease',
          zIndex: 40,
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            .sidebar { position: static !important; transform: translateX(0) !important; z-index: auto !important; }
          }
          @media (max-width: 767px) {
            .sidebar { transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important; }
          }
        `}</style>

        {/* Logo */}
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sidebar-logo-mark">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Rolls Communications"
                style={{
                  height: 40,
                  maxWidth: 140,
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  filter: 'brightness(0) invert(1)',
                  display: 'block',
                }}
              />
            ) : (
              <>
                <div className="sidebar-logo-icon">RC</div>
                <div className="sidebar-logo-text">
                  <div className="brand">Rolls Comm.</div>
                  <div className="tagline">Business Portal</div>
                </div>
              </>
            )}
          </div>
          {/* Close button visible on mobile only */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: 'var(--text-sidebar)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
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

        {/* Footer */}
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
