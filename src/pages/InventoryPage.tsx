import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useDataStore } from '../stores/dataStore';
import { formatCurrency } from '../utils/formatting';
import { useToast } from '../components/Toast';

export default function InventoryPage() {
  const { stock, addStockItem, updateStockItem, deleteStockItem, settings } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    materialName: '',
    category: 'Paper' as any,
    unit: '',
    currentStock: 0,
    reorderLevel: 0,
    unitCost: 0,
  });
  const toast = useToast();

  const lowStockItems = useMemo(() => stock.filter(s => s.currentStock <= s.reorderLevel), [stock]);

  const handleSave = () => {
    if (!formData.materialName || !formData.unit) {
      toast.error('Fill all fields');
      return;
    }

    if (selectedId) {
      updateStockItem(selectedId, formData);
      toast.success('Stock item updated');
    } else {
      addStockItem(formData);
      toast.success('Stock item added');
    }

    setIsFormOpen(false);
    setSelectedId(null);
    setFormData({ materialName: '', category: 'Paper', unit: '', currentStock: 0, reorderLevel: 0, unitCost: 0 });
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setSelectedId(item.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteStockItem(id);
      toast.success('Stock item deleted');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Inventory</h2>
          <button onClick={() => { setSelectedId(null); setFormData({ materialName: '', category: 'Paper', unit: '', currentStock: 0, reorderLevel: 0, unitCost: 0 }); setIsFormOpen(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">{lowStockItems.length} items low on stock</p>
              <p className="text-sm text-red-700 mt-1">{lowStockItems.map(s => s.materialName).join(', ')}</p>
            </div>
          </div>
        )}

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--color-border)]">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Material</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Current Stock</th>
                <th className="text-left py-3 px-4 font-medium">Reorder Level</th>
                <th className="text-right py-3 px-4 font-medium">Unit Cost</th>
                <th className="text-right py-3 px-4 font-medium">Total Value</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item.id} className={`table-row ${item.currentStock <= item.reorderLevel ? 'bg-red-50' : ''}`}>
                  <td className="py-3 px-4 font-medium">{item.materialName}</td>
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4">
                    {item.currentStock} {item.unit}
                    {item.currentStock <= item.reorderLevel && <AlertTriangle size={14} className="inline ml-2 text-red-600" />}
                  </td>
                  <td className="py-3 px-4">{item.reorderLevel} {item.unit}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.unitCost, settings.currency)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.currentStock * item.unitCost, settings.currency)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-default)]"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isFormOpen} title={selectedId ? 'Edit Stock Item' : 'Add Stock Item'} onClose={() => setIsFormOpen(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Material Name *</label>
              <input
                type="text"
                value={formData.materialName}
                onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="Paper">Paper</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="Ink">Ink</option>
                  <option value="Metal">Metal</option>
                  <option value="Substrate">Substrate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., kg, sheets, boxes"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Stock</label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reorder Level</label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="btn-primary flex-1">
                {selectedId ? 'Update' : 'Add'} Item
              </button>
              <button onClick={() => setIsFormOpen(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
