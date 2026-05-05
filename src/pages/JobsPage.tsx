import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatDate } from '../utils/formatting';
import JobForm from '../components/JobForm';
import { useToast } from '../components/Toast';

export default function JobsPage() {
  const { jobs, deleteJob } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const toast = useToast();

  const filtered = useMemo(() => {
    return jobs.filter((job) => !statusFilter || job.status === statusFilter);
  }, [jobs, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteJob(id);
      toast.success('Job deleted');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Jobs</h2>
          <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Job
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', 'New', 'In Progress', 'Under Review', 'Completed', 'Delivered'].map((status) => (
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
                <th className="text-left py-3 px-4 font-medium">Job ID</th>
                <th className="text-left py-3 px-4 font-medium">Client</th>
                <th className="text-left py-3 px-4 font-medium">Service</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Assigned To</th>
                <th className="text-left py-3 px-4 font-medium">Deadline</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((job) => (
                  <tr key={job.id} className="table-row">
                    <td className="py-3 px-4 font-medium">{job.jobId}</td>
                    <td className="py-3 px-4">{job.clientName}</td>
                    <td className="py-3 px-4">{job.serviceType}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        job.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{job.assignedTo}</td>
                    <td className="py-3 px-4">{formatDate(job.deadline)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedJobId(job.id); setIsFormOpen(true); }}
                          className="p-2 rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-default)]"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
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
                  <td colSpan={7} className="py-12 text-center text-[color:var(--color-text-secondary)]">
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isFormOpen} title={selectedJobId ? 'Edit Job' : 'New Job'} onClose={() => { setIsFormOpen(false); setSelectedJobId(null); }} size="lg">
          <JobForm jobId={selectedJobId} onClose={() => { setIsFormOpen(false); setSelectedJobId(null); }} />
        </Modal>
      </div>
    </Layout>
  );
}
