import React, { useMemo } from 'react';

export default function OrderChannelsCard({ filteredOrders }) {
  const { totalCount, channels } = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return { totalCount: 0, channels: [] };
    }

    const typeCounts = {};
    let total = 0;

    filteredOrders.forEach(order => {
      if (order.status === 'Cancelled') return;
      const type = order.orderType || 'Walk-in';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      total++;
    });

    if (total === 0) return { totalCount: 0, channels: [] };

    const colors = {
      'Delivery': '#C5172E',
      'Dine In': '#111827',
      'Takeaway': '#E11D48',
      'Online': '#94A3B8',
      'Walk-in': '#64748B'
    };

    let cumulativePercent = 0;
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

    const resultChannels = sortedTypes.map(([label, count]) => {
      const rawPercent = (count / total) * 100;
      const percent = Math.round(rawPercent);
      const dasharray = `${percent} ${100 - percent}`;
      const dashoffset = cumulativePercent === 0 ? 0 : -cumulativePercent;
      
      cumulativePercent += percent;

      return {
        label,
        count,
        percentStr: `${percent}%`,
        color: colors[label] || '#9CA3AF',
        dasharray,
        dashoffset
      };
    });

    return { totalCount: total, channels: resultChannels };
  }, [filteredOrders]);

  return (
    <div className="order-channels-card">
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
        Order Channels
      </h3>

      <div className="channels-content-row">
        {/* SVG Donut Chart with Center Text */}
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Background ring */}
            <circle
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke="#FFF1F2"
              strokeWidth="5.5"
            />
            
            {channels.map((ch, idx) => (
              <circle
                key={idx}
                cx="21"
                cy="21"
                r="15.9155"
                fill="transparent"
                stroke={ch.color}
                strokeWidth="5.5"
                strokeDasharray={ch.dasharray}
                strokeDashoffset={ch.dashoffset}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Center Text */}
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
            <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#111827', lineHeight: 1.1 }}>
              {totalCount > 0 ? (totalCount >= 1000 ? (totalCount/1000).toFixed(1) + 'k' : totalCount) : 0}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginTop: '2px' }}>
              Total
            </span>
          </div>
        </div>

        {/* Legend on the right */}
        <div className="channels-legend-col">
          {channels.length === 0 ? (
            <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>No data</div>
          ) : (
            channels.map((item, idx) => (
              <div key={idx} className="channel-legend-item">
                <div
                  className="channel-legend-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span className="channel-legend-label">{item.label}</span>
                <span className="channel-legend-value">{item.percentStr}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
