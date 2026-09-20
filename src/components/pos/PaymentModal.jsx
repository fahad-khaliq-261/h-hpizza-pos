import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  Banknote,
  CreditCard,
  Smartphone,
  Layers,
  Printer,
  CheckCircle,
  Delete
} from 'lucide-react';

export default function PaymentModal() {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotals,
    completeOrder,
    triggerSound
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [referenceNo, setReferenceNo] = useState('');

  const grandTotal = cartTotals.grandTotal;

  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentMethod('Cash');
      setAmountReceived(grandTotal.toString());
      setReferenceNo('');
    }
  }, [isPaymentModalOpen, grandTotal]);

  if (!isPaymentModalOpen) return null;

  const numReceived = parseFloat(amountReceived) || 0;
  const changeDue = Math.max(0, numReceived - grandTotal);
  const isSufficient = numReceived >= grandTotal;

  const paymentMethods = [
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'Card', label: 'Card (POS)', icon: CreditCard },
    { id: 'JazzCash', label: 'JazzCash', icon: Smartphone },
    { id: 'Easypaisa', label: 'Easypaisa', icon: Smartphone },
    { id: 'Split', label: 'Split Payment', icon: Layers }
  ];

  // Tender presets
  const tenderPresets = [
    { label: 'Exact', value: grandTotal },
    { label: `${formatCurrency(Math.ceil(grandTotal / 500) * 500)}`, value: Math.ceil(grandTotal / 500) * 500 },
    { label: `${formatCurrency(Math.ceil(grandTotal / 1000) * 1000)}`, value: Math.ceil(grandTotal / 1000) * 1000 },
    { label: 'Rs. 5,000', value: 5000 },
    { label: 'Rs. 10,000', value: 10000 }
  ];

  const handleKeypadPress = (val) => {
    triggerSound('click');
    if (val === 'C') {
      setAmountReceived('');
    } else if (val === 'BACK') {
      setAmountReceived(prev => prev.slice(0, -1));
    } else {
      setAmountReceived(prev => prev + val);
    }
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'Cash' && !isSufficient) {
      triggerSound('remove');
      return;
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    completeOrder({
      method: paymentMethod,
      amountReceived: numReceived,
      change: changeDue,
      referenceNo
    });
  };

  return (
    <Modal
      isOpen={isPaymentModalOpen}
      onClose={() => setIsPaymentModalOpen(false)}
      title="Complete Payment"
      subtitle="Select payment method and enter received cash amount"
      maxWidth="640px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsPaymentModalOpen(false)}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary btn-lg"
            disabled={paymentMethod === 'Cash' && !isSufficient}
            onClick={handleConfirmPayment}
          >
            <CheckCircle size={18} />
            <span>Confirm & Print Receipt</span>
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Prominent Amount Due Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
            color: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Grand Total Due
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
              {formatCurrency(grandTotal)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-primary" style={{ background: 'rgba(197, 48, 26, 0.4)', color: '#FCA5A5', border: '1px solid rgba(252, 165, 165, 0.3)' }}>
              17% Tax Included
            </span>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {paymentMethods.map(pm => {
            const Icon = pm.icon;
            const isSelected = paymentMethod === pm.id;

            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setPaymentMethod(pm.id);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 6px',
                  borderRadius: '8px',
                  border: `2px solid ${isSelected ? 'var(--primary)' : '#E2E8F0'}`,
                  background: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={20} />
                <span>{pm.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cash Tender Details & Keypad */}
        {paymentMethod === 'Cash' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginTop: '4px' }}>
            {/* Left: Input, Presets & Change */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cash Amount Received (Rs.)</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  style={{ fontSize: '1.25rem', fontWeight: 800, padding: '10px 14px' }}
                  value={amountReceived}
                  onChange={e => setAmountReceived(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Quick tender suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tenderPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      triggerSound('click');
                      setAmountReceived(preset.value.toString());
                    }}
                    style={{ fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Change calculation box */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: isSufficient ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${isSufficient ? '#A7F3D0' : '#FECACA'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isSufficient ? '#065F46' : '#991B1B' }}>
                  {isSufficient ? 'Change to Return:' : 'Amount Remaining:'}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: isSufficient ? '#047857' : '#DC2626'
                  }}
                >
                  {isSufficient ? formatCurrency(changeDue) : formatCurrency(grandTotal - numReceived)}
                </span>
              </div>
            </div>

            {/* Right: Touch Screen POS Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'C'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadPress(k)}
                  style={{
                    padding: '12px 0',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    background: k === 'C' ? '#FEE2E2' : '#F8FAFC',
                    color: k === 'C' ? '#DC2626' : 'var(--text-main)',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease'
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card or Digital Wallet (JazzCash / Easypaisa) Input */}
        {(paymentMethod === 'Card' || paymentMethod === 'JazzCash' || paymentMethod === 'Easypaisa') && (
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontWeight: 700, fontSize: '0.875rem' }}>
              <CheckCircle size={18} />
              <span>Terminal Ready for {paymentMethod} Transaction</span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transaction / Approval Reference (Optional)</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="e.g. TXN-892410"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
              />
            </div>
          </div>
        )}

        {paymentMethod === 'Split' && (
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Split Cash & Card Tender
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label">Cash Portion</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  placeholder="Rs. 0"
                  defaultValue={Math.round(grandTotal / 2)}
                />
              </div>
              <div>
                <label className="form-label">Card / Wallet Portion</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  placeholder="Rs. 0"
                  defaultValue={grandTotal - Math.round(grandTotal / 2)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
