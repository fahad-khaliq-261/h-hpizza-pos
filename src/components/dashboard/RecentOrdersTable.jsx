import React from 'react';
import { usePOS } from '../../context/POSContext';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { Eye, Printer, ArrowRight } from 'lucide-react';

export default function RecentOrdersTable() {
  const { orders, setActiveTab, setReceiptOrder, setIsReceiptModalOpen, triggerSound } = usePOS();

  const recentList = orders.slice(0, 6);

  const handleViewReceipt = (order) => {
    triggerSound('click');
    setReceiptOrder(order);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="pos-card">
      <div className="pos-card-header">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Orders</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time feed of latest customer checkouts
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            triggerSound('click');
            setActiveTab('orders');
          }}
        >
          <span>View All Orders</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Order Type</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentList.map((order) => {
              const itemsSummary = order.items
                ? `${order.items.reduce((sum, i) => sum + i.quantity, 0)} Items`
                : '1 Item';

              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                    #{order.id}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {order.customer?.name || 'Walk-in Customer'}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {itemsSummary}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {order.orderType}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatCurrency(order.grandTotal)}
                  </td>
                  <td>
                    <select
                      className="form-select font-semibold"
                      value={order.status}
                      onChange={(e) => {
                        const newSt = e.target.value;
                        triggerSound('click');
                        updateOrderStatus(order.id, newSt);
                      }}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        borderRadius: '999px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        cursor: 'pointer',
                        backgroundColor:
                          order.status === 'Completed' ? '#ECFDF5' :
                          order.status === 'Ready' ? '#EFF6FF' :
                          order.status === 'Preparing' ? '#FFFBEB' : '#FEF2F2',
                        color:
                          order.status === 'Completed' ? '#047857' :
                          order.status === 'Ready' ? '#1D4ED8' :
                          order.status === 'Preparing' ? '#B45309' : '#DC2626',
                        borderColor:
                          order.status === 'Completed' ? '#A7F3D0' :
                          order.status === 'Ready' ? '#BFDBFE' :
                          order.status === 'Preparing' ? '#FDE68A' : '#FECACA'
                      }}
                    >
                      <option value="Preparing">🟡 Preparing</option>
                      <option value="Ready">🔵 Ready</option>
                      <option value="Completed">🟢 Completed</option>
                      <option value="Cancelled">🔴 Cancelled</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {order.time}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-icon btn-secondary"
                        style={{ padding: '5px' }}
                        onClick={() => handleViewReceipt(order)}
                        title="Print / View Receipt"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
