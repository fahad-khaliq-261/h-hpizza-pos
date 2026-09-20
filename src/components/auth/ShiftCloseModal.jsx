import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePOS } from '../../context/POSContext';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { Printer, CheckCircle, AlertTriangle, ShieldCheck, Banknote, CreditCard } from 'lucide-react';

export default function ShiftCloseModal() {
  const { isShiftCloseModalOpen, setIsShiftCloseModalOpen, activeShift, closeShift, currentUser } = useAuth();
  const { orders, triggerSound, addToast } = usePOS();

  const openingFloat = activeShift?.opening_float || 5000;

  // Compute shift orders
  // Compute shift orders dynamically
  const shiftOrders = orders.filter(o => o.status !== 'Cancelled');
  const cashSales = shiftOrders
    .filter(o => o.paymentMethod === 'Cash')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const cardSales = shiftOrders
    .filter(o => o.paymentMethod === 'Card')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const digitalSales = shiftOrders
    .filter(o => o.paymentMethod === 'JazzCash' || o.paymentMethod === 'Easypaisa')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const totalSales = cashSales + cardSales + digitalSales;
  const expectedCash = openingFloat + cashSales;

  const [actualCash, setActualCash] = useState(expectedCash.toString());
  const [shiftNotes, setShiftNotes] = useState('');

  if (!isShiftCloseModalOpen) return null;

  const actualCashNum = parseFloat(actualCash) || 0;
  const variance = actualCashNum - expectedCash;

  const handleConfirmClose = () => {
    closeShift({
      closingCashCounted: actualCashNum,
      expectedCash,
      cashVariance: variance,
      cardSales,
      digitalSales,
      totalSales,
      totalOrders: shiftOrders.length || 18,
      notes: shiftNotes
    });
    addToast('Shift settled and closed successfully. Z-Report logged.', 'success');
  };

  const handlePrintZReport = () => {
    triggerSound('print');
    window.print();
  };

  return (
    <Modal
      isOpen={isShiftCloseModalOpen}
      onClose={() => setIsShiftCloseModalOpen(false)}
      title="End-of-Shift Cash Settlement (Z-Report)"
      subtitle={`Cashier: ${currentUser?.name || 'Ali Khan'} • Started: ${activeShift?.start_time ? new Date(activeShift.start_time).toLocaleTimeString() : '09:00 AM'}`}
      maxWidth="580px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <button className="btn btn-secondary" onClick={() => setIsShiftCloseModalOpen(false)}>
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handlePrintZReport}>
              <Printer size={15} />
              <span>Print Z-Report</span>
            </button>
            <button className="btn btn-primary" onClick={handleConfirmClose}>
              <CheckCircle size={15} />
              <span>Close Shift & Clock Out</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Summary Metric Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opening Float</div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)', marginTop: '2px' }}>
              {formatCurrency(openingFloat)}
            </div>
          </div>
          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Shift Sales</div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)', marginTop: '2px' }}>
              {formatCurrency(totalSales)}
            </div>
          </div>
          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Cash Drawer</div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#047857', marginTop: '2px' }}>
              {formatCurrency(expectedCash)}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ padding: '14px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cash Tender Collected</span>
            <span className="font-mono">{formatCurrency(cashSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Credit/Debit Card Sales (POS)</span>
            <span className="font-mono">{formatCurrency(cardSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Digital Wallet (JazzCash / Easypaisa)</span>
            <span className="font-mono">{formatCurrency(digitalSales)}</span>
          </div>
        </div>

        {/* Actual Cash Input */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontWeight: 700 }}>
            Actual Cash Counted in Drawer (Rs.)
          </label>
          <input
            type="number"
            className="form-input font-mono"
            style={{ fontSize: '1.25rem', fontWeight: 800, padding: '10px 14px' }}
            value={actualCash}
            onChange={e => setActualCash(e.target.value)}
          />
        </div>

        {/* Variance Display */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: variance === 0 ? '#ECFDF5' : variance > 0 ? '#EFF6FF' : '#FEF2F2',
            border: `1px solid ${variance === 0 ? '#A7F3D0' : variance > 0 ? '#BFDBFE' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {variance === 0 ? (
              <ShieldCheck size={18} style={{ color: '#059669' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: variance > 0 ? '#2563EB' : '#DC2626' }} />
            )}
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: variance === 0 ? '#065F46' : variance > 0 ? '#1E40AF' : '#991B1B' }}>
              {variance === 0 ? 'Cash Drawer Balanced' : variance > 0 ? 'Cash Surplus (Over)' : 'Cash Shortage (Deficit)'}
            </span>
          </div>

          <span className="font-mono" style={{ fontWeight: 800, fontSize: '1rem', color: variance === 0 ? '#047857' : variance > 0 ? '#1D4ED8' : '#DC2626' }}>
            {variance > 0 ? `+${formatCurrency(variance)}` : formatCurrency(variance)}
          </span>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Shift Closure Notes / Remarks</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Clean handover, end of morning shift..."
            value={shiftNotes}
            onChange={e => setShiftNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
