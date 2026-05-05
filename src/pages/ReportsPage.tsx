import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency } from '../utils/formatting';
import { eachMonthOfInterval, subMonths } from 'date-fns';

const COLORS = ['#1D9E75', '#BA7517', '#2D9F8F', '#D4891F', '#1AA369'];

export default function ReportsPage() {
  const { invoices, income, expenses, jobs, settings } = useDataStore();

  const pnlData = useMemo(() => {
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date(),
    });

    return last12Months.map((month) => {
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
        month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        Income: monthIncome,
        Expenses: monthExpenses,
        Profit: monthIncome - monthExpenses,
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

  const receivablesAging = useMemo(() => {
    const now = new Date();
    const overdue: { [key: string]: number } = {
      '0-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    invoices
      .filter((inv) => inv.status !== 'Paid')
      .forEach((inv) => {
        const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
        if (!dueDate) return;

        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOverdue < 0) {
          overdue['0-30'] += inv.total;
        } else if (daysOverdue <= 30) {
          overdue['0-30'] += inv.total;
        } else if (daysOverdue <= 60) {
          overdue['31-60'] += inv.total;
        } else if (daysOverdue <= 90) {
          overdue['61-90'] += inv.total;
        } else {
          overdue['90+'] += inv.total;
        }
      });

    return Object.entries(overdue).map(([range, amount]) => ({
      range,
      amount,
    }));
  }, [invoices]);

  const jobStats = useMemo(() => {
    const completed = jobs.filter((j) => j.status === 'Completed').length;
    const onTime = jobs.filter((j) => j.status === 'Completed' && new Date(j.deadline) >= new Date(j.updatedAt)).length;
    const delayed = completed - onTime;

    return [
      { name: 'On Time', value: onTime },
      { name: 'Delayed', value: delayed },
    ];
  }, [jobs]);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Reports</h2>

        {/* P&L Summary */}
        <div className="card">
          <h3 className="text-lg font-bold font-display mb-4">Profit & Loss (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pnlData}>
              <CartesianGrid stroke="var(--color-border)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Income" fill="var(--color-primary)" />
              <Bar dataKey="Expenses" fill="var(--color-secondary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Service */}
          <div className="card">
            <h3 className="text-lg font-bold font-display mb-4">Revenue by Service</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={revenueByService} cx="50%" cy="50%" labelLine={false} label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {revenueByService.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Job Completion */}
          <div className="card">
            <h3 className="text-lg font-bold font-display mb-4">Job Completion Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={jobStats} cx="50%" cy="50%" labelLine={false} label={({ name, value = 0 }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {jobStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* A/R Aging */}
        <div className="card">
          <h3 className="text-lg font-bold font-display mb-4">Accounts Receivable Aging</h3>
          <div className="grid grid-cols-4 gap-4">
            {receivablesAging.map((item) => (
              <div key={item.range} className="bg-[color:var(--color-bg-default)] p-4 rounded-lg">
                <p className="text-[color:var(--color-text-secondary)] text-sm mb-2">{item.range} days</p>
                <p className="text-xl font-bold text-[color:var(--color-text-primary)]">{formatCurrency(item.amount, settings.currency)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
