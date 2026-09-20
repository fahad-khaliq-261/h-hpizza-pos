import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Utensils, ShoppingBag, Bike } from 'lucide-react';

export default function OrderTypeDonut() {
  const { orders } = usePOS();

  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const dineInCount = activeOrders.filter(o => o.orderType === 'Dine In').length;
  const takeawayCount = activeOrders.filter(o => o.orderType === 'Takeaway').length;
  const deliveryCount = activeOrders.filter(o => o.orderType === 'Delivery').length;

  const totalOrders = activeOrders.length;
  const denominator = totalOrders > 0 ? totalOrders : 1;

  const channels = [
    {
      type: 'Dine In',
      count: dineInCount,
      percentage: totalOrders > 0 ? Math.round((dineInCount / denominator) * 100) : 35,
      color: '#C5301A'
    },
    {
      type: 'Takeaway',
      count: takeawayCount,
      percentage: totalOrders > 0 ? Math.round((takeawayCount / denominator) * 100) : 28,
      color: '#E65100'
    },
    {
      type: 'Delivery',
      count: deliveryCount,
      percentage: totalOrders > 0 ? Math.round((deliveryCount / denominator) * 100) : 37,
      color: '#2563EB'
    }
  ];

  // Calculate SVG stroke dashes for a 100-circumference circle
  let cumulative = 0;
  const segments = channels.map(item => {
    const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
    const strokeDashoffset = -cumulative;
    cumulative += item.percentage;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  const getIcon = (type) => {
    if (type === 'Dine In') return Utensils;
    if (type === 'Takeaway') return ShoppingBag;
    return Bike;
  };

  return (
    <div className="pos-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="pos-card-header">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Orders by Type</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Channel distribution today
          </p>
        </div>
      </div>

      <div className="pos-card-body" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div className="donut-container">
          {/* SVG Donut Chart */}
          <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {segments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="6"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Inner Center Info */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {totalOrders}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Orders
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="donut-legend">
            {channels.map((item, idx) => {
              const Icon = getIcon(item.type);
              return (
                <div key={idx} className="donut-legend-item">
                  <div
                    className="donut-legend-color"
                    style={{ backgroundColor: item.color }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
                    <Icon size={14} style={{ color: item.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.type}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                    {item.percentage}%
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    ({item.count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
