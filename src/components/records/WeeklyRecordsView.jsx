import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { dbClient } from '../../db/sqliteClient';
import StatCard from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Download,
  Award,
  BarChart2,
  PieChart,
  ArrowUpRight
} from 'lucide-react';

export default function WeeklyRecordsView() {
  const { orders, triggerSound, addToast } = usePOS();

  // Helper to get Monday of current week
  const getWeekRange = (offsetWeeks = 0) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (offsetWeeks * 7); // adjust when day is sunday
    const monday = new Date(now.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, -2 = 2 weeks ago
  const currentRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  const [weeklyData, setWeeklyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchWeekly() {
      setIsLoading(true);
      try {
        const summary = await dbClient.orders.getWeeklySummary(currentRange.start, currentRange.end);
        if (isMounted) {
          setWeeklyData(summary);
        }
      } catch (err) {
        console.error('Error fetching weekly summary:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchWeekly();
    return () => { isMounted = false; };
  }, [currentRange, orders]);

  const w = weeklyData || {
    startDate: currentRange.start,
    endDate: currentRange.end,
    totalRevenue: 0,
    totalOrders: 0,
    totalCash: 0,
    totalCard: 0,
    totalDigital: 0,
    averageDailyRevenue: 0,
    bestDay: null,
    dailyBreakdown: [],
    topItems: []
  };

  // Build standard 7-day array Mon-Sun
  const fullWeekDays = useMemo(() => {
    const days = [];
    const curr = new Date(currentRange.start + 'T00:00:00');
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const dStr = curr.toISOString().split('T')[0];
      const match = (w.dailyBreakdown || []).find(b => b.date === dStr);
      days.push({
        date: dStr,
        dayName: dayNames[i],
        revenue: match ? match.revenue : 0,
        ordersCount: match ? match.ordersCount : 0,
        cash: match ? match.cash : 0,
        card: match ? match.card : 0,
        digital: match ? match.digital : 0
      });
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  }, [currentRange, w.dailyBreakdown]);

  const maxDayRevenue = Math.max(1, ...fullWeekDays.map(d => d.revenue));

  const handleExportCSV = () => {
    triggerSound('click');
    const headers = ['Date', 'Day', 'Bills Count', 'Cash Sales', 'Card Sales', 'Digital Sales', 'Total Revenue'];
    const rows = fullWeekDays.map(d => [
      d.date,
      d.dayName,
      d.ordersCount,
      d.cash,
      d.card,
      d.digital,
      d.revenue
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Weekly_Sales_Report_${currentRange.start}_to_${currentRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Weekly sales statement exported to CSV', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Weekly Sales Records</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Week-over-week performance, daily comparisons, peak hours, and product demand
          </p>
        </div>

        {/* Week Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            {[
              { offset: 0, label: 'Current Week' },
              { offset: -1, label: 'Last Week' },
              { offset: -2, label: '2 Weeks Ago' }
            ].map(tab => (
              <button
                key={tab.offset}
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setWeekOffset(tab.offset);
                }}
                style={{
                  border: 'none',
                  background: weekOffset === tab.offset ? '#FFFFFF' : 'transparent',
                  color: weekOffset === tab.offset ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: weekOffset === tab.offset ? 700 : 500,
                  fontSize: '0.8125rem',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: weekOffset === tab.offset ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', background: '#FFFFFF', padding: '7px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            {currentRange.start} ~ {currentRange.end}
          </span>

          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Week Gross Sales"
          value={formatCurrency(w.totalRevenue)}
          trend={`${w.totalOrders} Orders`}
          trendSubtitle="Settled Revenue"
          icon={DollarSign}
          variant="primary"
        />

        <StatCard
          title="Average Daily Sales"
          value={formatCurrency(w.averageDailyRevenue)}
          trend="Per Day"
          trendSubtitle="7-Day Rolling Avg"
          icon={TrendingUp}
          variant="secondary"
        />

        <StatCard
          title="Peak Revenue Day"
          value={w.bestDay ? w.bestDay.dayName : 'None'}
          trend={w.bestDay ? formatCurrency(w.bestDay.revenue) : 'Rs. 0'}
          trendSubtitle={w.bestDay ? `${w.bestDay.ordersCount} bills issued` : 'No data'}
          icon={Award}
          variant="accent"
        />

        <StatCard
          title="Total Cash Collected"
          value={formatCurrency(w.totalCash)}
          trend={`${w.totalRevenue > 0 ? Math.round((w.totalCash / w.totalRevenue) * 100) : 0}% of Total`}
          trendSubtitle={`Non-Cash: ${formatCurrency(w.totalCard + w.totalDigital)}`}
          icon={ShoppingBag}
          variant="warning"
        />
      </div>

      {/* 7-Day Day-by-Day Bar Chart & Top Items */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        {/* Day by Day Bar Chart */}
        <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Day-by-Day Revenue (Mon - Sun)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comparison of daily sales performance across the week</p>
            </div>
            <span className="badge badge-primary">7-Day Period</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '220px', paddingTop: '24px', borderBottom: '1px solid #E2E8F0' }}>
            {fullWeekDays.map((d) => {
              const heightPercent = maxDayRevenue > 0 ? (d.revenue / maxDayRevenue) * 100 : 0;
              const isBest = w.bestDay && w.bestDay.date === d.date && d.revenue > 0;

              return (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                  title={`${d.dayName} (${d.date}): ${formatCurrency(d.revenue)} (${d.ordersCount} orders)`}
                >
                  <span style={{ fontSize: '0.6875rem', color: isBest ? 'var(--primary)' : '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : ''}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(4, heightPercent)}%`,
                      backgroundColor: isBest ? 'var(--primary)' : d.revenue > 0 ? '#CBD5E1' : '#F1F5F9',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isBest ? 'var(--primary)' : 'var(--text-secondary)', marginTop: '8px' }}>
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Pizzas / Items of the Week */}
        <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Week's Top Sellers</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest volume items ordered this week</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!w.topItems || w.topItems.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No items sold yet in this week range.
              </div>
            ) : (
              w.topItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #F1F5F9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--primary)' : '#E2E8F0',
                        color: idx === 0 ? '#FFFFFF' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>{item.qty} sold</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatCurrency(item.revenue)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Week Day-by-Day Comparison Ledger Table */}
      <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Weekly Breakdown Ledger
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Day</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Bills Count</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Cash Sales</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Card / Digital</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Gross Revenue</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Avg Ticket</th>
              </tr>
            </thead>
            <tbody>
              {fullWeekDays.map((d) => {
                const aov = d.ordersCount > 0 ? Math.round(d.revenue / d.ordersCount) : 0;
                return (
                  <tr key={d.date} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>{d.date}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)' }}>{d.dayName}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className="badge badge-primary">{d.ordersCount}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                      {formatCurrency(d.cash)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#C5301A', fontWeight: 600 }}>
                      {formatCurrency(d.card + d.digital)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatCurrency(d.revenue)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {formatCurrency(aov)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
