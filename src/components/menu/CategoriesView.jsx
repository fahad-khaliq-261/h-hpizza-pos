import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CATEGORIES } from '../../data/seedData';
import { Shapes, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';

export default function CategoriesView() {
  const { menuItems, triggerSound, addToast } = usePOS();
  const [categoriesList, setCategoriesList] = useState(CATEGORIES.filter(c => c.id !== 'all'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;
    const newCat = {
      id: newCatName.toLowerCase().replace(/\s+/g, '-'),
      name: newCatName,
      icon: 'Utensils'
    };
    setCategoriesList(prev => [...prev, newCat]);
    setIsModalOpen(false);
    setNewCatName('');
    triggerSound('success');
    addToast(`Category "${newCatName}" created`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>Menu Categories</h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '2px' }}>
            Organize pizza sizes, crusts, beverages, and appetizers
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
        {categoriesList.map((cat, idx) => {
          const count = menuItems.filter(m => m.category === cat.id).length;

          return (
            <div key={idx} className="pos-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFF0E8', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shapes size={22} />
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                  {count} Items
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginTop: '16px' }}>
                {cat.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                Category Code: <code>{cat.id}</code>
              </p>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Category"
          maxWidth="420px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddCategory}>Create Category</button>
            </div>
          }
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Pasta, Calzones, Shakes..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              autoFocus
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
