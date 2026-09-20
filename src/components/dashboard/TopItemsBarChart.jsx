import React from 'react';
import { usePOS } from '../../context/POSContext';
import { formatCurrency } from '../../utils/formatters';

export default function TopItemsBarChart() {
  const { orders, menuItems } = usePOS();

  // Aggregate items count and revenue from real orders
  const itemMap = {};
  orders.forEach(order => {
    if (order.status !== 'Cancelled' && order.items) {
      order.items.forEach(item => {
        const name = item.name || 'Custom Item';
        if (!itemMap[name]) {
          itemMap[name] = { name, count: 0, revenue: 0 };
        }
        itemMap[name].count += (item.quantity || 1);
        itemMap[name].revenue += (item.totalPrice || (item.unitPrice * (item.quantity || 1)) || 0);
      });
    }
  });

  let popularItems = Object.values(itemMap).sort((a, b) => b.count - a.count);

  // Fallback to top menu items if catalog just started
  if (popularItems.length === 0) {
    popularItems = menuItems.slice(0, 5).map(m => ({
      name: m.name,
      count: 0,
      revenue: 0
    }));
  }

  const maxCount = Math.max(...popularItems.map(i => i.count), 1);

  return (
    <div className="pos-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="pos-card-header">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Top Selling Items</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Ranked by quantity ordered
          </p>
        </div>
        <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
          Real-time
        </span>
      </div>

      <div className="pos-card-body" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="top-items-list">
          {popularItems.slice(0, 5).map((item, idx) => {
            const percentage = Math.round((item.count / maxCount) * 100);

            return (
              <div key={idx} className="top-item-row">
                <div className="top-item-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: idx === 0 ? '#FEF3C7' : '#F1F5F9',
                        color: idx === 0 ? '#B45309' : '#64748B',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ color: 'var(--text-main)', fontSize: '0.8125rem' }}>
                      {item.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatCurrency(item.revenue)}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', minWidth: '28px', textAlign: 'right' }}>
                      {item.count}
                    </span>
                  </div>
                </div>

                <div className="top-item-bar-bg">
                  <div
                    className="top-item-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      background: idx === 0
                        ? 'linear-gradient(90deg, #C5301A, #E65100)'
                        : idx === 1
                        ? 'linear-gradient(90deg, #E65100, #F59E0B)'
                        : 'linear-gradient(90deg, #64748B, #94A3B8)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
