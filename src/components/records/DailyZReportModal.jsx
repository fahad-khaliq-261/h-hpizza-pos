import React, { useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { Printer } from 'lucide-react';

export default function DailyZReportModal() {
  const {
    isZReportModalOpen,
    setIsZReportModalOpen,
    zReportData,
    settings,
    triggerSound,
    addToast
  } = usePOS();

  const { currentUser, activeShift } = useAuth();
  const reportRef = useRef(null);

  if (!isZReportModalOpen || !zReportData) return null;

  const handlePrint = () => {
    triggerSound('print');
    if (window.electronAPI?.printReceipt) {
      window.electronAPI.printReceipt();
    } else {
      window.print();
    }
    addToast('Daily Z-Report dispatched to printer', 'success');
  };

  const d = zReportData;
  const openingFloat = activeShift?.openingFloat || 5000;
  const expectedCashInDrawer = openingFloat + (d.cashSales || 0);

  return (
    <Modal
      isOpen={isZReportModalOpen}
      onClose={() => setIsZReportModalOpen(false)}
      title="Daily Z-Report (Day Close Slip)"
      subtitle={`Audited Cashier Reconciliation for ${d.date}`}
      maxWidth="440px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsZReportModalOpen(false)}
          >
            Close
          </button>

          <button
            className="btn btn-primary"
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>Print Z-Report</span>
          </button>
        </div>
      }
    >
      <div className="receipt-wrapper">
        <div className="thermal-receipt" ref={reportRef} style={{ fontFamily: 'monospace' }}>
          {/* Header */}
          <div className="receipt-header">
            <h2 className="receipt-store-name">{settings.name || 'H&H Pizza Cafe'}</h2>
            <p className="receipt-branch">{settings.branch || 'Main Boulevard Phase 5, DHA'}</p>
            <p className="receipt-info">NTN: {settings.ntn || '7849201-4'}</p>
            <div style={{ margin: '10px 0', borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '6px 0' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px' }}>*** DAILY SALES Z-REPORT ***</div>
              <div style={{ fontSize: '11px', marginTop: '2px' }}>END OF DAY FINANCIAL AUDIT</div>
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="receipt-meta" style={{ fontSize: '11px', lineHeight: '1.6' }}>
            <div className="receipt-meta-row">
              <span>REPORT DATE:</span>
              <span style={{ fontWeight: 700 }}>{d.date}</span>
            </div>
            <div className="receipt-meta-row">
              <span>PRINTED AT:</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="receipt-meta-row">
              <span>REGISTER / TERMINAL:</span>
              <span>TERM-01 (MAIN)</span>
            </div>
            <div className="receipt-meta-row">
              <span>AUDITED BY:</span>
              <span style={{ fontWeight: 700 }}>{currentUser?.name || 'Store Administrator'}</span>
            </div>
          </div>

          <div className="receipt-divider-dash" style={{ margin: '8px 0' }} />

          {/* Revenue Breakdown */}
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>SALES SUMMARY</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>GROSS REVENUE:</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(d.grossRevenue || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>TOTAL DISCOUNTS:</span>
              <span>- {formatCurrency(d.totalDiscount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>NET SALES (EXCL. TAX):</span>
              <span>{formatCurrency(d.netRevenue || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>TOTAL TAX (GST {settings.taxRate || 17}%):</span>
              <span>{formatCurrency(d.totalTax || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', marginTop: '6px', borderTop: '1px solid #000', paddingTop: '4px' }}>
              <span>NET SETTLEMENT:</span>
              <span>{formatCurrency(d.grossRevenue || 0)}</span>
            </div>
          </div>

          <div className="receipt-divider-dash" style={{ margin: '8px 0' }} />

          {/* Payment Tender Distribution */}
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>PAYMENT TENDER DISTRIBUTION</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>CASH PAYMENTS:</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(d.cashSales || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>CARD (POS TERMINAL):</span>
              <span>{formatCurrency(d.cardSales || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>DIGITAL WALLETS:</span>
              <span>{formatCurrency(d.digitalSales || 0)}</span>
            </div>
          </div>

          <div className="receipt-divider-dash" style={{ margin: '8px 0' }} />

          {/* Cash Drawer Reconciliation */}
          <div style={{ fontSize: '12px', background: '#F9FAFB', padding: '6px', borderRadius: '4px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>CASH DRAWER RECONCILIATION</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '11px' }}>
              <span>OPENING CASH FLOAT:</span>
              <span>{formatCurrency(openingFloat)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '11px' }}>
              <span>(+) CASH SALES COLLECTED:</span>
              <span>{formatCurrency(d.cashSales || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '12px', borderTop: '1px dashed #000', paddingTop: '3px', marginTop: '3px' }}>
              <span>EXPECTED CASH IN TILL:</span>
              <span>{formatCurrency(expectedCashInDrawer)}</span>
            </div>
          </div>

          <div className="receipt-divider-dash" style={{ margin: '8px 0' }} />

          {/* Order Metrics */}
          <div style={{ fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div>TOTAL BILLS: <strong>{d.totalOrders || 0}</strong></div>
            <div>COMPLETED: <strong>{d.activeOrders || 0}</strong></div>
            <div>REFUNDED/VOID: <strong>{d.cancelledOrders || 0}</strong></div>
            <div>AVG TICKET: <strong>{formatCurrency(d.averageOrderValue || 0)}</strong></div>
          </div>

          {/* Signature Block */}
          <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '11px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <div style={{ borderTop: '1px solid #000', width: '45%', paddingTop: '4px' }}>CASHIER SIGN</div>
              <div style={{ borderTop: '1px solid #000', width: '45%', paddingTop: '4px' }}>MANAGER SIGN</div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '10px', color: '#6B7280' }}>
              H&H PIZZA CAFE POS • SYSTEM VERIFIED AUDIT
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
