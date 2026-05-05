import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDataStore } from '../stores/dataStore';
import { useToast } from './Toast';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  category: z.enum(['Prospect', 'Active', 'Retained']),
  industry: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ClientForm({ clientId, onClose }: { clientId?: string | null; onClose: () => void }) {
  const { addClient, updateClient, getClient } = useDataStore();
  const toast = useToast();
  const client = clientId ? getClient(clientId) : null;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: client ?? { category: 'Active', name: '', company: '', email: '', phone: '', address: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (client) { await updateClient(client.id, data); toast.success('Client updated'); }
      else { await addClient(data); toast.success('Client created'); }
      onClose();
    } catch (err) {
      toast.error(client ? 'Failed to update client' : 'Failed to create client');
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
          <label className="form-label">Company *</label>
          <input {...register('company')} className="input-field" placeholder="Company Ltd." />
          {errors.company && <p className="form-error">{errors.company.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input {...register('email')} type="email" className="input-field" placeholder="john@company.com" />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone *</label>
          <input {...register('phone')} className="input-field" placeholder="020 000 0000" />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
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
        <label className="form-label">Address *</label>
        <textarea {...register('address')} className="input-field" placeholder="Physical address" style={{ minHeight: 72 }} />
        {errors.address && <p className="form-error">{errors.address.message}</p>}
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
