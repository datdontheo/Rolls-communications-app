import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import ClientForm from '../components/ClientForm';
import { useToast } from '../components/Toast';

export default function ClientsPage() {
  const { clients, deleteClient } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const filtered = useMemo(() => {
    return clients.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteClient(id);
      toast.success('Client deleted');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Clients</h2>
          <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Client
          </button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
          />
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--color-border)]">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Name</th>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Company</th>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Email</th>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Category</th>
                <th className="text-right py-3 px-4 font-medium text-[color:var(--color-text-primary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((client) => (
                  <tr key={client.id} className="table-row">
                    <td className="py-3 px-4 font-medium text-[color:var(--color-text-primary)]">{client.name}</td>
                    <td className="py-3 px-4 text-[color:var(--color-text-secondary)]">{client.company}</td>
                    <td className="py-3 px-4 text-[color:var(--color-text-secondary)]">{client.email}</td>
                    <td className="py-3 px-4 text-[color:var(--color-text-secondary)]">{client.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        client.category === 'Active' ? 'bg-green-100 text-green-800' :
                        client.category === 'Retained' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {client.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedClientId(client.id); setIsFormOpen(true); }}
                          className="p-2 rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-default)] transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isFormOpen} title={selectedClientId ? 'Edit Client' : 'New Client'} onClose={() => { setIsFormOpen(false); setSelectedClientId(null); }}>
          <ClientForm clientId={selectedClientId} onClose={() => { setIsFormOpen(false); setSelectedClientId(null); }} />
        </Modal>
      </div>
    </Layout>
  );
}
