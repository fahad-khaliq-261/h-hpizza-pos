import React, { useState, useEffect }    from 'react';
import { usePOS }                         from '../../context/POSContext';
import Modal                              from '../common/Modal';
import { PIZZA_SIZES, PIZZA_CRUSTS, EXTRA_TOPPINGS } from '../../data/seedData';
import { formatCurrency }                 from '../../utils/formatters';
import { getItemPriceForSize }            from '../../services/menuService';
import { Plus, Check, Sparkles }          from 'lucide-react';

export default function ItemCustomizerModal() {
  const { isCustomizerOpen, setIsCustomizerOpen, customizingItem, addToCart, triggerSound } = usePOS();

  const [selectedSize,     setSelectedSize]     = useState('m');
  const [selectedCrust,    setSelectedCrust]    = useState('regular'); // fixed: 'pan' doesn't exist
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [customNotes,      setCustomNotes]      = useState('');

  useEffect(() => {
    if (customizingItem) {
      // Default to first available size for this item
      const defaultSize = customizingItem.sizes?.[0] ?? 'm';
      setSelectedSize(defaultSize);
      setSelectedCrust('regular');
      setSelectedToppings([]);
      setCustomNotes('');
    }
  }, [customizingItem]);

  if (!customizingItem) return null;

  // Calculate live total price
  const sizeObj  = PIZZA_SIZES.find(s => s.id === selectedSize) || PIZZA_SIZES[1];
  const crustObj = PIZZA_CRUSTS.find(c => c.id === selectedCrust) || PIZZA_CRUSTS[0];
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);

  // ✅ Fixed: read correct size price from sizePrices map, not priceMultiplier
  const baseCalculated = getItemPriceForSize(customizingItem, selectedSize);
  const totalItemPrice = baseCalculated + crustObj.extraPrice + toppingsPrice;

  const handleToggleTopping = (topping) => {
    triggerSound('click');
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.id === topping.id);
      if (exists) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleConfirm = () => {
    addToCart(customizingItem, {
      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,
      notes: customNotes
    });
    setIsCustomizerOpen(false);
  };

  return (
    <Modal
      isOpen={isCustomizerOpen}
      onClose={() => setIsCustomizerOpen(false)}
      title={`Customize: ${customizingItem.name}`}
      subtitle="Select pizza size, crust style, gourmet toppings and notes"
      maxWidth="620px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Item Price</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(totalItemPrice)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsCustomizerOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
            >
              <Plus size={16} />
              <span>Add to Order</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Size Selection */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            1. Select Size
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${customizingItem.sizes?.length === 2 ? 2 : 4}, 1fr)`, gap: '10px' }}>
            {(customizingItem.sizes
              ? PIZZA_SIZES.filter(s => customizingItem.sizes.includes(s.id))
              : PIZZA_SIZES
            ).map((size) => {
              // ✅ Fixed: real per-size price from sizePrices map
              const price      = getItemPriceForSize(customizingItem, size.id);
              const isSelected = selectedSize === size.id;

              return (
                <div
                  key={size.id}
                  onClick={() => {
                    triggerSound('click');
                    setSelectedSize(size.id);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : '#E2E8F0'}`,
                    background: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                    {size.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                    {formatCurrency(price)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Crust Selection */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            2. Choose Crust Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {PIZZA_CRUSTS.map((crust) => {
              const isSelected = selectedCrust === crust.id;

              return (
                <div
                  key={crust.id}
                  onClick={() => {
                    triggerSound('click');
                    setSelectedCrust(crust.id);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : '#E2E8F0'}`,
                    background: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {crust.name}
                  </span>
                  {crust.extraPrice > 0 ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      +{formatCurrency(crust.extraPrice)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>Included</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Extra Toppings */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>
              3. Gourmet Extra Toppings (Optional)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedToppings.length} selected
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {EXTRA_TOPPINGS.map((topping) => {
              const isSelected = !!selectedToppings.find(t => t.id === topping.id);

              return (
                <div
                  key={topping.id}
                  onClick={() => handleToggleTopping(topping)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${isSelected ? 'var(--primary)' : '#E2E8F0'}`,
                    background: isSelected ? '#FEF2F2' : '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : '#CBD5E1'}`,
                        background: isSelected ? 'var(--primary)' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 500 }}>
                      {topping.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    +{formatCurrency(topping.price)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Kitchen Instructions */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Special Kitchen Notes</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Well-done, extra oregano on side, cut into 8 slices..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
