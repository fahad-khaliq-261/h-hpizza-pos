import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatCurrency } from '../../utils/formatters';

export default function SalesAreaChart() {
  const { orders } = usePOS();
  const [filter, setFilter] = useState('7d'); // '7d' | '30d' | 'year'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const rawData = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalOrderSales = activeOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    if (filter === '7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((label, idx) => {
        // Distribute proportionally across days
        const weight = [0.12, 0.14, 0.11, 0.13, 0.18, 0.20, 0.12][idx];
        const daySales = Math.round(totalOrderSales * weight);
        return { label, sales: daySales, orders: Math.round(activeOrders.length * weight) };
      });
    } else if (filter === '30d') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      return weeks.map((label, idx) => {
        const weight = [0.22, 0.26, 0.24, 0.28][idx];
        const weekSales = Math.round(totalOrderSales * weight);
        return { label, sales: weekSales, orders: Math.round(activeOrders.length * weight) };
      });
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((label, idx) => {
        const weight = (idx + 1) / 78; // gradual growth curve
        const monthSales = Math.round(totalOrderSales * weight);
        return { label, sales: monthSales, orders: Math.round(activeOrders.length * weight) };
      });
    }
  }, [filter, orders]);

  const width = 680;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 65 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...rawData.map(d => d.sales)) * 1.15;
  const minVal = 0;

  // Generate SVG path coordinates
  const points = rawData.map((d, idx) => {
    const x = padding.left + (idx / (rawData.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.sales - minVal) / (maxVal - minVal)) * innerHeight;
    return { ...d, x, y };
  });

  // Bezier curve path generator
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  // Y-axis grid ticks
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const value = minVal + ratio * (maxVal - minVal);
    const y = padding.top + innerHeight - ratio * innerHeight;
    return { value, y };
  });

  return (
    <div className="pos-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="pos-card-header">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Sales Overview</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total revenue trends across time periods
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'year', label: 'This Year' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                border: 'none',
                background: filter === tab.id ? '#FFFFFF' : 'transparent',
                color: filter === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: filter === tab.id ? 700 : 500,
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: filter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pos-card-body" style={{ flex: 1, padding: '16px', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C5301A" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#C5301A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94A3B8"
                fontFamily="var(--font-sans)"
              >
                {tick.value >= 1000000
                  ? `Rs. ${(tick.value / 1000000).toFixed(1)}M`
                  : `Rs. ${(tick.value / 1000).toFixed(0)}k`}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaD} fill="url(#salesGradient)" />

          {/* Smooth Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#C5301A"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points & X-labels */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)}>
              {/* X label */}
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#64748B"
                fontFamily="var(--font-sans)"
              >
                {p.day}
              </text>

              {/* Point circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.day === p.day ? 6 : 4}
                fill="#FFFFFF"
                stroke="#C5301A"
                strokeWidth={hoveredPoint?.day === p.day ? 3 : 2}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}
          >
            <div>{hoveredPoint.fullDay || hoveredPoint.day}</div>
            <div style={{ color: '#F87171', fontWeight: 700 }}>
              {formatCurrency(hoveredPoint.sales)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
              {hoveredPoint.orders} Orders
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
