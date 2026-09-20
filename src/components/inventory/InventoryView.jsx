import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import {
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Search,
  Plus,
  ArrowUpRight,
  PackagePlus,
  Check
} from 'lucide-react';

export default function InventoryView() {
  const { inventory, restockItem, addInventoryItem, triggerSound, addToast } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQty, setRestockQty] = useState('10');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Ingredient form
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    sku: 'ING-',
    currentStock: '',
    unit: 'kg',
    minStock: '',
    supplier: '',
    costPerUnit: ''
  });

  // Calculate Metrics
  const totalIngredients = inventory.length;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'Out of Stock').length;
  const totalValuation = inventory.reduce((sum, i) => sum + (i.currentStock * (i.costPerUnit || 500)), 0);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchQuery =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  const handleOpenRestock = (item) => {
    triggerSound('click');
    setRestockModalItem(item);
    setRestockQty('10');
  };

  const handleConfirmRestock = () => {
    if (!restockModalItem) return;
    const qty = parseFloat(restockQty) || 0;
    if (qty > 0) {
      restockItem(restockModalItem.id, qty);
    }
    setRestockModalItem(null);
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngredient.name || !newIngredient.currentStock) return;

    addInventoryItem({
      name: newIngredient.name,
      sku: newIngredient.sku || `ING-${Date.now().toString().slice(-4)}`,
      currentStock: parseFloat(newIngredient.currentStock) || 0,
      unit: newIngredient.unit,
      minStock: parseFloat(newIngredient.minStock) || 10,
      supplier: newIngredient.supplier || 'Local Supplier',
      costPerUnit: parseFloat(newIngredient.costPerUnit) || 500
    });

    setIsAddModalOpen(false);
    setNewIngredient({
      name: '',
      sku: 'ING-',
      currentStock: '',
      unit: 'kg',
      minStock: '',
      supplier: '',
      costPerUnit: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ingredient & Inventory Control</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Track raw pizza supplies, cheese batches, meat toppings, and automatic order deductions
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            triggerSound('click');
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>+ Add Ingredient</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Total Ingredients"
          value={totalIngredients.toString()}
          trend="16 Tracked"
          trendSubtitle="In Stock System"
          icon={Boxes}
          variant="primary"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount.toString()}
          trend={lowStockCount > 0 ? "Reorder Soon" : "Optimal"}
          trendSubtitle="Below Threshold"
          icon={AlertTriangle}
          variant="warning"
        />

        <StatCard
          title="Out of Stock"
          value={outOfStockCount.toString()}
          trend={outOfStockCount > 0 ? "Action Required" : "Zero Depletion"}
          trendSubtitle="Kitchen Alert"
          icon={XCircle}
          variant="secondary"
        />

        <StatCard
          title="Inventory Valuation"
          value={formatCurrency(totalValuation)}
          trend="+5.4%"
          trendSubtitle="vs last audit"
          icon={TrendingUp}
          variant="accent"
        />
      </div>

      {/* Table Card */}
      <div className="pos-card">
        <div className="pos-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Status Filter tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'In Stock', label: 'In Stock' },
              { id: 'Low Stock', label: 'Low Stock' },
              { id: 'Out of Stock', label: 'Out of Stock' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setStatusFilter(tab.id);
                }}
                style={{
                  border: 'none',
                  background: statusFilter === tab.id ? '#FFFFFF' : 'transparent',
                  color: statusFilter === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  fontSize: '0.8125rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: statusFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              style={{ padding: '8px 12px 8px 36px', fontSize: '0.8125rem' }}
              placeholder="Search ingredient or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Inventory Data Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Stock Level</th>
                <th>Supplier</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const ratio = Math.min(100, Math.round((item.currentStock / (item.minStock * 2)) * 100));

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Unit Cost: {formatCurrency(item.costPerUnit)} / {item.unit}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {item.sku}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: item.status === 'Out of Stock' ? 'var(--danger)' : 'var(--text-main)' }}>
                        {item.currentStock}
                      </span>{' '}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {item.minStock} {item.unit}
                    </td>
                    <td style={{ width: '130px' }}>
                      <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${ratio}%`,
                            background: item.status === 'Out of Stock'
                              ? '#EF4444'
                              : item.status === 'Low Stock'
                              ? '#F59E0B'
                              : '#10B981',
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {item.supplier}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenRestock(item)}
                      >
                        <PackagePlus size={13} style={{ color: 'var(--primary)' }} />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <Modal
          isOpen={!!restockModalItem}
          onClose={() => setRestockModalItem(null)}
          title={`Restock: ${restockModalItem.name}`}
          subtitle={`Current stock: ${restockModalItem.currentStock} ${restockModalItem.unit} (Min: ${restockModalItem.minStock} ${restockModalItem.unit})`}
          maxWidth="440px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setRestockModalItem(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmRestock}>
                Add to Stock
              </button>
            </div>
          }
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Quantity to Add ({restockModalItem.unit})
            </label>
            <input
              type="number"
              className="form-input font-mono"
              style={{ fontSize: '1.125rem', fontWeight: 800 }}
              value={restockQty}
              onChange={e => setRestockQty(e.target.value)}
              autoFocus
            />
          </div>
        </Modal>
      )}

      {/* Add New Ingredient Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Inventory Ingredient"
          subtitle="Add ingredient tracking details for kitchen stock control"
          maxWidth="500px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddIngredient}>
                Save Ingredient
              </button>
            </div>
          }
        >
          <form onSubmit={handleAddIngredient} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Ingredient Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Gorgonzola Cheese"
                value={newIngredient.name}
                onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">SKU Code</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="ING-GOR-17"
                  value={newIngredient.sku}
                  onChange={e => setNewIngredient({ ...newIngredient, sku: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Measurement Unit</label>
                <select
                  className="form-select"
                  value={newIngredient.unit}
                  onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="liters">liters (Liters)</option>
                  <option value="cans">cans (Cans/Tins)</option>
                  <option value="jars">jars (Jars)</option>
                  <option value="pieces">pieces (Units)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Initial Stock *</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  placeholder="25"
                  value={newIngredient.currentStock}
                  onChange={e => setNewIngredient({ ...newIngredient, currentStock: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Stock Alert</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  placeholder="10"
                  value={newIngredient.minStock}
                  onChange={e => setNewIngredient({ ...newIngredient, minStock: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost / Unit (Rs.)</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  placeholder="1200"
                  value={newIngredient.costPerUnit}
                  onChange={e => setNewIngredient({ ...newIngredient, costPerUnit: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Valley Dairy Fresh"
                value={newIngredient.supplier}
                onChange={e => setNewIngredient({ ...newIngredient, supplier: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
