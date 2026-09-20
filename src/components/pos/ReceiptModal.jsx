import React, { useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { Printer, Download, Check, X } from 'lucide-react';

export default function ReceiptModal() {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    receiptOrder,
    settings,
    triggerSound,
    addToast
  } = usePOS();

  const receiptRef = useRef(null);

  if (!isReceiptModalOpen || !receiptOrder) return null;

  const handlePrint = () => {
    triggerSound('print');
    if (window.electronAPI?.printReceipt) {
      window.electronAPI.printReceipt();
    } else {
      window.print();
    }
    addToast('Receipt dispatched to thermal printer', 'success');
  };

  const items = receiptOrder.items || [];

  return (
    <Modal
      isOpen={isReceiptModalOpen}
      onClose={() => setIsReceiptModalOpen(false)}
      title="Thermal Receipt Preview"
      subtitle="Standard 80mm POS Thermal Receipt Layout"
      maxWidth="420px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsReceiptModalOpen(false)}
          >
            Close
          </button>

          <button
            className="btn btn-primary"
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>Print Receipt (Ctrl+P)</span>
          </button>
        </div>
      }
    >
      <div className="receipt-wrapper">
        <div className="thermal-receipt" ref={receiptRef}>
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-logo-text">H&H PIZZA CAFE</div>
            <div className="receipt-tagline">Pizza Café & Pizzeria</div>
            <div className="receipt-contact">
              <div>{settings.branch || 'Main Boulevard Phase 5, DHA'}</div>
              <div>Tel: {settings.phone || '+92 (42) 3574-8890'}</div>
              <div>NTN: {settings.ntn || '7849201-4'} (STRN Reg)</div>
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* Metadata */}
          <div className="receipt-meta">
            <div className="receipt-meta-row">
              <span>Order No:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>#{receiptOrder.id}</strong>
            </div>
            <div className="receipt-meta-row">
              <span>Date & Time:</span>
              <span>{receiptOrder.date || '2026-08-29'} {receiptOrder.time || '8:42 PM'}</span>
            </div>
            <div className="receipt-meta-row">
              <span>Order Type:</span>
              <strong>{receiptOrder.orderType} {receiptOrder.tableNo ? `(${receiptOrder.tableNo})` : ''}</strong>
            </div>
            <div className="receipt-meta-row">
              <span>Cashier:</span>
              <span>{receiptOrder.cashier || 'Ali Khan'}</span>
            </div>
            <div className="receipt-meta-row">
              <span>Customer:</span>
              <span>{receiptOrder.customer?.name || 'Walk-in'}</span>
            </div>
          </div>

          <hr className="receipt-divider-double" />

          {/* Itemized Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ width: '28px' }}>Qty</th>
                <th>Description</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td style={{ fontWeight: 700 }}>{item.quantity}x</td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right font-mono" style={{ fontWeight: 700 }}>
                      {formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <tr>
                      <td />
                      <td colSpan="3" className="receipt-item-modifiers">
                        {item.modifiers.join(' • ')}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <hr className="receipt-divider" />

          {/* Financial Breakdown */}
          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(receiptOrder.subtotal)}</span>
            </div>

            {receiptOrder.discount > 0 && (
              <div className="receipt-total-row" style={{ color: '#16A34A' }}>
                <span>Discount:</span>
                <span className="font-mono">-{formatCurrency(receiptOrder.discount)}</span>
              </div>
            )}

            <div className="receipt-total-row">
              <span>Sales Tax (GST 17%):</span>
              <span className="font-mono">{formatCurrency(receiptOrder.tax)}</span>
            </div>

            {receiptOrder.deliveryFee > 0 && (
              <div className="receipt-total-row">
                <span>Delivery Fee:</span>
                <span className="font-mono">{formatCurrency(receiptOrder.deliveryFee)}</span>
              </div>
            )}

            <div className="receipt-total-row receipt-grand-total">
              <span>GRAND TOTAL:</span>
              <span className="font-mono">{formatCurrency(receiptOrder.grandTotal)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="receipt-payment-info">
            <div className="receipt-meta-row">
              <span>Payment Mode:</span>
              <strong>{receiptOrder.paymentMethod}</strong>
            </div>
            {receiptOrder.amountReceived && (
              <div className="receipt-meta-row">
                <span>Tendered:</span>
                <span className="font-mono">{formatCurrency(receiptOrder.amountReceived)}</span>
              </div>
            )}
            {receiptOrder.changeGiven !== undefined && (
              <div className="receipt-meta-row">
                <span>Change:</span>
                <span className="font-mono">{formatCurrency(receiptOrder.changeGiven)}</span>
              </div>
            )}
          </div>

          {/* Barcode Simulation */}
          <div className="receipt-barcode">
            <div className="barcode-strip">
              {[2,1,3,1,2,4,1,2,1,3,2,1,4,2,1,3,1,2,3,1,2,4,1].map((w, i) => (
                <div key={i} className="barcode-bar" style={{ width: `${w}px` }} />
              ))}
            </div>
            <div className="barcode-text">*{receiptOrder.id}*</div>
          </div>

          {/* Footer Note */}
          <div className="receipt-footer">
            <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>
              Thank you for visiting! 🍕
            </div>
            <div>{settings.receiptFooter || 'Freshly Baked with Love! Follow us @crustandcheesecafe'}</div>
            <div style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '4px' }}>
              Wi-Fi: {settings.wifiPassword || 'EatPizza123'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
