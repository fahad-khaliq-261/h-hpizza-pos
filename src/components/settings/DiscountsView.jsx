import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Tag, Plus, CheckCircle2, XCircle } from 'lucide-react';
import Modal from '../common/Modal';

export default function DiscountsView() {
  const { triggerSound, addToast } = usePOS();
  const [promos, setPromos] = useState([
    { id: '1', name: 'Standard Staff Discount', type: 'Percentage', value: '15%', code: 'STAFF15', status: 'Active' },
    { id: '2', name: 'Happy Hours Promo', type: 'Percentage', value: '20%', code: 'HAPPY20', status: 'Active' },
    { id: '3', name: 'VIP Loyalty Benefit', type: 'Percentage', value: '10%', code: 'VIP10', status: 'Active' },
    { id: '4', name: 'Flat Combo Saver', type: 'Flat', value: 'Rs. 250', code: 'COMBO250', status: 'Active' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('10%');
  const [code, setCode] = useState('');

  const handleAddDiscount = (e) => {
    e.preventDefault();
    if (!name) return;
    const newPromo = {
      id: Date.now().toString(),
      name,
      type: value.includes('%') ? 'Percentage' : 'Flat',
      value,
      code: code.toUpperCase() || 'PROMO',
      status: 'Active'
    };
    setPromos(prev => [...prev, newPromo]);
    setIsModalOpen(false);
    setName('');
    setValue('10%');
    setCode('');
    triggerSound('success');
    addToast(`Discount rule "${name}" added`, 'success');
  };

  const toggleStatus = (id) => {
    triggerSound('click');
    setPromos(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>Discounts & Promotions</h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '2px' }}>
            Configure cashier discount rules, promo codes, and special offers
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>New Discount Rule</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '18px' }}>
        {promos.map((promo) => (
          <div key={promo.id} className="pos-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FFF0E8', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={20} />
              </div>
              <span className={`badge ${promo.status === 'Active' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.6875rem' }}>
                {promo.status}
              </span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: '14px' }}>
              {promo.name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                {promo.value}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
                Discount
              </span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                Code: <code style={{ fontWeight: 800, color: '#111827' }}>{promo.code}</code>
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => toggleStatus(promo.id)}
                style={{ fontSize: '0.6875rem', padding: '3px 8px' }}
              >
                {promo.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Discount Rule"
          maxWidth="440px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddDiscount}>Save Discount</button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Student 10% Off"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Value (e.g. 10% or Rs. 200)</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="10% or Rs. 200"
                value={value}
                onChange={e => setValue(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Promo Code</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="STUDENT10"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
