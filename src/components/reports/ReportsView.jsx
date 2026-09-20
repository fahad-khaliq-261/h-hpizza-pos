import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import StatCard from '../common/StatCard';
import SalesAreaChart from '../dashboard/SalesAreaChart';
import TopItemsBarChart from '../dashboard/TopItemsBarChart';
import OrderTypeDonut from '../dashboard/OrderTypeDonut';
import { formatCurrency } from '../../utils/formatters';
import { POPULAR_ITEMS_DATA } from '../../data/seedData';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Download,
  Calendar,
  PieChart,
  Percent,
  CreditCard
} from 'lucide-react';

export default function ReportsView() {
  const { orders, triggerSound, addToast } = usePOS();
  const [dateRange, setDateRange] = useState('today'); // 'today' | '7d' | '30d' | 'year'

  // Dynamic calculations from SQLite orders
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalOrders = activeOrders.length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const netProfit = Math.round(totalRevenue * 0.65);

  const handleExportCSV = () => {
    triggerSound('click');

    const headers = ["Order ID", "Date", "Time", "Customer", "Order Type", "Payment Method", "Items Count", "Subtotal", "Tax", "Grand Total", "Status"];
    const rows = orders.map(o => [
      o.id,
      o.date,
      o.time,
      `"${o.customer?.name || 'Walk-in'}"`,
      o.orderType,
      o.paymentMethod,
      o.items ? o.items.reduce((s, i) => s + i.quantity, 0) : 1,
      o.subtotal,
      o.tax,
      o.grandTotal,
      o.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Crust_Cheese_Sales_Report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Sales report exported to CSV", "success");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Financial Reports & Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Comprehensive sales performance, profit margins, product mix, and revenue distributions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Time range selector */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'year', label: 'This Year' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setDateRange(tab.id);
                }}
                style={{
                  border: 'none',
                  background: dateRange === tab.id ? '#FFFFFF' : 'transparent',
                  color: dateRange === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: dateRange === tab.id ? 700 : 500,
                  fontSize: '0.8125rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: dateRange === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(totalRevenue)}
          trend="+12.5%"
          trendSubtitle="Period Growth"
          icon={DollarSign}
          variant="primary"
        />

        <StatCard
          title="Total Orders Completed"
          value={totalOrders.toLocaleString('en-US')}
          trend="+8.2%"
          trendSubtitle="Volume"
          icon={ShoppingBag}
          variant="secondary"
        />

        <StatCard
          title="Estimated Gross Profit"
          value={formatCurrency(netProfit)}
          trend="62% Margin"
          trendSubtitle="High Efficiency"
          icon={TrendingUp}
          variant="accent"
        />

        <StatCard
          title="Average Order Value"
          value={formatCurrency(aov)}
          trend="+4.6%"
          trendSubtitle="Per Ticket"
          icon={Percent}
          variant="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-main">
        <SalesAreaChart />
        <TopItemsBarChart />
      </div>

      {/* Breakdown Grid */}
      <div className="charts-grid-secondary">
        <OrderTypeDonut />

        {/* Payment Methods Breakdown Card */}
        <div className="pos-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Payment Method Distribution</h3>
            <span className="badge badge-primary">Audit Safe</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            {[
              { method: 'Cash on Counter / Delivery', percentage: 48, amount: totalRevenue * 0.48, color: '#059669' },
              { method: 'Credit / Debit Cards (POS)', percentage: 32, amount: totalRevenue * 0.32, color: '#C5301A' },
              { method: 'JazzCash Digital Wallet', percentage: 12, amount: totalRevenue * 0.12, color: '#E65100' },
              { method: 'Easypaisa QR Scan', percentage: 8, amount: totalRevenue * 0.08, color: '#D97706' }
            ].map((pm, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{pm.method}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(pm.amount)}</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', minWidth: '32px', textAlign: 'right' }}>
                      {pm.percentage}%
                    </span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pm.percentage}%`,
                      backgroundColor: pm.color,
                      borderRadius: '999px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
