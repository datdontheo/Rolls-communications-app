import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, FileText, Download } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePDF from '../components/InvoicePDF';
import PaymentReceiptPDF from '../components/PaymentReceiptPDF';
import { useToast } from '../components/Toast';

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

  const filtered = useMemo(() => invoices.filter(inv =>
    (!statusFilter || inv.status === statusFilter) &&
    (!search || inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.number.toLowerCase().includes(search.toLowerCase()))
  ), [invoices, statusFilter, search]);

  const totals = useMemo(() => ({
    all: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0),
  }), [invoices]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this invoice? This cannot be undone.')) {
      deleteInvoice(id);
      toast.success('Invoice deleted');
    }
  };

  const openEdit = (id: string) => { setEditId(id); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditId(null); };

  return (
    <Layout>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Invoiced', value: formatCurrency(totals.all, settings.currency), color: 'var(--text)' },
          { label: 'Total Paid', value: formatCurrency(totals.paid, settings.currency), color: '#16a34a' },
          { label: 'Overdue', value: formatCurrency(totals.overdue, settings.currency), color: '#dc2626' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'Fraunces, serif' }}>{value}</p>
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
                <th>Type</th>
                <th>Client</th>
                <th>Date</th>
                <th>Due Date</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(inv => (
                <tr key={inv.id}>
                  <td><span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>{inv.number}</span></td>
                  <td><span style={{ fontSize: 12.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{inv.type}</span></td>
                  <td><span style={{ fontWeight: 500 }}>{inv.clientName}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(inv.date)}</td>
                  <td style={{ color: inv.status === 'Overdue' ? '#dc2626' : 'var(--text-muted)' }}>
                    {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                  </td>
                  <td className="text-right"><span style={{ fontWeight: 700 }}>{formatCurrency(inv.total, settings.currency)}</span></td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button onClick={() => setViewId(inv.id)} className="btn btn-ghost btn-icon btn-sm" title="Preview PDF">
                        <Eye size={16} />
                      </button>
                      {inv.status === 'Paid' && (
                        <button onClick={() => setReceiptId(inv.id)} className="btn btn-ghost btn-icon btn-sm" title="Download Payment Receipt">
                          <Download size={16} />
                        </button>
                      )}
                      <button onClick={() => openEdit(inv.id)} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="btn btn-danger btn-icon btn-sm" title="Delete">
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
        {viewId && <InvoicePDF invoiceId={viewId} />}
      </Modal>

      <Modal isOpen={!!receiptId} title="Payment Receipt" onClose={() => setReceiptId(null)} size="md">
        {receiptId && <PaymentReceiptPDF invoiceId={receiptId} />}
      </Modal>
    </Layout>
  );
}
