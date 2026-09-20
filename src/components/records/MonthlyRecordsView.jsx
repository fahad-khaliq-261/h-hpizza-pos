import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { dbClient } from '../../db/sqliteClient';
import StatCard from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  DollarSign,
  Receipt,
  Percent,
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Printer
} from 'lucide-react';

export default function MonthlyRecordsView() {
  const { orders, triggerSound, addToast, settings } = usePOS();

  // Selected Year-Month (e.g. '2026-09')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  });

  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchMonthly() {
      setIsLoading(true);
      try {
        const summary = await dbClient.orders.getMonthlySummary(selectedMonth);
        if (isMounted) {
          setMonthlyData(summary);
        }
      } catch (err) {
        console.error('Error fetching monthly summary:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchMonthly();
    return () => { isMounted = false; };
  }, [selectedMonth, orders]);

  const m = monthlyData || {
    yearMonth: selectedMonth,
    totalRevenue: 0,
    totalNet: 0,
    totalTax: 0,
    totalDiscount: 0,
    totalOrders: 0,
    cancelledCount: 0,
    cashSales: 0,
    cardSales: 0,
    digitalSales: 0,
    aov: 0,
    dailyTable: []
  };

  const handleExportCSV = () => {
    triggerSound('click');
    if (!m.dailyTable || m.dailyTable.length === 0) {
      addToast('No daily records to export for this month', 'warning');
      return;
    }

    const headers = [
      'Date',
      'Bills Count',
      'Net Sales',
      'Tax Collected',
      'Discounts',
      'Cash Tendered',
      'Card Tendered',
      'Digital Tendered',
      'Gross Revenue'
    ];

    const rows = m.dailyTable.map(d => [
      d.date,
      d.ordersCount,
      d.net,
      d.tax,
      d.discount,
      d.cash,
      d.card,
      d.digital,
      d.revenue
    ]);

    // Summary row
    rows.push([
      'TOTAL',
      m.totalOrders,
      m.totalNet,
      m.totalTax,
      m.totalDiscount,
      m.cashSales,
      m.cardSales,
      m.digitalSales,
      m.totalRevenue
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Monthly_Sales_Register_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Monthly statement for ${selectedMonth} exported to CSV`, 'success');
  };

  const handlePrintStatement = () => {
    triggerSound('print');
    window.print();
  };

  const maxDayRev = Math.max(1, ...(m.dailyTable || []).map(d => d.revenue));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header & Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🗓️</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Monthly Sales & Tax Records</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Monthly revenue registers, accounting ledgers, and sales tax compliance records
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '5px 12px', borderRadius: '8px' }}>
            <Calendar size={16} color="var(--primary)" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  triggerSound('click');
                  setSelectedMonth(e.target.value);
                }
              }}
              style={{ border: 'none', outline: 'none', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}
            />
          </div>

          <button className="btn btn-secondary" onClick={handlePrintStatement}>
            <Printer size={16} />
            <span>Print Statement</span>
          </button>

          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Monthly Gross Revenue"
          value={formatCurrency(m.totalRevenue)}
          trend={`${m.totalOrders} Paid Bills`}
          trendSubtitle={`Net: ${formatCurrency(m.totalNet)}`}
          icon={DollarSign}
          variant="primary"
        />

        <StatCard
          title="Sales Tax Collected (GST)"
          value={formatCurrency(m.totalTax)}
          trend={`${settings.taxRate || 17}% Standard Rate`}
          trendSubtitle="Audited for FBR/Tax"
          icon={Percent}
          variant="secondary"
        />

        <StatCard
          title="Total Cash Settled"
          value={formatCurrency(m.cashSales)}
          trend={`${m.totalRevenue > 0 ? Math.round((m.cashSales / m.totalRevenue) * 100) : 0}% of Gross`}
          trendSubtitle={`Digital/Cards: ${formatCurrency(m.cardSales + m.digitalSales)}`}
          icon={Banknote}
          variant="accent"
        />

        <StatCard
          title="Average Ticket (AOV)"
          value={formatCurrency(m.aov)}
          trend={`${m.cancelledCount} Cancelled/Voids`}
          trendSubtitle={`Discounts: ${formatCurrency(m.totalDiscount)}`}
          icon={Receipt}
          variant="warning"
        />
      </div>

      {/* Monthly Daily Revenue Distribution Visual */}
      <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Daily Revenue Throughout Month</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distribution of sales across each active day of {selectedMonth}</p>
          </div>
          <span className="badge badge-primary">{m.dailyTable.length} Days Recorded</span>
        </div>

        {m.dailyTable.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No sales recorded in the month of {selectedMonth}.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', paddingTop: '20px', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
            {m.dailyTable.map((d) => {
              const heightPercent = maxDayRev > 0 ? (d.revenue / maxDayRev) * 100 : 0;
              const dayNum = d.date.split('-')[2];
              return (
                <div
                  key={d.date}
                  style={{
                    flex: '1 0 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                  title={`${d.date}: ${formatCurrency(d.revenue)} (${d.ordersCount} orders)`}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(4, heightPercent)}%`,
                      backgroundColor: 'var(--primary)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '6px' }}>
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Master Day-by-Day Monthly Register Table */}
      <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Master Monthly Ledger ({selectedMonth})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Complete day-by-day itemized revenue, tax, and tender ledger
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Orders</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Net Sales</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Tax (GST)</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Discounts</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Cash</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Card / Digital</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {m.dailyTable.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No recorded days for this month.
                  </td>
                </tr>
              ) : (
                m.dailyTable.map((d) => (
                  <tr key={d.date} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>{d.date}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className="badge badge-primary">{d.ordersCount}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {formatCurrency(d.net)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {formatCurrency(d.tax)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#D97706' }}>
                      {d.discount > 0 ? `- ${formatCurrency(d.discount)}` : 'Rs. 0'}
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
                  </tr>
                ))
              )}
            </tbody>
            {m.dailyTable.length > 0 && (
              <tfoot>
                <tr style={{ background: '#F8FAFC', borderTop: '2px solid #CBD5E1', fontWeight: 800, fontSize: '0.875rem' }}>
                  <td style={{ padding: '14px' }}>MONTH TOTAL</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>{m.totalOrders}</td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>{formatCurrency(m.totalNet)}</td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>{formatCurrency(m.totalTax)}</td>
                  <td style={{ padding: '14px', textAlign: 'right', color: '#D97706' }}>- {formatCurrency(m.totalDiscount)}</td>
                  <td style={{ padding: '14px', textAlign: 'right', color: '#059669' }}>{formatCurrency(m.cashSales)}</td>
                  <td style={{ padding: '14px', textAlign: 'right', color: '#C5301A' }}>{formatCurrency(m.cardSales + m.digitalSales)}</td>
                  <td style={{ padding: '14px', textAlign: 'right', color: 'var(--primary)', fontSize: '1rem' }}>{formatCurrency(m.totalRevenue)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
