import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useToast } from './Toast';

const schema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  serviceType: z.enum(['Advertising', 'Printing', 'Fabrication', 'Design', 'Media']),
  status: z.enum(['New', 'In Progress', 'Under Review', 'Completed', 'Delivered']),
  assignedTo: z.string().min(1, 'Assigned to is required'),
  deadline: z.string(),
  stages: z.array(z.object({
    name: z.string().min(1, 'Stage name is required'),
  })),
  internalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface JobFormProps {
  jobId?: string | null;
  onClose: () => void;
}

export default function JobForm({ jobId, onClose }: JobFormProps) {
  const { clients, addJob, updateJob, getJob } = useDataStore();
  const toast = useToast();
  const job = jobId ? getJob(jobId) : null;

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: job ? {
      clientId: job.clientId,
      serviceType: job.serviceType,
      status: job.status,
      assignedTo: job.assignedTo,
      deadline: job.deadline,
      stages: job.stages.map(s => ({ name: s.name })),
      internalNotes: job.internalNotes,
    } : {
      status: 'New',
      deadline: new Date().toISOString().split('T')[0],
      stages: [{ name: 'Design' }, { name: 'Production' }, { name: 'Quality Check' }],
      internalNotes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stages',
  });

  const onSubmit = (data: FormData) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) {
      toast.error('Invalid client');
      return;
    }

    const jobData = {
      clientId: data.clientId,
      clientName: client.name,
      serviceType: data.serviceType,
      status: data.status,
      assignedTo: data.assignedTo,
      deadline: data.deadline,
      stages: data.stages.map((s, idx) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: s.name,
        completed: false,
      })),
      internalNotes: data.internalNotes || '',
    };

    if (job) {
      updateJob(job.id, jobData);
      toast.success('Job updated');
    } else {
      addJob(jobData as any);
      toast.success('Job created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Client *</label>
          <select {...register('clientId')} className="input-field">
            <option value="">Select a client</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-xs text-red-600 mt-1">{errors.clientId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Service Type *</label>
          <select {...register('serviceType')} className="input-field">
            <option value="Advertising">Advertising</option>
            <option value="Printing">Printing</option>
            <option value="Fabrication">Fabrication</option>
            <option value="Design">Design</option>
            <option value="Media">Media</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status *</label>
          <select {...register('status')} className="input-field">
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Assigned To *</label>
          <input {...register('assignedTo')} className="input-field" />
          {errors.assignedTo && <p className="text-xs text-red-600 mt-1">{errors.assignedTo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deadline *</label>
          <input {...register('deadline')} type="date" className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Production Stages</label>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`stages.${idx}.name`)}
                placeholder="Stage name"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '' })}
            className="flex items-center gap-2 text-[color:var(--color-primary)] font-medium"
          >
            <Plus size={18} /> Add Stage
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Internal Notes</label>
        <textarea {...register('internalNotes')} className="input-field min-h-24" />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {job ? 'Update Job' : 'Create Job'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
