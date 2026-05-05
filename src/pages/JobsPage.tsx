import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Briefcase, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatDate } from '../utils/formatting';
import JobForm from '../components/JobForm';
import { useToast } from '../components/Toast';

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`badge badge-${key}`}>{status}</span>;
}

const SERVICE_COLORS: Record<string, string> = {
  Advertising: '#1D9E75',
  Printing: '#BA7517',
  Fabrication: '#6366f1',
  Design: '#0ea5e9',
  Media: '#ec4899',
};

export default function JobsPage() {
  const { jobs, deleteJob } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const filtered = useMemo(() => jobs.filter(j =>
    (!statusFilter || j.status === statusFilter) &&
    (!search || j.clientName.toLowerCase().includes(search.toLowerCase()) || j.jobId.toLowerCase().includes(search.toLowerCase()))
  ), [jobs, statusFilter, search]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this job?')) { deleteJob(id); toast.success('Job deleted'); }
  };

  const statuses = ['', 'New', 'In Progress', 'Under Review', 'Completed', 'Delivered'];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h2 className="page-title">Job Orders</h2>
          <p className="page-subtitle">{jobs.length} total jobs · {jobs.filter(j => ['New', 'In Progress'].includes(j.status)).length} active</p>
        </div>
        <button onClick={() => { setEditId(null); setIsFormOpen(true); }} className="btn btn-primary">
          <Plus size={17} /> New Job
        </button>
      </div>

      {/* Pipeline summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
        {['New', 'In Progress', 'Under Review', 'Completed', 'Delivered'].map(s => {
          const count = jobs.filter(j => j.status === s).length;
          const key = s.toLowerCase().replace(/\s+/g, '-');
          return (
            <div key={s} className="card" style={{ padding: '12px 16px', cursor: 'pointer', textAlign: 'center', borderColor: statusFilter === s ? 'var(--primary)' : 'var(--border)' }}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}>
              <span className={`badge badge-${key}`} style={{ marginBottom: 8 }}>{s}</span>
              <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Fraunces, serif' }}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          {statuses.map(s => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="search-bar" style={{ marginLeft: 'auto' }}>
          <Briefcase className="search-bar-icon" size={15} />
          <input placeholder="Search jobs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-overflow">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Client</th>
                <th>Service</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Deadline</th>
                <th>Progress</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(job => {
                const completed = job.stages.filter(s => s.completed).length;
                const progress = job.stages.length > 0 ? Math.round((completed / job.stages.length) * 100) : 0;
                const isOverdue = new Date(job.deadline) < new Date() && !['Completed', 'Delivered'].includes(job.status);

                return (
                  <tr key={job.id}>
                    <td><span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 13, fontFamily: 'monospace' }}>{job.jobId}</span></td>
                    <td><span style={{ fontWeight: 500 }}>{job.clientName}</span></td>
                    <td>
                      <span style={{
                        padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: `${SERVICE_COLORS[job.serviceType] || '#888'}18`,
                        color: SERVICE_COLORS[job.serviceType] || '#888',
                      }}>
                        {job.serviceType}
                      </span>
                    </td>
                    <td><StatusBadge status={job.status} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{job.assignedTo}</td>
                    <td style={{ color: isOverdue ? '#dc2626' : 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={13} />
                        {formatDate(job.deadline)}
                      </span>
                    </td>
                    <td>
                      {job.stages.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{progress}%</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button onClick={() => { setEditId(job.id); setIsFormOpen(true); }} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(job.id)} className="btn btn-danger btn-icon btn-sm" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <Briefcase size={36} className="empty-state-icon" />
                    <p className="empty-state-title">No jobs found</p>
                    <p className="empty-state-body">{search || statusFilter ? 'Try adjusting your filters' : 'Create your first job order'}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormOpen} title={editId ? 'Edit Job' : 'New Job Order'} onClose={() => { setIsFormOpen(false); setEditId(null); }} size="lg">
        <JobForm jobId={editId} onClose={() => { setIsFormOpen(false); setEditId(null); }} />
      </Modal>
    </Layout>
  );
}
