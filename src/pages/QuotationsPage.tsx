import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency, formatDate } from '../utils/formatting';
import QuotationForm from '../components/QuotationForm';
import { useToast } from '../components/Toast';

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export default function QuotationsPage() {
  const { quotations, deleteQuotation, addJob, addInvoice, settings, clients } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  const filtered = useMemo(() => quotations.filter(q => !statusFilter || q.status === statusFilter), [quotations, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this quotation?')) { deleteQuotation(id); toast.success('Quotation deleted'); }
  };

  const convertToJob = (q: typeof quotations[0]) => {
    addJob({
      clientId: q.clientId,
      clientName: q.clientName,
      serviceType: 'Advertising',
      status: 'New',
      assignedTo: 'Unassigned',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      linkedQuotationId: q.id,
      stages: [{ id: '1', name: 'Production', completed: false }, { id: '2', name: 'QC', completed: false }],
      internalNotes: `Created from quotation ${q.number}`,
    } as any);
    toast.success('Job order created from quotation');
  };

  const convertToInvoice = (q: typeof quotations[0]) => {
    const client = clients.find(c => c.id === q.clientId);
    addInvoice({
      type: 'final',
      clientId: q.clientId,
      clientName: q.clientName,
      clientAddress: client?.address || '',
      date: new Date().toISOString().split('T')[0],
      items: q.items,
      subtotal: q.subtotal,
      vat: q.vat,
      total: q.total,
      status: 'Draft',
      notes: `From quotation ${q.number}`,
    } as any);
    toast.success('Invoice created from quotation');
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quotations</h2>
          <p className="page-subtitle">{quotations.length} total quotes</p>
        </div>
        <button onClick={() => { setEditId(null); setIsFormOpen(true); }} className="btn btn-primary">
          <Plus size={17} /> New Quotation
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {['Pending', 'Accepted', 'Rejected'].map(s => (
          <div key={s} className="card" style={{ padding: '14px 18px', cursor: 'pointer', borderColor: statusFilter === s ? 'var(--primary)' : 'var(--border)' }}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</p>
              <StatusBadge status={s} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Nexa, sans-serif', marginTop: 8 }}>
              {quotations.filter(q => q.status === s).length}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {formatCurrency(quotations.filter(q => q.status === s).reduce((sum, q) => sum + q.total, 0), settings.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {['', 'Pending', 'Accepted', 'Rejected'].map(s => (
          <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <div className="table-overflow">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Client</th>
                <th>Date</th>
                <th className="text-right">Subtotal</th>
                <th className="text-right">Total (incl. VAT)</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(q => (
                <tr key={q.id}>
                  <td><span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>{q.number}</span></td>
                  <td><span style={{ fontWeight: 500 }}>{q.clientName}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(q.date)}</td>
                  <td className="text-right" style={{ color: 'var(--text-muted)' }}>{formatCurrency(q.subtotal, settings.currency)}</td>
                  <td className="text-right"><span style={{ fontWeight: 700 }}>{formatCurrency(q.total, settings.currency)}</span></td>
                  <td><StatusBadge status={q.status} /></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      {q.status === 'Accepted' && (
                        <>
                          <button onClick={() => convertToJob(q)} className="btn btn-outline btn-sm" title="Convert to Job" style={{ fontSize: 11, padding: '4px 8px' }}>
                            → Job
                          </button>
                          <button onClick={() => convertToInvoice(q)} className="btn btn-outline btn-sm" title="Convert to Invoice" style={{ fontSize: 11, padding: '4px 8px' }}>
                            → Invoice
                          </button>
                        </>
                      )}
                      <button onClick={() => { setEditId(q.id); setIsFormOpen(true); }} className="btn btn-ghost btn-icon btn-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="btn btn-danger btn-icon btn-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <FileText size={36} className="empty-state-icon" />
                    <p className="empty-state-title">No quotations</p>
                    <p className="empty-state-body">Create a quote to send to a client</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormOpen} title={editId ? 'Edit Quotation' : 'New Quotation'} onClose={() => { setIsFormOpen(false); setEditId(null); }} size="lg">
        <QuotationForm quotationId={editId} onClose={() => { setIsFormOpen(false); setEditId(null); }} />
      </Modal>
    </Layout>
  );
}
