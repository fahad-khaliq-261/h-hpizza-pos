import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Printer,
  RotateCcw,
  Filter,
  ArrowUpDown,
  ChefHat,
  Bike
} from 'lucide-react';

export default function OrdersView() {
  const {
    orders,
    updateOrderStatus,
    refundOrder,
    setReceiptOrder,
    setIsReceiptModalOpen,
    triggerSound,
    addToast
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'Dine In' | 'Takeaway' | 'Delivery'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState(null);

  // Statistics calculation
  const totalCount = orders.length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount = orders.filter(o => o.status === 'Ready').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        searchQuery === '' ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.customer?.phone && o.customer.phone.includes(searchQuery));

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchType = typeFilter === 'all' || o.orderType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [orders, searchQuery, statusFilter, typeFilter]);

  const handlePrint = (order) => {
    triggerSound('click');
    setReceiptOrder(order);
    setIsReceiptModalOpen(true);
  };

  const handleAdvanceStatus = (order) => {
    triggerSound('click');
    if (order.status === 'Preparing') {
      updateOrderStatus(order.id, 'Ready');
    } else if (order.status === 'Ready') {
      updateOrderStatus(order.id, 'Completed');
    }
  };

  const handleOpenRefund = (order) => {
    triggerSound('click');
    setOrderToRefund(order);
    setRefundReason('Customer cancellation');
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = () => {
    if (!orderToRefund) return;
    refundOrder(orderToRefund.id, refundReason);
    setIsRefundModalOpen(false);
    setOrderToRefund(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Orders Management</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Monitor real-time kitchen workflow, order statuses, and reprint receipts
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <StatCard
          title="Today's Orders"
          value={totalCount.toString()}
          trend="+8.2%"
          trendSubtitle="vs yesterday"
          icon={Receipt}
          variant="primary"
        />
        <StatCard
          title="In Kitchen (Preparing)"
          value={preparingCount.toString()}
          trend="Live Cooking"
          trendSubtitle="Priority"
          icon={ChefHat}
          variant="warning"
        />
        <StatCard
          title="Ready for Pickup / Delivery"
          value={readyCount.toString()}
          trend="Ready to Serve"
          trendSubtitle="Counter Alert"
          icon={CheckCircle}
          variant="accent"
        />
        <StatCard
          title="Cancelled / Refunded"
          value={cancelledCount.toString()}
          trend="Low rate (<1%)"
          trendSubtitle="Audited"
          icon={XCircle}
          variant="secondary"
        />
      </div>

      {/* Orders Table Card with Filters */}
      <div className="pos-card">
        <div className="pos-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px', overflowX: 'auto' }}>
            {[
              { id: 'all', label: 'All Orders', count: totalCount },
              { id: 'Preparing', label: 'Preparing', count: preparingCount },
              { id: 'Ready', label: 'Ready', count: readyCount },
              { id: 'Completed', label: 'Completed', count: completedCount },
              { id: 'Cancelled', label: 'Cancelled', count: cancelledCount }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setStatusFilter(tab.id);
                }}
                style={{
                  border: 'none',
                  background: statusFilter === tab.id ? '#FFFFFF' : 'transparent',
                  color: statusFilter === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  fontSize: '0.8125rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: statusFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: statusFilter === tab.id ? 'var(--primary-light)' : '#E2E8F0',
                    color: statusFilter === tab.id ? 'var(--primary)' : '#64748B'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Filters: Type & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Order Types</option>
              <option value="Dine In">Dine In</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Delivery">Delivery</option>
            </select>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 10px 6px 32px', fontSize: '0.8125rem' }}
                placeholder="Search order #, customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No orders matching selected criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const itemsCount = order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 1;

                  return (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        #{order.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {order.customer?.name || 'Walk-in Customer'}
                        </div>
                        {order.customer?.phone && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {order.customer.phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                          {order.orderType}
                          {order.tableNo ? ` (${order.tableNo})` : ''}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {formatCurrency(order.grandTotal)}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {order.paymentMethod}
                        </span>
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
                            padding: '4px 8px',
                            fontSize: '0.75rem',
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
                        <div>{order.time}</div>
                        <div style={{ fontSize: '0.6875rem' }}>{order.date}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Next Status Quick Action */}
                          {order.status === 'Preparing' && (
                            <button
                              className="btn btn-sm"
                              style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px' }}
                              onClick={() => {
                                triggerSound('click');
                                updateOrderStatus(order.id, 'Ready');
                              }}
                              title="Advance to Ready"
                            >
                              Ready
                            </button>
                          )}
                          {order.status === 'Ready' && (
                            <button
                              className="btn btn-sm"
                              style={{ background: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px' }}
                              onClick={() => {
                                triggerSound('click');
                                updateOrderStatus(order.id, 'Completed');
                              }}
                              title="Mark as Completed"
                            >
                              Complete
                            </button>
                          )}
                          {order.status === 'Completed' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '0.6875rem', padding: '3px 6px' }}
                              onClick={() => {
                                triggerSound('click');
                                updateOrderStatus(order.id, 'Ready');
                              }}
                              title="Revert back to Ready"
                            >
                              Reopen
                            </button>
                          )}

                          {/* View details */}
                          <button
                            className="btn-icon btn-secondary"
                            style={{ padding: '5px' }}
                            onClick={() => {
                              triggerSound('click');
                              setSelectedOrderDetails(order);
                            }}
                            title="View Order Details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Print receipt */}
                          <button
                            className="btn-icon btn-secondary"
                            style={{ padding: '5px' }}
                            onClick={() => handlePrint(order)}
                            title="Print Thermal Receipt"
                          >
                            <Printer size={14} />
                          </button>

                          {/* Refund / Cancel button */}
                          {order.status !== 'Cancelled' && (
                            <button
                              className="btn-icon btn-ghost"
                              style={{ padding: '5px', color: '#EF4444' }}
                              onClick={() => handleOpenRefund(order)}
                              title="Refund / Cancel Order"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <Modal
          isOpen={!!selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          title={`Order Details: #${selectedOrderDetails.id}`}
          subtitle={`${selectedOrderDetails.date} at ${selectedOrderDetails.time} • Placed by ${selectedOrderDetails.cashier}`}
          maxWidth="560px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedOrderDetails(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handlePrint(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
              >
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Customer & Status Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{selectedOrderDetails.customer?.name}</div>
                {selectedOrderDetails.customer?.phone && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedOrderDetails.customer.phone}</div>
                )}
                {selectedOrderDetails.customer?.address && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    📍 {selectedOrderDetails.customer.address}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Change Order Status</div>
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {['Preparing', 'Ready', 'Completed', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        triggerSound('click');
                        updateOrderStatus(selectedOrderDetails.id, st);
                        setSelectedOrderDetails(prev => ({ ...prev, status: st }));
                      }}
                      className="btn btn-sm"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        borderRadius: '999px',
                        background: selectedOrderDetails.status === st ? 'var(--primary)' : '#F1F5F9',
                        color: selectedOrderDetails.status === st ? '#FFFFFF' : 'var(--text-secondary)',
                        borderColor: selectedOrderDetails.status === st ? 'var(--primary)' : '#CBD5E1'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-secondary)' }}>
                  Channel: {selectedOrderDetails.orderType}
                </div>
              </div>
            </div>

            {/* Items list */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '8px' }}>Ordered Items</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedOrderDetails.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <span style={{ fontWeight: 700, marginRight: '6px' }}>{item.quantity}x</span>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '2px' }}>
                          {item.modifiers.join(', ')}
                        </div>
                      )}
                    </div>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ padding: '12px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(selectedOrderDetails.subtotal)}</span>
              </div>
              {selectedOrderDetails.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                  <span>Discount</span>
                  <span className="font-mono">-{formatCurrency(selectedOrderDetails.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sales Tax (17%)</span>
                <span className="font-mono">{formatCurrency(selectedOrderDetails.tax)}</span>
              </div>
              {selectedOrderDetails.deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges</span>
                  <span className="font-mono">{formatCurrency(selectedOrderDetails.deliveryFee)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', borderTop: '1px dashed #CBD5E1', paddingTop: '6px', marginTop: '4px' }}>
                <span>Grand Total</span>
                <span className="font-mono" style={{ color: 'var(--primary)' }}>
                  {formatCurrency(selectedOrderDetails.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title={`Confirm Refund for Order #${orderToRefund?.id}`}
          subtitle="This will refund the amount and mark the order as Cancelled"
          maxWidth="440px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsRefundModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmRefund}>
                Confirm Refund ({formatCurrency(orderToRefund?.grandTotal)})
              </button>
            </div>
          }
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reason for Refund / Cancellation</label>
            <select
              className="form-select"
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
            >
              <option value="Customer cancellation">Customer cancellation</option>
              <option value="Wrong item prepared">Wrong item prepared</option>
              <option value="Long kitchen delay">Long kitchen delay</option>
              <option value="Payment duplicate charge">Payment duplicate charge</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
