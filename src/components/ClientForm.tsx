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

interface ClientFormProps {
  clientId?: string | null;
  onClose: () => void;
}

export default function ClientForm({ clientId, onClose }: ClientFormProps) {
  const { addClient, updateClient, getClient } = useDataStore();
  const toast = useToast();
  const client = clientId ? getClient(clientId) : null;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: client ? {
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address,
      category: client.category,
      industry: client.industry,
    } : {
      category: 'Active',
    },
  });

  const onSubmit = (data: FormData) => {
    if (client) {
      updateClient(client.id, data);
      toast.success('Client updated');
    } else {
      addClient(data);
      toast.success('Client created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Name *
          </label>
          <input {...register('name')} className="input-field" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Company *
          </label>
          <input {...register('company')} className="input-field" />
          {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Email *
          </label>
          <input {...register('email')} type="email" className="input-field" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Phone *
          </label>
          <input {...register('phone')} className="input-field" />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
          Address *
        </label>
        <textarea {...register('address')} className="input-field min-h-20" />
        {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Category *
          </label>
          <select {...register('category')} className="input-field">
            <option value="Prospect">Prospect</option>
            <option value="Active">Active</option>
            <option value="Retained">Retained</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Industry
          </label>
          <input {...register('industry')} className="input-field" />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {client ? 'Update Client' : 'Create Client'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
