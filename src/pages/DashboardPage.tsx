import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Briefcase, DollarSign, FileText, AlertCircle, AlertTriangle,
  Clock, ArrowRight, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import { eachMonthOfInterval, subMonths } from 'date-fns';

const COLORS = ['#1D9E75', '#BA7517', '#2D9F8F', '#D4891F', '#6366f1'];

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(' ', '-');
  return <span className={`badge badge-${s}`}>{status}</span>;
}

export default function DashboardPage() {
  const { invoices, jobs, income, expenses, settings, stock } = useDataStore();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const activeJobs = jobs.filter(j => ['New', 'In Progress', 'Under Review'].includes(j.status)).length;
    const dueInvoices = invoices.filter(inv => inv.dueDate && new Date(inv.dueDate) <= weekFromNow && inv.status !== 'Paid');
    const monthlyIncome = income.filter(i => new Date(i.date) >= thisMonth).reduce((s, i) => s + i.amount, 0);
    const pendingApprovals = jobs.filter(j => j.status === 'Under Review').length;
    const lowStock = stock.filter(s => s.currentStock <= s.reorderLevel).length;
    return { activeJobs, invoicesDue: dueInvoices.length, invoicesDueTotal: dueInvoices.reduce((s, i) => s + i.total, 0), monthlyIncome, pendingApprovals, lowStock };
  }, [invoices, jobs, income, settings, stock]);

  const chartData = useMemo(() => {
    return eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() }).map(month => {
      const s = new Date(month.getFullYear(), month.getMonth(), 1);
      const e = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const rev = income.filter(i => new Date(i.date) >= s && new Date(i.date) <= e).reduce((sum, i) => sum + i.amount, 0);
      const exp = expenses.filter(ex => new Date(ex.date) >= s && new Date(ex.date) <= e).reduce((sum, e) => sum + e.amount, 0);
      return { month: month.toLocaleDateString('en-US', { month: 'short' }), Revenue: rev, Expenses: exp };
    });
  }, [income, expenses]);

  const serviceData = useMemo(() => {
    const map: Record<string, number> = {};
    income.forEach(i => { map[i.serviceType] = (map[i.serviceType] || 0) + i.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [income]);

  const recentActivity = useMemo(() => {
    const j = jobs.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4)
      .map(j => ({ type: 'Job', desc: j.clientName, sub: j.serviceType, date: j.updatedAt, status: j.status, link: '/jobs' }));
    const inv = invoices.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3)
      .map(i => ({ type: 'Invoice', desc: i.clientName, sub: i.number, date: i.updatedAt, status: i.status, link: '/invoices' }));
    return [...j, ...inv].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [jobs, invoices]);

  return (
    <Layout>
      {/* Stats */}
      <div className="grid-5" style={{ marginBottom: 24 }}>
        <StatCard icon={<Briefcase size={20} />} label="Active Jobs" value={stats.activeJobs} />
        <StatCard icon={<FileText size={20} />} label="Invoices Due" value={stats.invoicesDue} trendLabel="this week" />
        <StatCard icon={<DollarSign size={20} />} label="Monthly Income" value={formatCurrency(stats.monthlyIncome, settings.currency)} accent />
        <StatCard icon={<AlertCircle size={20} />} label="Pending Review" value={stats.pendingApprovals} />
        <StatCard icon={<AlertTriangle size={20} />} label="Low Stock" value={stats.lowStock} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Revenue vs Expenses</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Last 6 months overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                cursor={{ fill: 'var(--bg)', radius: 4 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Revenue by Service</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Income breakdown</p>
          </div>
          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={serviceData} cx="50%" cy="45%" innerRadius={50} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                  formatter={(v: unknown) => [formatCurrency(Number(v), settings.currency), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <TrendingUp size={32} className="empty-state-icon" />
              <p className="empty-state-body">No income data yet</p>
            </div>
          )}
          {serviceData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {serviceData.slice(0, 4).map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(s.value, settings.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Recent Activity</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Latest updates across jobs and invoices</p>
          </div>
          <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentActivity.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                gap: 12,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: item.type === 'Invoice' ? 'rgba(29,158,117,0.1)' : 'rgba(186,117,23,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.type === 'Invoice'
                    ? <FileText size={16} style={{ color: 'var(--primary)' }} />
                    : <Briefcase size={16} style={{ color: 'var(--secondary)' }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>
                    {item.desc}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.type} · {item.sub}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <StatusBadge status={item.status} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(item.date)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Clock size={36} className="empty-state-icon" />
            <p className="empty-state-title">No recent activity</p>
            <p className="empty-state-body">Activity from jobs and invoices will appear here</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
