import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import { useToast } from '../components/Toast';

export default function FinancialsPage() {
  const { income, expenses, addIncomeEntry, addExpenseEntry, deleteIncomeEntry, deleteExpenseEntry, settings } = useDataStore();
  const [tab, setTab] = useState<'income' | 'expenses'>('income');
  const toast = useToast();

  const [incForm, setIncForm] = useState({ date: new Date().toISOString().split('T')[0], serviceType: 'Advertising', description: '', amount: '', clientName: '', paymentMethod: 'Bank Transfer' });
  const [expForm, setExpForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Raw Materials', description: '', vendor: '', amount: '' });

  const totals = useMemo(() => {
    const totalInc = income.reduce((s, i) => s + i.amount, 0);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthInc = income.filter(i => new Date(i.date) >= monthStart).reduce((s, i) => s + i.amount, 0);
    const monthExp = expenses.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0);
    return { totalInc, totalExp, net: totalInc - totalExp, monthInc, monthExp };
  }, [income, expenses]);

  const handleAddIncome = async () => {
    if (!incForm.description || !incForm.amount) { toast.error('Fill in description and amount'); return; }
    try {
      await addIncomeEntry({ ...incForm, serviceType: incForm.serviceType as any, paymentMethod: incForm.paymentMethod as any, amount: parseFloat(incForm.amount) });
      setIncForm(f => ({ ...f, description: '', amount: '', clientName: '' }));
      toast.success('Income entry added');
    } catch (err) {
      toast.error('Failed to add income entry');
    }
  };

  const handleAddExpense = async () => {
    if (!expForm.description || !expForm.amount) { toast.error('Fill in description and amount'); return; }
    try {
      await addExpenseEntry({ ...expForm, category: expForm.category as any, amount: parseFloat(expForm.amount) });
      setExpForm(f => ({ ...f, description: '', vendor: '', amount: '' }));
      toast.success('Expense entry added');
    } catch (err) {
      toast.error('Failed to add expense entry');
    }
  };

  return (
    <Layout>
      {/* KPI strip */}
      <div className="stat-grid stat-grid-5" style={{ marginBottom: 28 }}>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value" style={{ color: '#16a34a', marginTop: 8 }}>{formatCurrency(totals.totalInc, settings.currency)}</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)' }}>
              <TrendingUp size={20} style={{ color: '#16a34a' }} />
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value" style={{ color: '#dc2626', marginTop: 8 }}>{formatCurrency(totals.totalExp, settings.currency)}</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(220,38,38,0.1)' }}>
              <TrendingDown size={20} style={{ color: '#dc2626' }} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Net Profit</p>
          <p className="stat-value" style={{ marginTop: 8, color: totals.net >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatCurrency(totals.net, settings.currency)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')}>
          Income ({income.length})
        </button>
        <button className={`tab-btn ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
          Expenses ({expenses.length})
        </button>
      </div>

      {tab === 'income' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Add income form */}
          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Add Income Entry</p>
            <div className="form-grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, alignItems: 'end' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="input-field" value={incForm.date} onChange={e => setIncForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Service</label>
                <select className="input-field" value={incForm.serviceType} onChange={e => setIncForm(f => ({ ...f, serviceType: e.target.value }))}>
                  {['Advertising', 'Printing', 'Fabrication', 'Design', 'Media'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Client</label>
                <input type="text" className="input-field" placeholder="Client name" value={incForm.clientName} onChange={e => setIncForm(f => ({ ...f, clientName: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description</label>
                <input type="text" className="input-field" placeholder="Description" value={incForm.description} onChange={e => setIncForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Amount</label>
                  <input type="number" className="input-field" placeholder="0.00" value={incForm.amount} onChange={e => setIncForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <button onClick={handleAddIncome} className="btn btn-primary" style={{ flexShrink: 0 }}><Plus size={17} /></button>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="table-overflow">
              <table className="data-table">
                <thead>
                  <tr><th className="hide-mobile">Date</th><th className="hide-mobile">Service</th><th className="hide-mobile">Client</th><th>Description</th><th className="text-right">Amount</th><th className="text-right">Action</th></tr>
                </thead>
                <tbody>
                  {income.length > 0 ? income.slice().reverse().map(e => (
                    <tr key={e.id}>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>{formatDate(e.date)}</td>
                      <td className="hide-mobile"><span style={{ fontSize: 12.5, fontWeight: 500 }}>{e.serviceType}</span></td>
                      <td className="hide-mobile">{e.clientName || '—'}</td>
                      <td>{e.description}</td>
                      <td className="text-right"><span style={{ fontWeight: 700, color: '#16a34a' }}>{formatCurrency(e.amount, settings.currency)}</span></td>
                      <td className="text-right">
                        <button onClick={async () => { try { await deleteIncomeEntry(e.id); toast.success('Entry deleted'); } catch { toast.error('Failed to delete'); } }} className="btn btn-danger btn-icon btn-sm"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6}>
                      <div className="empty-state"><DollarSign size={36} className="empty-state-icon" />
                        <p className="empty-state-title">No income entries yet</p></div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Add expense form */}
          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Add Expense Entry</p>
            <div className="form-grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, alignItems: 'end' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="input-field" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="input-field" value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
                  {['Raw Materials', 'Equipment', 'Utilities', 'Salaries', 'Supplier Payment', 'Petty Cash', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vendor</label>
                <input type="text" className="input-field" placeholder="Vendor" value={expForm.vendor} onChange={e => setExpForm(f => ({ ...f, vendor: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description</label>
                <input type="text" className="input-field" placeholder="Description" value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Amount</label>
                  <input type="number" className="input-field" placeholder="0.00" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <button onClick={handleAddExpense} className="btn btn-primary" style={{ flexShrink: 0 }}><Plus size={17} /></button>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="table-overflow">
              <table className="data-table">
                <thead>
                  <tr><th className="hide-mobile">Date</th><th className="hide-mobile">Category</th><th className="hide-mobile">Vendor</th><th>Description</th><th className="text-right">Amount</th><th className="text-right">Action</th></tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? expenses.slice().reverse().map(e => (
                    <tr key={e.id}>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>{formatDate(e.date)}</td>
                      <td className="hide-mobile"><span style={{ fontSize: 12.5, fontWeight: 500 }}>{e.category}</span></td>
                      <td className="hide-mobile">{e.vendor || '—'}</td>
                      <td>{e.description}</td>
                      <td className="text-right"><span style={{ fontWeight: 700, color: '#dc2626' }}>{formatCurrency(e.amount, settings.currency)}</span></td>
                      <td className="text-right">
                        <button onClick={async () => { try { await deleteExpenseEntry(e.id); toast.success('Entry deleted'); } catch { toast.error('Failed to delete'); } }} className="btn btn-danger btn-icon btn-sm"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6}>
                      <div className="empty-state"><TrendingDown size={36} className="empty-state-icon" />
                        <p className="empty-state-title">No expense entries yet</p></div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
