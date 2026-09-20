import React from 'react';
import { usePOS } from '../../context/POSContext';
import { ChefHat, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function KitchenDisplayView() {
  const { orders, updateOrderStatus, triggerSound, addToast } = usePOS();

  const activeKitchenOrders = orders.filter(
    o => o.status === 'Preparing' || o.status === 'Ready'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>
            Kitchen Display System (KDS)
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '2px' }}>
            Live order queue for pizzaiolos and line cooks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
            {activeKitchenOrders.length} Active Tickets
          </span>
        </div>
      </div>

      {activeKitchenOrders.length === 0 ? (
        <div className="pos-card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍕</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Kitchen Queue is Clear!</h3>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '4px' }}>
            All orders have been prepared and dispatched.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {activeKitchenOrders.map((order) => {
            const isReady = order.status === 'Ready';

            return (
              <div
                key={order.id}
                className="pos-card"
                style={{
                  borderTop: `5px solid ${isReady ? '#10B981' : 'var(--primary)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <div style={{ padding: '18px 20px' }}>
                  {/* Top Ticket Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed #E5E7EB', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        #{order.id}
                      </span>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginTop: '2px' }}>
                        {order.orderType} {order.tableNo ? `• ${order.tableNo}` : ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        className="badge"
                        style={{
                          background: isReady ? '#ECFDF5' : 'var(--primary-light)',
                          color: isReady ? '#059669' : 'var(--primary)',
                          border: `1px solid ${isReady ? '#A7F3D0' : 'var(--border-subtle)'}`
                        }}
                      >
                        {order.status}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <Clock size={12} />
                        <span>{order.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', minWidth: '24px' }}>
                          {item.quantity}x
                        </span>
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>
                            {item.name}
                          </div>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                              {item.modifiers.join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div style={{ marginTop: '14px', padding: '8px 12px', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '0.75rem', color: '#92400E', fontWeight: 600 }}>
                      📝 Note: {order.notes}
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                <div style={{ padding: '14px 20px', background: '#FAFAFC', borderTop: '1px solid #F3F4F6' }}>
                  {!isReady ? (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '10px', fontSize: '0.875rem' }}
                      onClick={() => {
                        triggerSound('success');
                        updateOrderStatus(order.id, 'Ready');
                        addToast(`Order #${order.id} marked as READY for pickup!`, 'success');
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>Mark Ready (Bake Done)</span>
                    </button>
                  ) : (
                    <button
                      className="btn"
                      style={{ width: '100%', padding: '10px', fontSize: '0.875rem', background: '#10B981', color: '#FFFFFF', borderColor: '#10B981' }}
                      onClick={() => {
                        triggerSound('success');
                        updateOrderStatus(order.id, 'Completed');
                        addToast(`Order #${order.id} completed and served!`, 'success');
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>Complete & Handover</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
