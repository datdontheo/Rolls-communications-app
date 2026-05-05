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
  assignedTo: z.string().optional(),
  deadline: z.string().optional(),
  stages: z.array(z.object({ name: z.string().min(1, 'Stage name required') })),
  internalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function JobForm({ jobId, onClose }: { jobId?: string | null; onClose: () => void }) {
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
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      stages: [{ name: 'Design' }, { name: 'Production' }, { name: 'Quality Check' }],
      internalNotes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'stages' });

  const onSubmit = async (data: FormData) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) { toast.error('Select a valid client'); return; }
    try {
      const payload = {
        clientId: data.clientId,
        clientName: client.name,
        serviceType: data.serviceType,
        status: data.status,
        assignedTo: data.assignedTo,
        deadline: data.deadline,
        stages: data.stages.map(s => ({ id: Math.random().toString(36).substr(2, 9), name: s.name, completed: false })),
        internalNotes: data.internalNotes || '',
      };
      if (job) { await updateJob(job.id, payload); toast.success('Job updated'); }
      else { await addJob(payload as any); toast.success('Job created'); }
      onClose();
    } catch (err) {
      toast.error(job ? 'Failed to update job' : 'Failed to create job');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Client *</label>
          <select {...register('clientId')} className="input-field">
            <option value="">Select client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.clientId && <p className="form-error">{errors.clientId.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Service Type</label>
          <select {...register('serviceType')} className="input-field">
            <option value="Advertising">Advertising</option>
            <option value="Printing">Printing</option>
            <option value="Fabrication">Fabrication</option>
            <option value="Design">Design</option>
            <option value="Media">Media</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Assigned To</label>
          <input {...register('assignedTo')} className="input-field" placeholder="Staff member name" />
        </div>
        <div className="form-group">
          <label className="form-label">Deadline</label>
          <input type="date" {...register('deadline')} className="input-field" />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Status</label>
          <select {...register('status')} className="input-field">
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Production stages */}
      <div>
        <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Production Stages</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fields.map((field, index) => (
            <div key={field.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
              }}>{index + 1}</div>
              <input {...register(`stages.${index}.name`)} placeholder="Stage name" className="input-field" style={{ flex: 1 }} />
              <button type="button" onClick={() => remove(index)} className="btn btn-danger btn-icon btn-sm">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => append({ name: '' })}
            className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--primary)' }}>
            <Plus size={15} /> Add Stage
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Internal Notes</label>
        <textarea {...register('internalNotes')} className="input-field" placeholder="Private notes for the team…" style={{ minHeight: 80 }} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {job ? 'Update Job' : 'Create Job Order'}
        </button>
        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
      </div>
    </form>
  );
}
