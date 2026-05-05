import { useState, useEffect } from 'react';
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
  date: z.string(),
  dueDate: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      qty: z.number().min(1, 'Quantity must be at least 1'),
      unitCost: z.number().min(0, 'Unit cost must be positive'),
    })
  ),
  notes: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']),
});

type FormData = z.infer<typeof schema>;

interface InvoiceFormProps {
  invoiceId?: string | null;
  onClose: () => void;
}

export default function InvoiceForm({ invoiceId, onClose }: InvoiceFormProps) {
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
      items: invoice.items.map(i => ({ description: i.description, qty: i.qty, unitCost: i.unitCost })),
      notes: invoice.notes,
      status: invoice.status,
    } : {
      type: 'final',
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ description: '', qty: 1, unitCost: 0 }],
      status: 'Draft',
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

    const invoiceData = {
      type: data.type as any,
      clientId: data.clientId,
      clientName: client.name,
      clientAddress: client.address,
      date: data.date,
      dueDate: data.dueDate,
      items: data.items.map(item => ({ id: Math.random().toString(36).substr(2, 9), ...item })),
      subtotal,
      vat,
      total,
      notes: data.notes,
      status: data.status,
      number: invoice?.number || generateInvoiceNumber(settings.invoicePrefix),
    };

    if (invoice) {
      updateInvoice(invoice.id, invoiceData);
      toast.success('Invoice updated');
    } else {
      addInvoice(invoiceData as any);
      toast.success('Invoice created');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Invoice Type
          </label>
          <select {...register('type')} className="input-field">
            <option value="proforma">Pro-forma</option>
            <option value="final">Final Invoice</option>
            <option value="receipt">Receipt</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Client
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

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
            Due Date
          </label>
          <input {...register('dueDate')} type="date" className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
          Line Items
        </label>
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-3 items-start">
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
                placeholder="Unit Cost"
                className="input-field w-24"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ description: '', qty: 1, unitCost: 0 })}
            className="flex items-center gap-2 text-[color:var(--color-primary)] font-medium hover:underline"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-[color:var(--color-bg-default)] p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-[color:var(--color-text-primary)]">
          <span>Subtotal:</span>
          <span className="font-medium">{settings.currency} {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[color:var(--color-text-primary)]">
          <span>VAT ({settings.vatRate}%):</span>
          <span className="font-medium">{settings.currency} {vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-[color:var(--color-text-primary)] border-t border-[color:var(--color-border)] pt-2">
          <span>Total:</span>
          <span>{settings.currency} {total.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
          Notes
        </label>
        <textarea
          {...register('notes')}
          placeholder="Additional notes or payment terms"
          className="input-field min-h-24"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
          Status
        </label>
        <select {...register('status')} className="input-field">
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
