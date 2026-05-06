import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useToast } from './Toast';
import { generateInvoiceNumber } from '../utils/generators';

const schema = z.object({
  type: z.enum(['proforma', 'final', 'receipt']),
  clientId: z.string().min(1, 'Client is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional(),
  vatRate: z.number().min(0).max(100, 'VAT must be 0-100%'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    qty: z.number().min(1, 'Qty must be at least 1'),
    unitCost: z.number().min(0, 'Cost must be 0 or more'),
  })).min(1, 'Add at least one item'),
  notes: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']),
});

type FormData = z.infer<typeof schema>;

export default function InvoiceForm({ invoiceId, onClose }: { invoiceId?: string | null; onClose: () => void }) {
  const { clients, addInvoice, updateInvoice, getInvoice, settings } = useDataStore();
  const toast = useToast();
  const invoice = invoiceId ? getInvoice(invoiceId) : null;

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: invoice ? {
      type: invoice.type as any,
      clientId: invoice.clientId,
      date: invoice.date,
      dueDate: invoice.dueDate,
      vatRate: invoice.vatRate,
      items: invoice.items.map(i => ({ description: i.description, qty: i.qty, unitCost: i.unitCost })),
      notes: invoice.notes,
      status: invoice.status,
    } : {
      type: 'final',
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      vatRate: 20,
      items: [{ description: '', qty: 1, unitCost: 0 }],
      status: 'Draft',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const vatRate = watch('vatRate') || 0;
  const subtotal = items.reduce((s, i) => s + (i.qty || 0) * (i.unitCost || 0), 0);
  const vat = (subtotal * vatRate) / 100;
  const total = subtotal + vat;

  const onSubmit = async (data: FormData) => {
    console.log('Form submission started with data:', data);
    const client = clients.find(c => c.id === data.clientId);
    if (!client) {
      console.error('Client not found with ID:', data.clientId);
      toast.error('Invalid client');
      return;
    }

    try {
      const payload = {
        type: data.type as any,
        clientId: data.clientId,
        clientName: client.name,
        clientAddress: client.address,
        date: data.date,
        dueDate: data.dueDate,
        vatRate: data.vatRate,
        items: data.items.map(item => ({ id: Math.random().toString(36).substr(2, 9), ...item })),
        subtotal, vat, total,
        notes: data.notes,
        status: data.status,
        number: invoice?.number || generateInvoiceNumber(settings.invoicePrefix),
      };
      console.log('Invoice payload:', payload);

      if (invoice) {
        await updateInvoice(invoice.id, payload);
        console.log('Invoice updated successfully');
        toast.success('Invoice updated');
      }
      else {
        await addInvoice(payload as any);
        console.log('Invoice created successfully');
        toast.success('Invoice created');
      }
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
        ? (err as any).message
        : err && typeof err === 'object' && 'error' in err
        ? (err as any).error
        : String(err);
      console.error('Invoice form error details:', err);
      console.error('Error message:', errorMsg);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      toast.error(invoice ? `Failed to update invoice: ${errorMsg}` : `Failed to create invoice: ${errorMsg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Invoice Type</label>
          <select {...register('type')} className="input-field">
            <option value="proforma">Pro-forma Invoice</option>
            <option value="final">Final Invoice</option>
            <option value="receipt">Receipt</option>
          </select>
        </div>
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
          <label className="form-label">Due Date</label>
          <input type="date" {...register('dueDate')} className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">VAT Rate (%)</label>
          <input type="number" {...register('vatRate', { valueAsNumber: true })} min={0} max={100} step={0.01} className="input-field" />
          {errors.vatRate && <p className="form-error">{errors.vatRate.message}</p>}
        </div>
      </div>

      {/* Line items */}
      <div>
        <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Line Items</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header */}
          <div className="line-item-row" style={{ padding: '0 0 4px' }}>
            <p style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
            <p style={{ width: 80, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</p>
            <p style={{ width: 110, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Cost</p>
            <p style={{ width: 110, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total</p>
            <div style={{ width: 36 }} />
          </div>

          {fields.map((field, idx) => (
            <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="line-item-row" style={{ alignItems: 'center' }}>
                <div className="line-item-desc">
                  <input {...register(`items.${idx}.description`)} placeholder="Item description" className="input-field" />
                </div>
                <div className="line-item-qty">
                  <input {...register(`items.${idx}.qty`, { valueAsNumber: true })} type="number" min={1} className="input-field" />
                </div>
                <div className="line-item-cost">
                  <input {...register(`items.${idx}.unitCost`, { valueAsNumber: true })} type="number" step="0.01" min={0} className="input-field" />
                </div>
                <div style={{ width: 110, textAlign: 'right', fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
                  {settings.currency} {((items[idx]?.qty || 0) * (items[idx]?.unitCost || 0)).toFixed(2)}
                </div>
                <button type="button" onClick={() => remove(idx)} className="btn btn-danger btn-icon btn-sm" title="Remove item">
                  <Trash2 size={15} />
                </button>
              </div>
              {errors.items?.[idx]?.description && <p className="form-error" style={{ margin: '0 0 0 0' }}>{errors.items[idx]?.description?.message}</p>}
              {errors.items?.[idx]?.qty && <p className="form-error" style={{ margin: '0 0 0 0' }}>{errors.items[idx]?.qty?.message}</p>}
              {errors.items?.[idx]?.unitCost && <p className="form-error" style={{ margin: '0 0 0 0' }}>{errors.items[idx]?.unitCost?.message}</p>}
            </div>
          ))}

          <button type="button" onClick={() => append({ description: '', qty: 1, unitCost: 0 })}
            className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--primary)' }}>
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="totals-box">
        <div className="total-row">
          <span>Subtotal</span>
          <span className="amount">{settings.currency} {subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>VAT / NHIL ({vatRate}%)</span>
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
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <input {...register('notes')} type="text" className="input-field" placeholder="Optional note or payment terms" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
      </div>
    </form>
  );
}
