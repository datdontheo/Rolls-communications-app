import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDataStore } from '../stores/dataStore';
import { useToast } from './Toast';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().optional(),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  address: z.string().optional(),
  category: z.enum(['Prospect', 'Active', 'Retained']).optional(),
  industry: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ClientForm({ clientId, onClose }: { clientId?: string | null; onClose: () => void }) {
  const { addClient, updateClient, getClient } = useDataStore();
  const toast = useToast();
  const client = clientId ? getClient(clientId) : null;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: client ?? { name: '', phone: '', company: '', email: '', address: '', category: 'Active' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (client) { await updateClient(client.id, data); toast.success('Client updated'); }
      else { await addClient(data); toast.success('Client created'); }
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Client form error:', err);
      toast.error(client ? `Failed to update client: ${errorMsg}` : `Failed to create client: ${errorMsg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input {...register('name')} className="input-field" placeholder="John Mensah" />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Company</label>
          <input {...register('company')} className="input-field" placeholder="Company Ltd." />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input {...register('email')} type="email" className="input-field" placeholder="john@company.com" />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone *</label>
          <input {...register('phone')} className="input-field" placeholder="020 000 0000" />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select {...register('category')} className="input-field">
            <option value="Prospect">Prospect</option>
            <option value="Active">Active</option>
            <option value="Retained">Retained</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Industry</label>
          <input {...register('industry')} className="input-field" placeholder="e.g. Banking, FMCG" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea {...register('address')} className="input-field" placeholder="Physical address" style={{ minHeight: 72 }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {client ? 'Update Client' : 'Create Client'}
        </button>
        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
      </div>
    </form>
  );
}
