import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency } from '../utils/formatting';
import { useToast } from '../components/Toast';
import type { StockItem } from '../types';

type ItemForm = Omit<StockItem, 'id' | 'createdAt'>;
const blankForm = (): ItemForm => ({
  materialName: '', category: 'Paper', unit: '', currentStock: 0, reorderLevel: 0, unitCost: 0,
});

export default function InventoryPage() {
  const { stock, addStockItem, updateStockItem, deleteStockItem, settings } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ItemForm>(blankForm());
  const [catFilter, setCatFilter] = useState('');
  const toast = useToast();

  const lowStock = useMemo(() => stock.filter(s => s.currentStock <= s.reorderLevel), [stock]);
  const totalValue = useMemo(() => stock.reduce((s, i) => s + i.currentStock * i.unitCost, 0), [stock]);
  const filtered = useMemo(() => stock.filter(s => !catFilter || s.category === catFilter), [stock, catFilter]);

  const openAdd = () => { setEditId(null); setForm(blankForm()); setIsFormOpen(true); };
  const openEdit = (item: StockItem) => { setEditId(item.id); setForm({ materialName: item.materialName, category: item.category, unit: item.unit, currentStock: item.currentStock, reorderLevel: item.reorderLevel, unitCost: item.unitCost }); setIsFormOpen(true); };

  const handleSave = () => {
    if (!form.materialName || !form.unit) { toast.error('Name and unit are required'); return; }
    if (editId) { updateStockItem(editId, form); toast.success('Item updated'); }
    else { addStockItem(form); toast.success('Item added'); }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this stock item?')) { deleteStockItem(id); toast.success('Item deleted'); }
  };

  const categories = ['Paper', 'Vinyl', 'Ink', 'Metal', 'Substrate', 'Other'];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">{stock.length} items · Total value {formatCurrency(totalValue, settings.currency)}</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary"><Plus size={17} /> Add Item</button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} className="alert-icon" />
          <div className="alert-content">
            <p className="alert-title">{lowStock.length} item{lowStock.length > 1 ? 's' : ''} running low</p>
            <p className="alert-body">{lowStock.map(s => s.materialName).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div className="card" style={{ padding: '14px 18px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Total Items</p>
          <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Nexa, sans-serif' }}>{stock.length}</p>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Low Stock</p>
          <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Nexa, sans-serif', color: lowStock.length > 0 ? '#dc2626' : 'inherit' }}>{lowStock.length}</p>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Inventory Value</p>
          <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Nexa, sans-serif', color: 'var(--primary)' }}>{formatCurrency(totalValue, settings.currency)}</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="filter-bar">
        {['', ...categories].map(c => (
          <button key={c} className={`filter-btn ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c || 'All'}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-overflow">
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th className="text-right">Current Stock</th>
                <th className="text-right">Reorder At</th>
                <th>Status</th>
                <th className="text-right">Unit Cost</th>
                <th className="text-right">Total Value</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(item => {
                const isLow = item.currentStock <= item.reorderLevel;
                const pct = item.reorderLevel > 0 ? Math.min(100, (item.currentStock / (item.reorderLevel * 2)) * 100) : 100;
                return (
                  <tr key={item.id} style={isLow ? { background: 'rgba(220,38,38,0.03)' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={15} style={{ color: 'var(--primary)' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{item.materialName}</span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12.5 }}>{item.category}</span></td>
                    <td className="text-right">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontWeight: 600 }}>{item.currentStock} {item.unit}</span>
                        <div style={{ width: 80, height: 4, borderRadius: 2, background: 'var(--border)' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: isLow ? '#ef4444' : 'var(--primary)', borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td className="text-right" style={{ color: 'var(--text-muted)' }}>{item.reorderLevel} {item.unit}</td>
                    <td>
                      {isLow
                        ? <span className="badge badge-overdue"><AlertTriangle size={11} style={{ marginRight: 2 }} />Low</span>
                        : <span className="badge badge-paid">OK</span>
                      }
                    </td>
                    <td className="text-right" style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.unitCost, settings.currency)}</td>
                    <td className="text-right"><span style={{ fontWeight: 700 }}>{formatCurrency(item.currentStock * item.unitCost, settings.currency)}</span></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button onClick={() => openEdit(item)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-icon btn-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <Package size={36} className="empty-state-icon" />
                    <p className="empty-state-title">No items</p>
                    <p className="empty-state-body">{catFilter ? 'No items in this category' : 'Add your first stock item'}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item form modal */}
      <Modal isOpen={isFormOpen} title={editId ? 'Edit Stock Item' : 'Add Stock Item'} onClose={() => setIsFormOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Material Name *</label>
              <input type="text" className="input-field" placeholder="e.g. A4 Paper" value={form.materialName} onChange={e => setForm(f => ({ ...f, materialName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <input type="text" className="input-field" placeholder="e.g. sheets, kg, boxes" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Cost ({settings.currency})</label>
              <input type="number" step="0.01" className="input-field" placeholder="0.00" value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Current Stock</label>
              <input type="number" className="input-field" placeholder="0" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input type="number" className="input-field" placeholder="0" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Update Item' : 'Add Item'}</button>
            <button onClick={() => setIsFormOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
