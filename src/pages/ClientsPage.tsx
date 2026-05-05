import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Users, Mail, Phone } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import ClientForm from '../components/ClientForm';
import { useToast } from '../components/Toast';

function CategoryBadge({ cat }: { cat: string }) {
  return <span className={`badge badge-${cat.toLowerCase()}`}>{cat}</span>;
}

export default function ClientsPage() {
  const { clients, deleteClient, invoices, jobs } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const toast = useToast();

  const filtered = useMemo(() => clients.filter(c =>
    (!catFilter || c.category === catFilter) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()))
  ), [clients, search, catFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this client?')) { deleteClient(id); toast.success('Client deleted'); }
  };

  const clientRevenue = (id: string) =>
    invoices.filter(i => i.clientId === id && i.status === 'Paid').reduce((s, i) => s + i.total, 0);

  const clientJobs = (id: string) => jobs.filter(j => j.clientId === id).length;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h2 className="page-title">Clients</h2>
          <p className="page-subtitle">{clients.length} clients in your CRM</p>
        </div>
        <button onClick={() => { setEditId(null); setIsFormOpen(true); }} className="btn btn-primary">
          <Plus size={17} /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {['Active', 'Prospect', 'Retained'].map(cat => (
          <div key={cat} className="card" style={{ padding: '14px 18px', cursor: 'pointer', borderColor: catFilter === cat ? 'var(--primary)' : 'var(--border)' }}
            onClick={() => setCatFilter(catFilter === cat ? '' : cat)}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{cat}</p>
            <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Nexa, sans-serif', marginTop: 4 }}>
              {clients.filter(c => c.category === cat).length}
            </p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          {['', 'Active', 'Prospect', 'Retained'].map(cat => (
            <button key={cat} className={`filter-btn ${catFilter === cat ? 'active' : ''}`} onClick={() => setCatFilter(cat)}>
              {cat || 'All'}
            </button>
          ))}
        </div>
        <div className="search-bar" style={{ marginLeft: 'auto' }}>
          <Users className="search-bar-icon" size={15} />
          <input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-overflow">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Category</th>
                <th className="text-right">Jobs</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(client => (
                <tr key={client.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'var(--primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
                      }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{client.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{client.company || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}>
                        <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {client.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)' }}>
                        <Phone size={12} /> {client.phone}
                      </span>
                    </div>
                  </td>
                  <td><CategoryBadge cat={client.category} /></td>
                  <td className="text-right"><span style={{ fontWeight: 600 }}>{clientJobs(client.id)}</span></td>
                  <td className="text-right"><span style={{ fontWeight: 600, color: 'var(--primary)' }}>GH₵ {clientRevenue(client.id).toLocaleString()}</span></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button onClick={() => { setEditId(client.id); setIsFormOpen(true); }} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="btn btn-danger btn-icon btn-sm" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <Users size={36} className="empty-state-icon" />
                    <p className="empty-state-title">No clients found</p>
                    <p className="empty-state-body">{search ? 'Try a different search term' : 'Add your first client to get started'}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormOpen} title={editId ? 'Edit Client' : 'New Client'} onClose={() => { setIsFormOpen(false); setEditId(null); }}>
        <ClientForm clientId={editId} onClose={() => { setIsFormOpen(false); setEditId(null); }} />
      </Modal>
    </Layout>
  );
}
