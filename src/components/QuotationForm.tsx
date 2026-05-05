import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useToast } from './Toast';
import { generateQuoteNumber } from '../utils/generators';

const schema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  date: z.string().min(1, 'Date is required'),
  items: z.array(z.object({
    description: z.string().min(1, 'Required'),
    qty: z.number().min(1, 'Min 1'),
    unitCost: z.number().min(0, 'Min 0'),
  })).min(1, 'Add at least one item'),
  notes: z.string().optional(),
  status: z.enum(['Pending', 'Accepted', 'Rejected']),
});

type FormData = z.infer<typeof schema>;

export default function QuotationForm({ quotationId, onClose }: { quotationId?: string | null; onClose: () => void }) {
  const { clients, addQuotation, updateQuotation, getQuotation, settings } = useDataStore();
  const toast = useToast();
  const quotation = quotationId ? getQuotation(quotationId) : null;

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: quotation ? {
      clientId: quotation.clientId,
      date: quotation.date,
      items: quotation.items.map(i => ({ description: i.description, qty: i.qty, unitCost: i.unitCost })),
      notes: quotation.notes,
      status: quotation.status,
    } : {
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ description: '', qty: 1, unitCost: 0 }],
      status: 'Pending',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const subtotal = items.reduce((s, i) => s + (i.qty || 0) * (i.unitCost || 0), 0);
  const vat = (subtotal * settings.vatRate) / 100;
  const total = subtotal + vat;

  const onSubmit = async (data: FormData) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) { toast.error('Select a valid client'); return; }
    try {
      const payload = {
        clientId: data.clientId,
        clientName: client.name,
        date: data.date,
        items: data.items.map(item => ({ id: Math.random().toString(36).substr(2, 9), ...item })),
        subtotal, vat, total,
        notes: data.notes,
        status: data.status,
        number: quotation?.number || generateQuoteNumber(settings.invoicePrefix),
      };
      if (quotation) { await updateQuotation(quotation.id, payload); toast.success('Quotation updated'); }
      else { await addQuotation(payload as any); toast.success('Quotation created'); }
      onClose();
    } catch (err) {
      toast.error(quotation ? 'Failed to update quotation' : 'Failed to create quotation');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
          <label className="form-label">Date</label>
          <input type="date" {...register('date')} className="input-field" />
        </div>
      </div>

      <div>
        <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Items</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fields.map((field, idx) => (
            <div key={field.id} className="line-item-row" style={{ alignItems: 'center' }}>
              <div className="line-item-desc">
                <input {...register(`items.${idx}.description`)} placeholder="Item description" className="input-field" />
              </div>
              <div className="line-item-qty">
                <input {...register(`items.${idx}.qty`, { valueAsNumber: true })} type="number" min={1} className="input-field" />
              </div>
              <div className="line-item-cost">
                <input {...register(`items.${idx}.unitCost`, { valueAsNumber: true })} type="number" step="0.01" min={0} className="input-field" />
              </div>
              <div style={{ width: 110, textAlign: 'right', fontSize: 13.5, fontWeight: 600 }}>
                {settings.currency} {((items[idx]?.qty || 0) * (items[idx]?.unitCost || 0)).toFixed(2)}
              </div>
              <button type="button" onClick={() => remove(idx)} className="btn btn-danger btn-icon btn-sm">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => append({ description: '', qty: 1, unitCost: 0 })}
            className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--primary)' }}>
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      <div className="totals-box">
        <div className="total-row">
          <span>Subtotal</span>
          <span className="amount">{settings.currency} {subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>VAT ({settings.vatRate}%)</span>
          <span className="amount">{settings.currency} {vat.toFixed(2)}</span>
        </div>
        <div className="total-row final">
          <span>Total</span>
          <span className="amount">{settings.currency} {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select {...register('status')} className="input-field">
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <input {...register('notes')} type="text" className="input-field" placeholder="Optional notes" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {quotation ? 'Update Quotation' : 'Create Quotation'}
        </button>
        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
      </div>
    </form>
  );
}
