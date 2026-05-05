import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePDF from '../components/InvoicePDF';
import { useToast } from '../components/Toast';

export default function InvoicesPage() {
  const { invoices, deleteInvoice, settings } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const toast = useToast();

  const filtered = useMemo(() => {
    return invoices.filter((inv) => !statusFilter || inv.status === statusFilter);
  }, [invoices, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteInvoice(id);
      toast.success('Invoice deleted');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Invoices</h2>
          <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Invoice
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', 'Draft', 'Sent', 'Paid', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                statusFilter === status ? 'bg-[color:var(--color-primary)] text-white' : 'bg-[color:var(--color-bg-card)] border border-[color:var(--color-border)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-primary)]'
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
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Client</th>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Date</th>
                <th className="text-right py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Status</th>
                <th className="text-right py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((invoice) => (
                  <tr key={invoice.id} className="table-row">
                    <td className="py-3 px-4 font-medium text-[color:var(--color-text-primary)]">{invoice.number}</td>
                    <td className="py-3 px-4 text-[color:var(--color-text-primary)]">{invoice.clientName}</td>
                    <td className="py-3 px-4 text-[color:var(--color-text-secondary)]">{formatDate(invoice.date)}</td>
                    <td className="py-3 px-4 text-right font-medium text-[color:var(--color-text-primary)]">
                      {formatCurrency(invoice.total, settings.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`status-${invoice.status.toLowerCase()}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice.id)}
                          className="p-2 rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-default)] transition-colors"
                          title="View PDF"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice.id);
                            setIsFormOpen(true);
                          }}
                          className="p-2 rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-default)] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
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
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isFormOpen} title={selectedInvoice ? 'Edit Invoice' : 'New Invoice'} onClose={() => { setIsFormOpen(false); setSelectedInvoice(null); }} size="lg">
          <InvoiceForm invoiceId={selectedInvoice} onClose={() => { setIsFormOpen(false); setSelectedInvoice(null); }} />
        </Modal>

        <Modal isOpen={!!selectedInvoice && !isFormOpen} title="Invoice Preview" onClose={() => setSelectedInvoice(null)} size="lg">
          {selectedInvoice && <InvoicePDF invoiceId={selectedInvoice} />}
        </Modal>
      </div>
    </Layout>
  );
}
