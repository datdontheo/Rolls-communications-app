import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useToast } from '../components/Toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    useThemeStore.getState().initTheme();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (login(username, password)) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid username or password');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-default)] flex flex-col items-center justify-center p-4">
      <button
        onClick={toggle}
        className="fixed top-6 right-6 p-2 rounded-lg bg-[color:var(--color-bg-card)] text-[color:var(--color-text-primary)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-default)] transition-colors"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md">
        <div className="bg-[color:var(--color-bg-card)] rounded-lg border border-[color:var(--color-border)] p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold font-display text-[color:var(--color-primary)] mb-2">
              RC
            </div>
            <h1 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)] mb-1">
              Rolls Communications
            </h1>
            <p className="text-[color:var(--color-text-secondary)] text-sm">
              Business Management Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[color:var(--color-border)]">
            <p className="text-xs text-[color:var(--color-text-secondary)] text-center">
              Demo credentials:<br />
              Username: <strong>admin</strong><br />
              Password: <strong>rolls2024</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
