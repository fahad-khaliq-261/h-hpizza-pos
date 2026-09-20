import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatCurrency } from '../../utils/formatters';
import { TABLES_LIST } from '../../data/seedData';
import {
  Utensils,
  ShoppingBag,
  Bike,
  Trash2,
  Plus,
  Minus,
  Percent,
  UserPlus,
  StickyNote,
  CreditCard,
  User,
  Check,
  X,
  ChevronDown
} from 'lucide-react';

export default function CurrentOrderCart() {
  const {
    cartItems,
    orderType,
    setOrderType,
    selectedTable,
    setSelectedTable,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    addCustomer,
    orderNotes,
    setOrderNotes,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    currentOrderNumber,
    cartTotals,
    updateQuantity,
    removeFromCart,
    clearCart,
    setIsPaymentModalOpen,
    triggerSound,
    addToast
  } = usePOS();

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const [tempDiscountVal, setTempDiscountVal] = useState(discountValue);
  const [tempDiscountType, setTempDiscountType] = useState(discountType);

  const handleOrderTypeChange = (type) => {
    triggerSound('click');
    setOrderType(type);
  };

  const handleProceedPayment = () => {
    if (cartItems.length === 0) return;
    triggerSound('click');
    setIsPaymentModalOpen(true);
  };

  const handleApplyDiscount = () => {
    setDiscountType(tempDiscountType);
    setDiscountValue(Number(tempDiscountVal) || 0);
    setShowDiscountModal(false);
    triggerSound('click');
    addToast(`Discount updated: ${tempDiscountVal}${tempDiscountType === 'percent' ? '%' : ' Rs.'}`, 'info');
  };

  const handleAddQuickCustomer = (e) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    const added = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress,
      type: 'New'
    });
    setSelectedCustomer(added);
    setShowCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
  };

  return (
    <aside className="pos-cart-section">
      {/* Top Header */}
      <div className="pos-cart-header">
        <div className="cart-header-top">
          <div className="cart-order-title">
            <h2>Current Order</h2>
            <span className="order-seq-badge">#{currentOrderNumber}</span>
          </div>

          <button
            onClick={clearCart}
            disabled={cartItems.length === 0}
            className="btn btn-ghost btn-sm"
            style={{ color: '#EF4444', padding: '4px 8px' }}
            title="Clear Cart"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>

        {/* Order Type Switcher */}
        <div className="order-type-pills">
          {[
            { id: 'Dine In', icon: Utensils },
            { id: 'Takeaway', icon: ShoppingBag },
            { id: 'Delivery', icon: Bike }
          ].map((type) => {
            const Icon = type.icon;
            const isActive = orderType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                className={`order-type-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleOrderTypeChange(type.id)}
              >
                <Icon size={14} />
                <span>{type.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Context Selection Bar (Table / Customer) */}
      <div className="cart-context-bar">
        {orderType === 'Dine In' && (
          <div className="cart-select-wrapper">
            <select
              className="form-select"
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                triggerSound('click');
              }}
              style={{ padding: '6px 8px', fontSize: '0.75rem', fontWeight: 600 }}
            >
              {TABLES_LIST.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.capacity})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="cart-select-wrapper" style={{ flex: orderType === 'Dine In' ? 1.5 : 1 }}>
          <button
            type="button"
            className="cart-select-btn"
            onClick={() => setShowCustomerModal(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <User size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
              </span>
            </div>
            <ChevronDown size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="pos-cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart-state">
            <span style={{ fontSize: '36px' }}>🛒</span>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9375rem' }}>
              Your order is empty
            </div>
            <p style={{ fontSize: '0.75rem', maxWidth: '200px' }}>
              Select pizzas, burgers, pasta, sides or drinks from the menu catalog to begin billing.
            </p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.uniqueCartId} className="cart-item-row">
              <div className="cart-item-main">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="cart-item-modifiers">
                      {item.modifiers.map((mod, idx) => (
                        <span key={idx} className="cart-modifier-tag">
                          {mod}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div style={{ fontSize: '0.6875rem', color: '#D97706', marginTop: '2px', fontStyle: 'italic' }}>
                      Note: {item.notes}
                    </div>
                  )}
                  <div className="cart-item-price-unit">
                    {formatCurrency(item.unitPrice)} each
                  </div>
                </div>

                <div className="cart-item-total">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>

              <div className="cart-item-controls">
                <div className="qty-stepper">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => updateQuantity(item.uniqueCartId, -1)}
                    title="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => updateQuantity(item.uniqueCartId, 1)}
                    title="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  className="item-delete-btn"
                  onClick={() => removeFromCart(item.uniqueCartId)}
                  title="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout Footer */}
      <div className="pos-cart-footer">
        <div className="cart-summary-rows">
          <div className="summary-row">
            <span>Subtotal ({cartTotals.itemCount} items)</span>
            <span className="font-mono">{formatCurrency(cartTotals.subtotal)}</span>
          </div>

          {/* Discount Trigger / Display */}
          <div className="summary-row discount-row" style={{ cursor: 'pointer' }} onClick={() => setShowDiscountModal(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Percent size={12} />
              <span>Discount {discountValue > 0 ? `(${discountValue}${discountType === 'percent' ? '%' : ' Flat'})` : ''}</span>
              <span style={{ fontSize: '0.6875rem', textDecoration: 'underline', color: 'var(--primary)', marginLeft: '4px' }}>
                {discountValue > 0 ? 'Edit' : '+ Add'}
              </span>
            </div>
            <span className="font-mono">
              {discountValue > 0 ? `-${formatCurrency(cartTotals.discountAmount)}` : 'Rs. 0'}
            </span>
          </div>

          <div className="summary-row">
            <span>Sales Tax (GST 17%)</span>
            <span className="font-mono">{formatCurrency(cartTotals.taxAmount)}</span>
          </div>

          {orderType === 'Delivery' && (
            <div className="summary-row">
              <span>Delivery Charges</span>
              <span className="font-mono">{formatCurrency(cartTotals.deliveryFee)}</span>
            </div>
          )}

          <div className="summary-row grand-total-row">
            <span>Grand Total</span>
            <span className="grand-total-val font-mono">
              {formatCurrency(cartTotals.grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cart-action-buttons">
          <button
            type="button"
            className="btn-proceed-payment"
            disabled={cartItems.length === 0}
            onClick={handleProceedPayment}
          >
            <CreditCard size={18} />
            <span>Proceed to Payment</span>
            <span className="font-mono" style={{ marginLeft: '4px' }}>
              ({formatCurrency(cartTotals.grandTotal)})
            </span>
          </button>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="modal-backdrop" onClick={() => setShowCustomerModal(false)}>
          <div className="modal-container" style={{ width: '100%', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Customer Selection</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowCustomerModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {/* Existing customers list */}
              <label className="form-label">Select Registered Customer</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <div
                  onClick={() => {
                    setSelectedCustomer(null);
                    setShowCustomerModal(false);
                    triggerSound('click');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${!selectedCustomer ? 'var(--primary)' : '#E2E8F0'}`,
                    background: !selectedCustomer ? 'var(--primary-light)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600
                  }}
                >
                  Walk-in / Guest
                </div>
                {customers.slice(0, 5).map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowCustomerModal(false);
                      triggerSound('click');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${selectedCustomer?.id === c.id ? 'var(--primary)' : '#E2E8F0'}`,
                      background: selectedCustomer?.id === c.id ? 'var(--primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                    </div>
                    <span className={`badge badge-${c.type === 'VIP' ? 'success' : 'neutral'}`} style={{ fontSize: '0.6875rem' }}>
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Add New Customer */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={16} style={{ color: 'var(--primary)' }} />
                  <span>Register New Customer</span>
                </div>
                <form onSubmit={handleAddQuickCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Customer Name"
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Phone (e.g. 0300-1234567)"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    required
                  />
                  {orderType === 'Delivery' && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Delivery Address"
                      value={newCustAddress}
                      onChange={e => setNewCustAddress(e.target.value)}
                    />
                  )}
                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '4px' }}>
                    Save & Select
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount Configuration Modal */}
      {showDiscountModal && (
        <div className="modal-backdrop" onClick={() => setShowDiscountModal(false)}>
          <div className="modal-container" style={{ width: '100%', maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Apply Discount</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowDiscountModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn ${tempDiscountType === 'percent' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTempDiscountType('percent')}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  className={`btn ${tempDiscountType === 'flat' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTempDiscountType('flat')}
                >
                  Flat Amount (Rs.)
                </button>
              </div>

              {tempDiscountType === 'percent' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[5, 10, 15, 20].map(p => (
                    <button
                      key={p}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{
                        background: tempDiscountVal === p ? 'var(--primary-light)' : '#FFFFFF',
                        borderColor: tempDiscountVal === p ? 'var(--primary)' : '#CBD5E1',
                        color: tempDiscountVal === p ? 'var(--primary)' : 'inherit',
                        fontWeight: 700
                      }}
                      onClick={() => setTempDiscountVal(p)}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {tempDiscountType === 'percent' ? 'Custom Percentage (%)' : 'Discount Amount (Rs.)'}
                </label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max={tempDiscountType === 'percent' ? 100 : cartTotals.subtotal}
                  value={tempDiscountVal}
                  onChange={e => setTempDiscountVal(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setTempDiscountVal(0);
                  setDiscountValue(0);
                  setShowDiscountModal(false);
                }}
              >
                Remove
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApplyDiscount}
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
