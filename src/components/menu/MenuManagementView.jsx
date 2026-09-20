import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { CATEGORIES } from '../../data/seedData';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Edit2, Trash2, Search, X, Image, AlertTriangle, CheckCircle, Tag } from 'lucide-react';

const ITEM_CATEGORIES = [
  { id: 'special-pizza', label: 'Special Pizza' },
  { id: 'regular-pizza', label: 'Regular Pizza' },
  { id: 'chefs-pizza',   label: "Chef's Special Pizza" },
  { id: 'burgers',       label: 'Burgers' },
  { id: 'wraps',         label: 'Wraps' },
  { id: 'pratha-roll',   label: 'Pratha Roll' },
  { id: 'sandwich',      label: 'Sandwich' },
  { id: 'pasta',         label: 'Pasta' },
  { id: 'fries',         label: 'French Fries' },
  { id: 'appetizers',    label: 'Appetizers' },
];

const PIZZA_CATS = ['special-pizza', 'regular-pizza', 'chefs-pizza'];

const BLANK = {
  name: '', category: 'special-pizza', description: '', price: '',
  image: '', available: true, badge: '',
  sizeS: '', sizeM: '', sizeL: '', sizeXL: '',
};

export default function MenuManagementView() {
  const { menuItems, toggleItemAvailability, addMenuItem, updateMenuItem, deleteMenuItem, triggerSound, addToast } = usePOS();

  const [selectedCat,  setSelectedCat]  = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [editingItem,  setEditingItem]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form,         setForm]         = useState(BLANK);
  const [imgError,     setImgError]     = useState(false);

  const isPizza = PIZZA_CATS.includes(form.category);
  const isChef  = form.category === 'chefs-pizza';

  const filtered = useMemo(() =>
    menuItems.filter(item => {
      const catOk = selectedCat === 'all' || item.category === selectedCat;
      const qOk   = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return catOk && qOk;
    }), [menuItems, selectedCat, searchQuery]);

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const openAdd = () => {
    triggerSound('click');
    setEditingItem(null);
    setForm({ ...BLANK, category: selectedCat === 'all' ? 'special-pizza' : selectedCat });
    setImgError(false);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    triggerSound('click');
    setEditingItem(item);
    const sp = item.sizePrices || {};
    setForm({
      name: item.name, category: item.category,
      description: item.description || '', price: item.price?.toString() || '',
      image: item.image || '', available: item.available !== false,
      badge: item.badge || '',
      sizeS: sp.s?.toString() || '', sizeM: sp.m?.toString() || '',
      sizeL: sp.l?.toString() || '', sizeXL: sp.xl?.toString() || '',
    });
    setImgError(false);
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { addToast('Item name is required.', 'error'); return; }
    const pizza = PIZZA_CATS.includes(form.category);
    const chef  = form.category === 'chefs-pizza';
    const basePrice = pizza
      ? (parseFloat(form.sizeM) || parseFloat(form.sizeS) || 0)
      : parseFloat(form.price) || 0;
    if (basePrice <= 0) { addToast('Enter a valid price.', 'error'); return; }

    const data = {
      name, category: form.category, description: form.description.trim(),
      price: basePrice, available: form.available, badge: form.badge.trim(),
      image: form.image.trim() || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
      isCustomizable: pizza,
      ...(pizza && {
        sizes: chef ? ['m','l'] : ['s','m','l','xl'],
        sizePrices: chef
          ? { m: parseFloat(form.sizeM)||0, l: parseFloat(form.sizeL)||0 }
          : { s: parseFloat(form.sizeS)||0, m: parseFloat(form.sizeM)||0, l: parseFloat(form.sizeL)||0, xl: parseFloat(form.sizeXL)||0 },
      }),
    };

    if (editingItem) {
      updateMenuItem({ ...editingItem, ...data });
      addToast(`"${name}" updated.`, 'success');
    } else {
      addMenuItem(data);
      addToast(`"${name}" added to menu.`, 'success');
    }
    triggerSound('success');
    setIsFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMenuItem(deleteTarget.id);
    addToast(`"${deleteTarget.name}" removed.`, 'info');
    triggerSound('click');
    setDeleteTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Menu Management</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Add, edit, delete items — toggle availability in real time
          </p>
        </div>
        <button className="btn btn-primary" id="btn-add-menu-item" onClick={openAdd}>
          <Plus size={16} /><span>Add Menu Item</span>
        </button>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Category Sidebar */}
        <div className="pos-card" style={{ padding: '10px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 10px 10px' }}>
            Categories
          </div>
          {CATEGORIES.map(cat => {
            const active = selectedCat === cat.id;
            const count  = cat.id === 'all' ? menuItems.length : menuItems.filter(m => m.category === cat.id).length;
            return (
              <button key={cat.id} type="button" id={`cat-tab-${cat.id}`}
                onClick={() => { triggerSound('click'); setSelectedCat(cat.id); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 10px', borderRadius: '6px', border: 'none', width: '100%',
                  background: active ? 'var(--primary-light)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500, fontSize: '0.8rem',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span>{cat.name}</span>
                <span style={{
                  fontSize: '0.6875rem', padding: '1px 6px', borderRadius: '999px', fontWeight: 700,
                  background: active ? 'var(--primary)' : '#E2E8F0',
                  color: active ? '#fff' : '#64748B', minWidth: '20px', textAlign: 'center'
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
              <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input id="menu-search" type="text" className="form-input"
                style={{ paddingLeft: '34px', fontSize: '0.8125rem', height: '36px' }}
                placeholder="Search menu items…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="pos-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🍽️</div>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>No items found</div>
              <div style={{ fontSize: '0.8125rem' }}>Try a different category or search.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '14px' }}>
              {filtered.map(item => (
                <MenuCard key={item.id} item={item}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  onToggle={() => toggleItemAvailability(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────────────── */}
      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
          title={editingItem ? `Edit: ${editingItem.name}` : 'Add New Menu Item'}
          subtitle="Fill in the item details" maxWidth="560px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button className="btn btn-primary" id="btn-save-menu-item" onClick={handleSave}>
                {editingItem ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input id="mi-name" type="text" className="form-input" autoFocus required
                placeholder="e.g. H&H Special Pizza"
                value={form.name} onChange={e => f('name', e.target.value)} />
            </div>

            {/* Category + Badge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select id="mi-category" className="form-select"
                  value={form.category} onChange={e => f('category', e.target.value)}>
                  {ITEM_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Badge <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                <div style={{ position: 'relative' }}>
                  <Tag size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input id="mi-badge" type="text" className="form-input" style={{ paddingLeft: '30px' }}
                    placeholder="e.g. Bestseller" value={form.badge} onChange={e => f('badge', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <textarea id="mi-description" className="form-textarea" rows="2"
                placeholder="Short item description…"
                value={form.description} onChange={e => f('description', e.target.value)} />
            </div>

            {/* Pricing */}
            {isPizza ? (
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Size Prices (Rs.) *</label>
                {isChef ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Medium</label>
                      <input id="pi-m" type="number" className="form-input font-mono" placeholder="1300" value={form.sizeM} onChange={e => f('sizeM', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Large</label>
                      <input id="pi-l" type="number" className="form-input font-mono" placeholder="1800" value={form.sizeL} onChange={e => f('sizeL', e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[['sizeS','Small','700'],['sizeM','Medium','1200'],['sizeL','Large','1600'],['sizeXL','XL','2000']].map(([k,l,ph]) => (
                      <div className="form-group" key={k} style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{l}</label>
                        <input id={`pi-${k}`} type="number" className="form-input font-mono" placeholder={ph} value={form[k]} onChange={e => f(k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="form-group" style={{ maxWidth: '180px' }}>
                <label className="form-label">Price (Rs.) *</label>
                <input id="mi-price" type="number" className="form-input font-mono" placeholder="500" required min="1"
                  value={form.price} onChange={e => f('price', e.target.value)} />
              </div>
            )}

            {/* Image */}
            <div className="form-group">
              <label className="form-label">Image URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input id="mi-image" type="url" className="form-input" style={{ flex: 1 }}
                  placeholder="https://images.unsplash.com/..."
                  value={form.image}
                  onChange={e => { f('image', e.target.value); setImgError(false); }} />
                <div style={{ width: '56px', height: '56px', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {form.image && !imgError
                    ? <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
                    : <Image size={20} color="#CBD5E1" />}
                </div>
              </div>
            </div>

            {/* Available */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <input id="mi-available" type="checkbox" checked={form.available}
                onChange={e => f('available', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <label htmlFor="mi-available" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>
                Item is <span style={{ color: '#16A34A' }}>available</span> — show in POS order entry
              </label>
            </div>

          </form>
        </Modal>
      )}

      {/* ── DELETE CONFIRM ────────────────────────────────────────────────── */}
      {deleteTarget && (
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
          title="Delete Menu Item" maxWidth="400px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-primary" id="btn-confirm-delete"
                style={{ background: '#DC2626', borderColor: '#DC2626' }} onClick={confirmDelete}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          }
        >
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <AlertTriangle size={24} color="#DC2626" />
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Delete &ldquo;<span style={{ color: '#DC2626' }}>{deleteTarget.name}</span>&rdquo;?
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              This permanently removes the item from the menu.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MenuCard({ item, onEdit, onDelete, onToggle }) {
  const [imgErr, setImgErr] = useState(false);
  const catLabel = ITEM_CATEGORIES.find(c => c.id === item.category)?.label || item.category;

  const priceDisplay = (() => {
    if (item.sizePrices) {
      const vals = Object.values(item.sizePrices).filter(Boolean);
      if (vals.length > 1) return `Rs. ${Math.min(...vals).toLocaleString()} – ${Math.max(...vals).toLocaleString()}`;
    }
    return formatCurrency(item.price);
  })();

  return (
    <div id={`menu-card-${item.id}`} className="pos-card"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: item.available ? 1 : 0.6, transition: 'opacity 0.2s' }}>

      {/* Image */}
      <div style={{ position: 'relative', height: '130px', background: '#F1F5F9', flexShrink: 0 }}>
        {item.image && !imgErr
          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={32} color="#CBD5E1" /></div>
        }
        <span style={{ position: 'absolute', top: '7px', left: '7px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(15,23,42,0.75)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {catLabel}
        </span>
        {item.badge && (
          <span style={{ position: 'absolute', bottom: '7px', left: '7px', padding: '2px 7px', borderRadius: '999px', background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', fontWeight: 700 }}>
            {item.badge}
          </span>
        )}
        <button id={`toggle-${item.id}`} type="button" onClick={onToggle}
          style={{ position: 'absolute', top: '7px', right: '7px', padding: '3px 8px', borderRadius: '999px', background: item.available ? '#059669' : '#DC2626', color: '#fff', border: 'none', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '3px' }}>
          {item.available ? <CheckCircle size={10} /> : <X size={10} />}
          {item.available ? 'In Stock' : 'Sold Out'}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.3 }}>{item.name}</div>
        {item.description && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        )}
        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9375rem' }}>{priceDisplay}</div>

        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #E2E8F0', paddingTop: '9px', marginTop: '2px' }}>
          <button id={`edit-${item.id}`} type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onEdit}>
            <Edit2 size={13} /> Edit
          </button>
          <button id={`delete-${item.id}`} type="button" className="btn btn-ghost btn-sm"
            style={{ color: '#EF4444', padding: '0 10px' }} onClick={onDelete} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
