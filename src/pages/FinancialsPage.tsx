import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import { useToast } from '../components/Toast';

export default function FinancialsPage() {
  const { income, expenses, addIncomeEntry, addExpenseEntry, deleteIncomeEntry, deleteExpenseEntry, settings } = useDataStore();
  const [tab, setTab] = useState<'income' | 'expenses'>('income');
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newServiceType, setNewServiceType] = useState<any>('Advertising');
  const [newCategory, setNewCategory] = useState('Raw Materials');
  const [newVendor, setNewVendor] = useState('');
  const toast = useToast();

  const handleAddIncome = () => {
    if (!newDescription || !newAmount) {
      toast.error('Fill all fields');
      return;
    }
    addIncomeEntry({
      date: newDate,
      clientName: '',
      serviceType: newServiceType,
      description: newDescription,
      amount: parseFloat(newAmount),
      paymentMethod: 'Bank Transfer',
    });
    setNewDescription('');
    setNewAmount('');
    setNewDate(new Date().toISOString().split('T')[0]);
    toast.success('Income entry added');
  };

  const handleAddExpense = () => {
    if (!newDescription || !newAmount || !newCategory) {
      toast.error('Fill all fields');
      return;
    }
    addExpenseEntry({
      date: newDate,
      category: newCategory as any,
      description: newDescription,
      vendor: newVendor,
      amount: parseFloat(newAmount),
    });
    setNewDescription('');
    setNewAmount('');
    setNewVendor('');
    setNewDate(new Date().toISOString().split('T')[0]);
    toast.success('Expense entry added');
  };

  const totalIncome = useMemo(() => income.reduce((sum, i) => sum + i.amount, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Financials</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="card">
            <p className="text-[color:var(--color-text-secondary)] text-sm mb-2">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome, settings.currency)}</p>
          </div>
          <div className="card">
            <p className="text-[color:var(--color-text-secondary)] text-sm mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, settings.currency)}</p>
          </div>
          <div className="card">
            <p className="text-[color:var(--color-text-secondary)] text-sm mb-2">Net Profit</p>
            <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalIncome - totalExpenses, settings.currency)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('income')}
            className={`px-4 py-2 font-medium rounded-lg transition-all ${
              tab === 'income' ? 'bg-[color:var(--color-primary)] text-white' : 'bg-[color:var(--color-bg-card)] border border-[color:var(--color-border)]'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setTab('expenses')}
            className={`px-4 py-2 font-medium rounded-lg transition-all ${
              tab === 'expenses' ? 'bg-[color:var(--color-primary)] text-white' : 'bg-[color:var(--color-bg-card)] border border-[color:var(--color-border)]'
            }`}
          >
            Expenses
          </button>
        </div>

        {tab === 'income' ? (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold mb-4">Add Income Entry</h3>
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-field"
                />
                <select
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  className="input-field"
                >
                  <option value="Advertising">Advertising</option>
                  <option value="Printing">Printing</option>
                  <option value="Fabrication">Fabrication</option>
                  <option value="Design">Design</option>
                  <option value="Media">Media</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button onClick={handleAddIncome} className="btn-primary">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[color:var(--color-border)]">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Service Type</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-right py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {income.map((entry) => (
                    <tr key={entry.id} className="table-row">
                      <td className="py-3 px-4">{formatDate(entry.date)}</td>
                      <td className="py-3 px-4">{entry.serviceType}</td>
                      <td className="py-3 px-4">{entry.description}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(entry.amount, settings.currency)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteIncomeEntry(entry.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold mb-4">Add Expense Entry</h3>
              <div className="grid grid-cols-5 gap-3">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-field"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Supplier Payment">Supplier Payment</option>
                  <option value="Petty Cash">Petty Cash</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Vendor"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button onClick={handleAddExpense} className="btn-primary">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[color:var(--color-border)]">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Vendor</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-right py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((entry) => (
                    <tr key={entry.id} className="table-row">
                      <td className="py-3 px-4">{formatDate(entry.date)}</td>
                      <td className="py-3 px-4">{entry.category}</td>
                      <td className="py-3 px-4">{entry.vendor}</td>
                      <td className="py-3 px-4">{entry.description}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(entry.amount, settings.currency)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteExpenseEntry(entry.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
