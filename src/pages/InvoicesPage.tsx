import { useMemo, useState, lazy, Suspense } from 'react';
import { Plus, Edit2, Trash2, Eye, FileText, Download, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import InvoiceForm from '../components/InvoiceForm';
import { useToast } from '../components/Toast';

// The PDF renderer (@react-pdf/renderer) is heavy and only needed when previewing
// or downloading, so load it on demand to keep the initial bundle small.
const InvoicePDF = lazy(() => import('../components/InvoicePDF'));
const PaymentReceiptPDF = lazy(() => import('../components/PaymentReceiptPDF'));

function PdfFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 48, color: 'var(--text-muted)' }}>
      <Loader2 size={20} className="spinner" /> Preparing document…
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`badge badge-${s}`}>{status}</span>;
}

export default function InvoicesPage() {
  const { invoices, deleteInvoice, settings } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const filtered = useMemo(() => invoices
    .filter(inv =>
      (!statusFilter || inv.status === statusFilter) &&
      (!search || inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.number.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  , [invoices, statusFilter, search]);

  const totals = useMemo(() => ({
    all: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0),
  }), [invoices]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this invoice? This cannot be undone.')) {
      try {
        await deleteInvoice(id);
        toast.success('Invoice deleted');
      } catch {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const openEdit = (id: string) => { setEditId(id); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditId(null); };

  return (
    <Layout>
      {/* Summary row */}
      <div className="stat-grid stat-grid-3">
        {[
          { label: 'Total Invoiced', value: formatCurrency(totals.all, settings.currency), color: 'var(--text)' },
          { label: 'Total Paid', value: formatCurrency(totals.paid, settings.currency), color: '#16a34a' },
          { label: 'Overdue', value: formatCurrency(totals.overdue, settings.currency), color: '#dc2626' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'Nexa, sans-serif' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="page-header">
        <div>
          <h2 className="page-title">Invoices</h2>
          <p className="page-subtitle">{invoices.length} total invoices</p>
        </div>
        <button onClick={() => { setEditId(null); setIsFormOpen(true); }} className="btn btn-primary">
          <Plus size={17} /> New Invoice
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          {['', 'Draft', 'Sent', 'Paid', 'Overdue'].map(s => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="search-bar" style={{ marginLeft: 'auto' }}>
          <FileText className="search-bar-icon" size={15} />
          <input placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-overflow">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th className="hide-mobile">Type</th>
                <th>Client</th>
                <th className="hide-mobile">Date</th>
                <th className="hide-mobile">Due Date</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(inv => (
                <tr key={inv.id}>
                  <td><span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>{inv.number}</span></td>
                  <td className="hide-mobile"><span style={{ fontSize: 12.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{inv.type}</span></td>
                  <td><span style={{ fontWeight: 500 }}>{inv.clientName}</span></td>
                  <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>{formatDate(inv.date)}</td>
                  <td className="hide-mobile" style={{ color: inv.status === 'Overdue' ? '#dc2626' : 'var(--text-muted)' }}>
                    {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                  </td>
                  <td className="text-right"><span style={{ fontWeight: 700 }}>{formatCurrency(inv.total, settings.currency)}</span></td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button onClick={() => setViewId(inv.id)} className="btn btn-ghost btn-icon btn-sm" title="Preview PDF" aria-label="Preview invoice PDF">
                        <Eye size={16} />
                      </button>
                      {inv.status === 'Paid' && (
                        <button onClick={() => setReceiptId(inv.id)} className="btn btn-ghost btn-icon btn-sm" title="Download Payment Receipt" aria-label="Download payment receipt">
                          <Download size={16} />
                        </button>
                      )}
                      <button onClick={() => openEdit(inv.id)} className="btn btn-ghost btn-icon btn-sm" title="Edit" aria-label="Edit invoice">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="btn btn-danger btn-icon btn-sm" title="Delete" aria-label="Delete invoice">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <FileText size={36} className="empty-state-icon" />
                    <p className="empty-state-title">No invoices found</p>
                    <p className="empty-state-body">
                      {search || statusFilter ? 'Try adjusting your filters' : 'Create your first invoice to get started'}
                    </p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormOpen} title={editId ? 'Edit Invoice' : 'New Invoice'} onClose={closeForm} size="lg">
        <InvoiceForm invoiceId={editId} onClose={closeForm} />
      </Modal>

      <Modal isOpen={!!viewId} title="Invoice Preview" onClose={() => setViewId(null)} size="md">
        {viewId && <Suspense fallback={<PdfFallback />}><InvoicePDF invoiceId={viewId} /></Suspense>}
      </Modal>

      <Modal isOpen={!!receiptId} title="Payment Receipt" onClose={() => setReceiptId(null)} size="md">
        {receiptId && <Suspense fallback={<PdfFallback />}><PaymentReceiptPDF invoiceId={receiptId} /></Suspense>}
      </Modal>
    </Layout>
  );
}
