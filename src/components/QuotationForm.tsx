import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useToast } from './Toast';
import { generateQuoteNumber } from '../utils/generators';
import { formatCurrency } from '../utils/formatting';

const schema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  date: z.string().min(1, 'Date is required'),
  vatRate: z.number().min(0).max(100, 'VAT must be 0-100%'),
  items: z.array(z.object({
    item: z.string().optional(),
    description: z.string().min(1, 'Description required'),
    qty: z.number().min(1, 'Qty must be at least 1'),
    unitCost: z.number().min(0, 'Cost must be 0 or more'),
  })).min(1, 'Add at least one item'),
  notes: z.string().optional(),
  status: z.enum(['Pending', 'Accepted', 'Rejected']),
});

type FormData = z.infer<typeof schema>;

export default function QuotationForm({ quotationId, onClose }: { quotationId?: string | null; onClose: () => void }) {
  const { clients, addQuotation, updateQuotation, getQuotation, settings } = useDataStore();
  const toast = useToast();
  const quotation = quotationId ? getQuotation(quotationId) : null;

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: quotation ? {
      clientId: quotation.clientId,
      date: quotation.date,
      vatRate: quotation.vatRate,
      items: quotation.items.map(i => ({ item: i.item, description: i.description, qty: i.qty, unitCost: i.unitCost })),
      notes: quotation.notes,
      status: quotation.status,
    } : {
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      vatRate: settings.vatRate,
      items: [{ item: '', description: '', qty: 1, unitCost: 0 }],
      status: 'Pending',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const vatRate = watch('vatRate') || 0;
  const subtotal = items.reduce((s, i) => s + (i.qty || 0) * (i.unitCost || 0), 0);
  const vat = (subtotal * vatRate) / 100;
  const total = subtotal + vat;

  const onSubmit = async (data: FormData) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) { toast.error('Select a valid client'); return; }
    try {
      const payload = {
        clientId: data.clientId,
        clientName: client.name,
        date: data.date,
        vatRate: data.vatRate,
        items: data.items.map(item => ({ ...item })),
        subtotal, vat, total,
        notes: data.notes,
        status: data.status,
        number: quotation?.number || generateQuoteNumber(settings.invoicePrefix),
      };
      if (quotation) { await updateQuotation(quotation.id, payload); toast.success('Quotation updated'); }
      else { await addQuotation(payload as any); toast.success('Quotation created'); }
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Quotation form error:', err);
      toast.error(quotation ? `Failed to update quotation: ${errorMsg}` : `Failed to create quotation: ${errorMsg}`);
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
        <div className="form-group">
          <label className="form-label">VAT Rate (%)</label>
          <input type="number" inputMode="decimal" {...register('vatRate', { valueAsNumber: true })} min={0} max={100} step={0.01} className="input-field" />
          {errors.vatRate && <p className="form-error">{errors.vatRate.message}</p>}
        </div>
      </div>

      <div>
        <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Items</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header */}
          <div className="line-item-row line-item-header" style={{ padding: '0 0 4px' }}>
            <p style={{ width: 120, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</p>
            <p style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
            <p style={{ width: 70, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</p>
            <p style={{ width: 100, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Cost</p>
            <p style={{ width: 100, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total</p>
            <div style={{ width: 36 }} />
          </div>

          {fields.map((field, idx) => (
            <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="line-item-row" style={{ alignItems: 'center' }}>
                <div className="line-item-item">
                  <input {...register(`items.${idx}.item`)} placeholder="Item name" className="input-field" />
                </div>
                <div className="line-item-desc">
                  <input {...register(`items.${idx}.description`)} placeholder="Description" className="input-field" />
                </div>
                <div className="line-item-qty">
                  <input {...register(`items.${idx}.qty`, { valueAsNumber: true })} type="number" inputMode="numeric" min={1} placeholder="Qty" className="input-field" />
                </div>
                <div className="line-item-cost">
                  <input {...register(`items.${idx}.unitCost`, { valueAsNumber: true })} type="number" inputMode="decimal" step="0.01" min={0} placeholder="Unit cost" className="input-field" />
                </div>
                <div className="line-item-total" style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {formatCurrency((items[idx]?.qty || 0) * (items[idx]?.unitCost || 0), settings.currency)}
                </div>
                <button type="button" onClick={() => remove(idx)} className="btn btn-danger btn-icon btn-sm" aria-label="Remove item">
                  <Trash2 size={15} />
                </button>
              </div>
              {errors.items?.[idx]?.item && <p className="form-error" style={{ margin: '0 0 0 0' }}>{errors.items[idx]?.item?.message}</p>}
              {errors.items?.[idx]?.description && <p className="form-error" style={{ margin: '0 0 0 0' }}>{errors.items[idx]?.description?.message}</p>}
              {errors.items?.[idx]?.qty && <p className="form-error" style={{ margin: '0 0 0 0' }}>{errors.items[idx]?.qty?.message}</p>}
              {errors.items?.[idx]?.unitCost && <p className="form-error" style={{ margin: '0 0 0 0' }}>{errors.items[idx]?.unitCost?.message}</p>}
            </div>
          ))}
          <button type="button" onClick={() => append({ item: '', description: '', qty: 1, unitCost: 0 })}
            className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--primary)' }}>
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      <div className="totals-box">
        <div className="total-row">
          <span>Subtotal</span>
          <span className="amount">{formatCurrency(subtotal, settings.currency)}</span>
        </div>
        <div className="total-row">
          <span>VAT ({vatRate}%)</span>
          <span className="amount">{formatCurrency(vat, settings.currency)}</span>
        </div>
        <div className="total-row final">
          <span>Total</span>
          <span className="amount">{formatCurrency(total, settings.currency)}</span>
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
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
          {isSubmitting
            ? <><Loader2 size={16} className="spinner" /> Saving…</>
            : quotation ? 'Update Quotation' : 'Create Quotation'}
        </button>
        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  );
}
