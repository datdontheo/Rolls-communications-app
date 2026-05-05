import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import QuotationForm from '../components/QuotationForm';
import { useToast } from '../components/Toast';

export default function QuotationsPage() {
  const { quotations, deleteQuotation, settings } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const toast = useToast();

  const filtered = useMemo(() => {
    return quotations.filter((q) => !statusFilter || q.status === statusFilter);
  }, [quotations, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteQuotation(id);
      toast.success('Quotation deleted');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Quotations</h2>
          <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Quotation
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', 'Pending', 'Accepted', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                statusFilter === status ? 'bg-[color:var(--color-primary)] text-white' : 'bg-[color:var(--color-bg-card)] border border-[color:var(--color-border)]'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--color-border)]">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Quote #</th>
                <th className="text-left py-3 px-4 font-medium">Client</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-right py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((quote) => (
                  <tr key={quote.id} className="table-row">
                    <td className="py-3 px-4 font-medium">{quote.number}</td>
                    <td className="py-3 px-4">{quote.clientName}</td>
                    <td className="py-3 px-4 text-[color:var(--color-text-secondary)]">{formatDate(quote.date)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(quote.total, settings.currency)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        quote.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        quote.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedId(quote.id); setIsFormOpen(true); }}
                          className="p-2 rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-default)]"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[color:var(--color-text-secondary)]">
                    No quotations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isFormOpen} title={selectedId ? 'Edit Quotation' : 'New Quotation'} onClose={() => { setIsFormOpen(false); setSelectedId(null); }} size="lg">
          <QuotationForm quotationId={selectedId} onClose={() => { setIsFormOpen(false); setSelectedId(null); }} />
        </Modal>
      </div>
    </Layout>
  );
}
