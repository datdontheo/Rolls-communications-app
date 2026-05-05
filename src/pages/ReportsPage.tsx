import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency } from '../utils/formatting';
import { eachMonthOfInterval, subMonths } from 'date-fns';
import { TrendingUp, BarChart3 } from 'lucide-react';

const COLORS = ['#1D9E75', '#BA7517', '#6366f1', '#0ea5e9', '#ec4899'];

export default function ReportsPage() {
  const { invoices, income, expenses, jobs, settings } = useDataStore();

  const pnlData = useMemo(() => {
    return eachMonthOfInterval({ start: subMonths(new Date(), 11), end: new Date() }).map(month => {
      const s = new Date(month.getFullYear(), month.getMonth(), 1);
      const e = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const rev = income.filter(i => new Date(i.date) >= s && new Date(i.date) <= e).reduce((sum, i) => sum + i.amount, 0);
      const exp = expenses.filter(ex => new Date(ex.date) >= s && new Date(ex.date) <= e).reduce((sum, e) => sum + e.amount, 0);
      return { month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), Revenue: rev, Expenses: exp, Profit: rev - exp };
    });
  }, [income, expenses]);

  const serviceData = useMemo(() => {
    const map: Record<string, number> = {};
    income.forEach(i => { map[i.serviceType] = (map[i.serviceType] || 0) + i.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [income]);

  const aging = useMemo(() => {
    const buckets = { '0–30': 0, '31–60': 0, '61–90': 0, '90+': 0 };
    const now = new Date();
    invoices.filter(inv => inv.status !== 'Paid').forEach(inv => {
      if (!inv.dueDate) return;
      const d = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000);
      if (d <= 30) buckets['0–30'] += inv.total;
      else if (d <= 60) buckets['31–60'] += inv.total;
      else if (d <= 90) buckets['61–90'] += inv.total;
      else buckets['90+'] += inv.total;
    });
    return Object.entries(buckets).map(([range, amount]) => ({ range, amount }));
  }, [invoices]);

  const jobStats = useMemo(() => {
    const completed = jobs.filter(j => j.status === 'Completed').length;
    const onTime = jobs.filter(j => j.status === 'Completed' && new Date(j.deadline) >= new Date(j.updatedAt)).length;
    return [{ name: 'On Time', value: onTime }, { name: 'Delayed', value: completed - onTime }];
  }, [jobs]);

  const totalRev = income.reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Layout>
      {/* KPIs */}
      <div className="stat-grid stat-grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRev, settings.currency), color: '#16a34a' },
          { label: 'Total Expenses', value: formatCurrency(totalExp, settings.currency), color: '#dc2626' },
          { label: 'Net Profit', value: formatCurrency(totalRev - totalExp, settings.currency), color: totalRev - totalExp >= 0 ? 'var(--primary)' : '#dc2626' },
          { label: 'Total Invoiced', value: formatCurrency(invoices.reduce((s, i) => s + i.total, 0), settings.currency), color: 'var(--text)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'Nexa, sans-serif' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* P&L chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Profit & Loss — Last 12 Months</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Monthly revenue, expenses, and net profit</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={pnlData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Revenue" fill="#1D9E75" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Expenses" fill="#BA7517" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue by service */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Revenue by Service</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 }}>Income breakdown by service type</p>
          {serviceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} formatter={(v: unknown) => [formatCurrency(Number(v), settings.currency)]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {serviceData.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.name}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(s.value, settings.currency)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({((s.value / totalRev) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <TrendingUp size={32} className="empty-state-icon" />
              <p className="empty-state-body">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Job completion */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Job Completion Rate</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 }}>On-time vs delayed completed jobs</p>
          {jobStats.some(s => s.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={jobStats} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {jobStats.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.name}</span>
                    <span style={{ fontWeight: 600 }}>{s.value} jobs</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <BarChart3 size={32} className="empty-state-icon" />
              <p className="empty-state-body">No completed jobs yet</p>
            </div>
          )}
        </div>
      </div>

      {/* AR Aging */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Accounts Receivable Aging</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 20 }}>Outstanding invoice amounts by days overdue</p>
        <div className="stat-grid stat-grid-4" style={{ marginBottom: 0 }}>
          {aging.map(({ range, amount }, i) => (
            <div key={range} style={{
              padding: '16px 18px',
              borderRadius: 10,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${i === 0 ? '#22c55e' : i === 1 ? '#eab308' : i === 2 ? '#f97316' : '#ef4444'}`,
            }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{range} days</p>
              <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Nexa, sans-serif' }}>{formatCurrency(amount, settings.currency)}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
