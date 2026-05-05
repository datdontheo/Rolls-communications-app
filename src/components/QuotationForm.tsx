import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useToast } from './Toast';
import { generateQuoteNumber } from '../utils/generators';

const schema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  date: z.string(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      qty: z.number().min(1, 'Quantity must be at least 1'),
      unitCost: z.number().min(0, 'Unit cost must be positive'),
    })
  ),
  notes: z.string().optional(),
  status: z.enum(['Pending', 'Accepted', 'Rejected']),
});

type FormData = z.infer<typeof schema>;

interface QuotationFormProps {
  quotationId?: string | null;
  onClose: () => void;
}

export default function QuotationForm({ quotationId, onClose }: QuotationFormProps) {
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
  const vat = (subtotal * settings.vatRate) / 100;
  const total = subtotal + vat;

  const onSubmit = (data: FormData) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) {
      toast.error('Invalid client');
      return;
    }

    const quotationData = {
      clientId: data.clientId,
      clientName: client.name,
      date: data.date,
      items: data.items.map(item => ({ id: Math.random().toString(36).substr(2, 9), ...item })),
      subtotal,
      vat,
      total,
      notes: data.notes,
      status: data.status,
      number: quotation?.number || generateQuoteNumber(settings.invoicePrefix),
    };

    if (quotation) {
      updateQuotation(quotation.id, quotationData);
      toast.success('Quotation updated');
    } else {
      addQuotation(quotationData as any);
      toast.success('Quotation created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Client *
          </label>
          <select {...register('clientId')} className="input-field">
            <option value="">Select a client</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-xs text-red-600 mt-1">{errors.clientId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Date
          </label>
          <input {...register('date')} type="date" className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
          Line Items
        </label>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`items.${idx}.description`)}
                placeholder="Description"
                className="input-field flex-1"
              />
              <input
                {...register(`items.${idx}.qty`, { valueAsNumber: true })}
                type="number"
                placeholder="Qty"
                className="input-field w-20"
              />
              <input
                {...register(`items.${idx}.unitCost`, { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Cost"
                className="input-field w-24"
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
            onClick={() => append({ description: '', qty: 1, unitCost: 0 })}
            className="flex items-center gap-2 text-[color:var(--color-primary)] font-medium"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-[color:var(--color-bg-default)] p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">{settings.currency} {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>VAT ({settings.vatRate}%):</span>
          <span className="font-medium">{settings.currency} {vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-[color:var(--color-border)] pt-2">
          <span>Total:</span>
          <span>{settings.currency} {total.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
          Status *
        </label>
        <select {...register('status')} className="input-field">
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
          Notes
        </label>
        <textarea {...register('notes')} className="input-field min-h-20" />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {quotation ? 'Update Quotation' : 'Create Quotation'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
