import React, { useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard, FileText, Users, ShoppingBag, ArrowUpRight } from 'lucide-react';

export default function KpiCardsSection({ filteredOrders }) {
  // Use passed filteredOrders or default to an empty array
  const ordersToUse = filteredOrders || [];

  const { activeOrders, dynamicSales, uniqueCustomers } = useMemo(() => {
    const active = ordersToUse.filter(o => o.status !== 'Cancelled');
    const sales = active.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const uniqueCusts = new Set(active.map(o => o.customer?.phone || o.customer?.name)).size;
    return { activeOrders: active, dynamicSales: sales, uniqueCustomers: uniqueCusts };
  }, [ordersToUse]);

  const revenueValue = dynamicSales > 0 ? formatCurrency(dynamicSales) : 'Rs 0';
  const ordersCountValue = activeOrders.length;
  const customersCountValue = uniqueCustomers;
  const aovValue = dynamicSales > 0 && activeOrders.length > 0 ? formatCurrency(Math.round(dynamicSales / activeOrders.length)) : 'Rs 0';

  return (
    <div className="kpi-cards-row">
      {/* 1. TOTAL REVENUE */}
      <div className="kpi-modern-card">
        <div className="kpi-top-meta">
          <div className="kpi-orange-icon-box">
            <CreditCard size={18} />
          </div>
          <div className="kpi-trend-pill">
            <ArrowUpRight size={14} />
            <span>15%</span>
          </div>
        </div>

        <div>
          <div className="kpi-label-text">TOTAL REVENUE</div>
          <div className="kpi-value-text">{revenueValue}</div>
        </div>

        {/* Mountain Area Sparkline */}
        <div className="kpi-sparkline-area">
          <svg viewBox="0 0 160 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="kpiGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C5172E" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#C5172E" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,38 L 15,22 L 30,30 L 50,12 L 70,28 L 95,8 L 120,24 L 140,4 L 160,32 L 160,40 L 0,40 Z"
              fill="url(#kpiGrad1)"
            />
            <path
              d="M 0,38 L 15,22 L 30,30 L 50,12 L 70,28 L 95,8 L 120,24 L 140,4 L 160,32"
              fill="none"
              stroke="#C5172E"
              strokeWidth="1.8"
            />
          </svg>
        </div>
      </div>

      {/* 2. TOTAL ORDERS */}
      <div className="kpi-modern-card">
        <div className="kpi-top-meta">
          <div className="kpi-orange-icon-box">
            <FileText size={18} />
          </div>
          <div className="kpi-trend-pill">
            <ArrowUpRight size={14} />
            <span>15%</span>
          </div>
        </div>

        <div>
          <div className="kpi-label-text">TOTAL ORDERS</div>
          <div className="kpi-value-text">{ordersCountValue}</div>
        </div>

        {/* Smooth Wave Sparkline */}
        <div className="kpi-sparkline-area">
          <svg viewBox="0 0 160 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="kpiGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C5172E" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#C5172E" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,22 Q 40,24 80,10 T 160,20 L 160,40 L 0,40 Z"
              fill="url(#kpiGrad2)"
            />
            <path
              d="M 0,22 Q 40,24 80,10 T 160,20"
              fill="none"
              stroke="#C5172E"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* 3. ACTIVE CUSTOMER */}
      <div className="kpi-modern-card">
        <div className="kpi-top-meta">
          <div className="kpi-orange-icon-box">
            <Users size={18} />
          </div>
          <div className="kpi-trend-pill">
            <ArrowUpRight size={14} />
            <span>15%</span>
          </div>
        </div>

        <div>
          <div className="kpi-label-text">ACTIVE CUSTOMER</div>
          <div className="kpi-value-text">{customersCountValue}</div>
        </div>

        {/* Mini Bar Chart Sparkline */}
        <div className="kpi-sparkline-area" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 8px 4px 8px' }}>
          {[
            { h: '45%', color: '#E5E7EB' },
            { h: '65%', color: '#E5E7EB' },
            { h: '50%', color: '#E5E7EB' },
            { h: '88%', color: '#C5172E' },
            { h: '70%', color: '#E5E7EB' },
            { h: '100%', color: '#C5172E' }
          ].map((bar, idx) => (
            <div
              key={idx}
              style={{
                width: '12px',
                height: bar.h,
                backgroundColor: bar.color,
                borderRadius: '3px',
                transition: 'height 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. AVERAGE ORDER VALUE */}
      <div className="kpi-modern-card">
        <div className="kpi-top-meta">
          <div className="kpi-orange-icon-box">
            <ShoppingBag size={18} />
          </div>
          <div className="kpi-trend-pill">
            <ArrowUpRight size={14} />
            <span>8%</span>
          </div>
        </div>

        <div>
          <div className="kpi-label-text">AVERAGE ORDER VALUE</div>
          <div className="kpi-value-text">{aovValue}</div>
        </div>

        {/* Wave Sparkline */}
        <div className="kpi-sparkline-area">
          <svg viewBox="0 0 160 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="kpiGrad4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C5172E" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#C5172E" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,16 Q 35,28 75,26 T 160,18 L 160,40 L 0,40 Z"
              fill="url(#kpiGrad4)"
            />
            <path
              d="M 0,16 Q 35,28 75,26 T 160,18"
              fill="none"
              stroke="#C5172E"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
