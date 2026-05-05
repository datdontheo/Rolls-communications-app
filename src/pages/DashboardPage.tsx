import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, DollarSign, FileText, Clock, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import { eachMonthOfInterval, subMonths } from 'date-fns';

const COLORS = ['#1D9E75', '#BA7517', '#2D9F8F', '#D4891F', '#1AA369'];

export default function DashboardPage() {
  const { invoices, jobs, income, expenses, settings, stock } = useDataStore();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeJobsCount = jobs.filter((j) => ['New', 'In Progress', 'Under Review'].includes(j.status)).length;
    const invoicesDueThisWeek = invoices.filter(
      (inv) => inv.dueDate && new Date(inv.dueDate) <= weekFromNow && inv.status !== 'Paid'
    );
    const monthlyIncome = income.filter((i) => new Date(i.date) >= thisMonth).reduce((sum, i) => sum + i.amount, 0);
    const pendingApprovals = jobs.filter((j) => j.status === 'Under Review').length;
    const lowStockItems = stock.filter((s) => s.currentStock <= s.reorderLevel).length;

    return {
      activeJobs: activeJobsCount,
      invoicesDue: invoicesDueThisWeek.length,
      invoicesDueTotal: invoicesDueThisWeek.reduce((sum, i) => sum + i.total, 0),
      monthlyIncome,
      monthlyTarget: settings.monthlyRevenueTarget,
      pendingApprovals,
      lowStockItems,
    };
  }, [invoices, jobs, income, settings, stock]);

  const chartData = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map((month) => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthIncome = income
        .filter((i) => {
          const date = new Date(i.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, i) => sum + i.amount, 0);

      const monthExpenses = expenses
        .filter((e) => {
          const date = new Date(e.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        Revenue: monthIncome,
        Expenses: monthExpenses,
      };
    });
  }, [income, expenses]);

  const revenueByService = useMemo(() => {
    const serviceData = income.reduce(
      (acc, i) => {
        const existing = acc.find((s) => s.name === i.serviceType);
        if (existing) {
          existing.value += i.amount;
        } else {
          acc.push({ name: i.serviceType, value: i.amount });
        }
        return acc;
      },
      [] as { name: string; value: number }[]
    );
    return serviceData;
  }, [income]);

  const recentActivity = useMemo(() => {
    const jobUpdates = jobs
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((j) => ({
        type: 'Job',
        description: `${j.clientName} - ${j.serviceType}`,
        date: j.updatedAt,
        status: j.status,
      }));

    const invoiceUpdates = invoices
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map((i) => ({
        type: 'Invoice',
        description: `${i.clientName} - ${formatCurrency(i.total, settings.currency)}`,
        date: i.updatedAt,
        status: i.status,
      }));

    return [...jobUpdates, ...invoiceUpdates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [jobs, invoices, settings.currency]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<Clock size={24} />} label="Active Jobs" value={stats.activeJobs} />
          <StatCard
            icon={<FileText size={24} />}
            label="Invoices Due"
            value={`${stats.invoicesDue}`}
            trend={stats.invoicesDueTotal > 0 ? 10 : 0}
          />
          <StatCard
            icon={<DollarSign size={24} />}
            label="Monthly Income"
            value={formatCurrency(stats.monthlyIncome, settings.currency)}
            trend={Math.round((stats.monthlyIncome / stats.monthlyTarget) * 100) - 100}
          />
          <StatCard icon={<AlertCircle size={24} />} label="Pending Approvals" value={stats.pendingApprovals} />
          <StatCard icon={<AlertTriangle size={24} />} label="Low Stock Items" value={stats.lowStockItems} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h2 className="text-lg font-bold font-display text-[color:var(--color-text-primary)] mb-4">
              Revenue vs Expenses
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Revenue" fill="var(--color-primary)" />
                <Bar dataKey="Expenses" fill="var(--color-secondary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold font-display text-[color:var(--color-text-primary)] mb-4">
              Revenue by Service
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={revenueByService} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {revenueByService.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-bold font-display text-[color:var(--color-text-primary)] mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-[color:var(--color-border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                      {activity.type}: {activity.description}
                    </p>
                    <p className="text-xs text-[color:var(--color-text-secondary)]">{formatDate(activity.date)}</p>
                  </div>
                  <span className={`status-${activity.status.toLowerCase().replace(' ', '-')}`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-[color:var(--color-text-secondary)]">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
