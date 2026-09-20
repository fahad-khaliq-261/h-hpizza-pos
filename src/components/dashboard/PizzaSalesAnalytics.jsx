import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function PizzaSalesAnalytics({ filteredOrders, dateFilter, setDateFilter }) {
  const { points, maxVal, yTicks } = useMemo(() => {
    if (!filteredOrders) return { points: [], maxVal: 5000, yTicks: [] };
    
    let buckets = [];
    const now = new Date();

    if (dateFilter === 'Today') {
      // Buckets by 2-hour intervals from 10am to 10pm
      const times = ['10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'];
      buckets = times.map(time => ({ time, val: 0, rawVal: 0 }));

      filteredOrders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const d = new Date(o.date + ' ' + (o.time || '12:00 PM'));
        const hour = d.getHours();
        let bucketIndex = 0;
        if (hour < 11) bucketIndex = 0;
        else if (hour < 13) bucketIndex = 1;
        else if (hour < 15) bucketIndex = 2;
        else if (hour < 17) bucketIndex = 3;
        else if (hour < 19) bucketIndex = 4;
        else if (hour < 21) bucketIndex = 5;
        else bucketIndex = 6;
        buckets[bucketIndex].rawVal += o.grandTotal || 0;
      });
    } else if (dateFilter === 'Week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      buckets = days.map(time => ({ time, val: 0, rawVal: 0 }));
      filteredOrders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const d = new Date(o.date);
        let day = d.getDay() - 1; // 0 for Mon, 6 for Sun
        if (day === -1) day = 6;
        if (day >= 0 && day <= 6) {
          buckets[day].rawVal += o.grandTotal || 0;
        }
      });
    } else if (dateFilter === 'Month') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      buckets = weeks.map(time => ({ time, val: 0, rawVal: 0 }));
      filteredOrders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const d = new Date(o.date);
        const dateNum = d.getDate();
        let week = Math.floor((dateNum - 1) / 7);
        if (week > 3) week = 3;
        buckets[week].rawVal += o.grandTotal || 0;
      });
    }

    const mVal = Math.max(...buckets.map(b => b.rawVal), 1000);
    // Determine a nice max value for the Y axis
    const roundedMax = Math.ceil(mVal / 1000) * 1000;
    
    buckets.forEach(b => {
      b.val = b.rawVal / 1000; // In thousands for coordinate math
      b.dollar = formatCurrency(b.rawVal);
    });

    const maxValInK = roundedMax / 1000;

    const yT = [
      { label: `Rs. ${maxValInK}k`, ratio: 1 },
      { label: `Rs. ${maxValInK * 0.8}k`, ratio: 0.8 },
      { label: `Rs. ${maxValInK * 0.6}k`, ratio: 0.6 },
      { label: `Rs. ${maxValInK * 0.4}k`, ratio: 0.4 },
      { label: `Rs. ${maxValInK * 0.2}k`, ratio: 0.2 },
      { label: 'Rs. 0', ratio: 0 }
    ];

    return { points: buckets, maxVal: maxValInK, yTicks: yT };
  }, [filteredOrders, dateFilter]);

  // SVG Chart Geometry
  const width = 640;
  const height = 210;
  const padding = { top: 20, right: 25, bottom: 30, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Calculate coordinates
  const svgPoints = points.map((d, idx) => {
    const x = padding.left + (idx / (points.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.val / maxVal) * innerHeight;
    return { ...d, x, y };
  });

  // Smooth Bezier Curve Path
  let linePath = '';
  let areaPath = '';

  if (svgPoints.length > 0) {
    linePath = `M ${svgPoints[0].x},${svgPoints[0].y}`;
    for (let i = 0; i < svgPoints.length - 1; i++) {
      const p0 = svgPoints[i];
      const p1 = svgPoints[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      linePath += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    areaPath = `${linePath} L ${svgPoints[svgPoints.length - 1].x},${padding.top + innerHeight} L ${svgPoints[0].x},${padding.top + innerHeight} Z`;
  }

  return (
    <div className="analytics-chart-card">
      {/* Header */}
      <div className="analytics-header-row">
        <div>
          <h3 className="analytics-title">Pizza Sales Analytics</h3>
          <p className="analytics-subtitle">Revenue breakdown</p>
        </div>

        {/* Filter Tabs */}
        <div className="analytics-time-tabs">
          {['Today', 'Week', 'Month'].map((tab) => (
            <button
              key={tab}
              className={`time-tab-btn ${dateFilter === tab ? 'active' : ''}`}
              onClick={() => setDateFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line / Area Chart */}
      <div style={{ width: '100%', flex: 1, minHeight: '200px', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C5172E" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#C5172E" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#C5172E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-Axis labels */}
          {yTicks.map((tick, i) => {
            const y = padding.top + innerHeight - tick.ratio * innerHeight;
            return (
              <g key={i}>
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#9CA3AF"
                  fontWeight="500"
                  fontFamily="var(--font-sans)"
                >
                  {tick.label}
                </text>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Area Fill & Line Stroke */}
          {svgPoints.length > 0 && (
            <>
              <path d={areaPath} fill="url(#analyticsAreaGrad)" />
              <path d={linePath} fill="none" stroke="#C5172E" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {/* Circular Dots on Data Points */}
          {svgPoints.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#C5172E"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
            </g>
          ))}

          {/* X-Axis Labels */}
          {svgPoints.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#6B7280"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {p.time}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
