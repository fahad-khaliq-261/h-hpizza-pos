import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { dbClient } from '../../db/sqliteClient';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  DollarSign,
  Receipt,
  Percent,
  Download,
  Printer,
  Search,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DailyRecordsView() {
  const { orders, triggerSound, addToast, setReceiptOrder, setIsReceiptModalOpen, openZReport } = usePOS();

  // Selected date defaults to today (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  const [dailyData, setDailyData] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load summary for selectedDate
  useEffect(() => {
    let isMounted = true;
    async function fetchSummary() {
      setIsLoading(true);
      try {
        const summary = await dbClient.orders.getDailySummary(selectedDate);
        if (isMounted) {
          setDailyData(summary);
        }
      } catch (err) {
        console.error('Error loading daily summary:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchSummary();
    return () => { isMounted = false; };
  }, [selectedDate, orders]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y.toISOString().split('T')[0];
  }, []);

  const d = dailyData || {
    totalOrders: 0,
    activeOrders: 0,
    cancelledOrders: 0,
    grossRevenue: 0,
    netRevenue: 0,
    totalTax: 0,
    totalDiscount: 0,
    cashSales: 0,
    cardSales: 0,
    digitalSales: 0,
    dineInSales: 0,
    takeawaySales: 0,
    deliverySales: 0,
    averageOrderValue: 0,
    hourlyBreakdown: [],
    ordersList: []
  };

  const filteredOrders = useMemo(() => {
    if (!d.ordersList) return [];
    if (!searchFilter.trim()) return d.ordersList;
    const q = searchFilter.toLowerCase();
    return d.ordersList.filter(o => {
      const num = String(o.order_number || o.id || '').toLowerCase();
      const cust = String(o.customer_name || '').toLowerCase();
      const phone = String(o.customer_phone || '');
      return num.includes(q) || cust.includes(q) || phone.includes(q);
    });
  }, [d.ordersList, searchFilter]);

  const handleExportCSV = () => {
    triggerSound('click');
    if (!d.ordersList || d.ordersList.length === 0) {
      addToast('No orders to export for this date', 'warning');
      return;
    }

    const headers = [
      'Order ID',
      'Created At',
      'Customer',
      'Phone',
      'Order Type',
      'Payment Method',
      'Subtotal',
      'Tax',
      'Discount',
      'Grand Total',
      'Status'
    ];

    const rows = d.ordersList.map(o => [
      o.order_number || o.id,
      `"${o.created_at || ''}"`,
      `"${o.customer_name || 'Walk-in'}"`,
      `"${o.customer_phone || ''}"`,
      o.order_type,
      o.payment_method,
      o.subtotal,
      o.tax,
      o.discount,
      o.grand_total,
      o.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Daily_Sales_Record_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Daily record for ${selectedDate} exported to CSV`, 'success');
  };

  const handleViewReceipt = (o) => {
    triggerSound('click');
    const fullOrder = orders.find(ord => String(ord.id) === String(o.id) || String(ord.orderNumber) === String(o.order_number));
    if (fullOrder) {
      setReceiptOrder(fullOrder);
      setIsReceiptModalOpen(true);
    } else {
      // Create minimal order object for preview
      setReceiptOrder({
        id: o.id,
        orderNumber: o.order_number || o.id,
        customer: { name: o.customer_name, phone: o.customer_phone },
        orderType: o.order_type,
        grandTotal: o.grand_total,
        subtotal: o.subtotal,
        tax: o.tax,
        discount: o.discount,
        paymentMethod: o.payment_method,
        status: o.status,
        date: o.created_at ? o.created_at.split('T')[0] : selectedDate,
        time: o.created_at ? o.created_at.split('T')[1]?.split('.')[0] : '',
        items: []
      });
      setIsReceiptModalOpen(true);
    }
  };

  // Filter operational hourly range (10 AM to 11 PM) for clean display
  const operationalHours = (d.hourlyBreakdown || []).filter(h => h.hour >= 10 && h.hour <= 23);
  const maxHourlyRevenue = Math.max(1, ...operationalHours.map(h => h.revenue));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header & Date Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📅</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Daily Sales Records & Audit</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Daily revenue registers, tender breakdowns, hourly volume, and cash closing reconciliations
          </p>
        </div>

        {/* Date Controls & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => { triggerSound('click'); setSelectedDate(todayStr); }}
              style={{
                border: 'none',
                background: selectedDate === todayStr ? '#FFFFFF' : 'transparent',
                color: selectedDate === todayStr ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: selectedDate === todayStr ? 700 : 500,
                fontSize: '0.8125rem',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: selectedDate === todayStr ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { triggerSound('click'); setSelectedDate(yesterdayStr); }}
              style={{
                border: 'none',
                background: selectedDate === yesterdayStr ? '#FFFFFF' : 'transparent',
                color: selectedDate === yesterdayStr ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: selectedDate === yesterdayStr ? 700 : 500,
                fontSize: '0.8125rem',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: selectedDate === yesterdayStr ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Yesterday
            </button>
          </div>

          {/* Date Picker Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: '8px' }}>
            <Calendar size={16} color="var(--primary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  triggerSound('click');
                  setSelectedDate(e.target.value);
                }
              }}
              style={{ border: 'none', outline: 'none', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
            />
          </div>

          {/* Print Z-Report */}
          <button
            className="btn btn-secondary"
            onClick={() => openZReport(d)}
            title="Print Daily Z-Report / Cash Close Slip"
          >
            <Printer size={16} />
            <span>Print Z-Report</span>
          </button>

          {/* Export CSV */}
          <button
            className="btn btn-secondary"
            onClick={handleExportCSV}
            title="Export Day's Orders to CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Daily Gross Sales"
          value={formatCurrency(d.grossRevenue)}
          trend={`${d.activeOrders} Paid Bills`}
          trendSubtitle={`Net: ${formatCurrency(d.netRevenue)}`}
          icon={DollarSign}
          variant="primary"
        />

        <StatCard
          title="Cash Collected (Till)"
          value={formatCurrency(d.cashSales)}
          trend={`${d.grossRevenue > 0 ? Math.round((d.cashSales / d.grossRevenue) * 100) : 0}% of Total`}
          trendSubtitle="Direct Drawer Cash"
          icon={Banknote}
          variant="secondary"
        />

        <StatCard
          title="Card & Digital Payments"
          value={formatCurrency(d.cardSales + d.digitalSales)}
          trend={`${d.grossRevenue > 0 ? Math.round(((d.cardSales + d.digitalSales) / d.grossRevenue) * 100) : 0}% of Total`}
          trendSubtitle={`Card: ${formatCurrency(d.cardSales)}`}
          icon={CreditCard}
          variant="accent"
        />

        <StatCard
          title="Tax Collected (GST)"
          value={formatCurrency(d.totalTax)}
          trend={`Avg Ticket: ${formatCurrency(d.averageOrderValue)}`}
          trendSubtitle={`Discounts: ${formatCurrency(d.totalDiscount)}`}
          icon={Percent}
          variant="warning"
        />
      </div>

      {/* Second Row: Payment Method Breakdown & Hourly Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' }}>
        {/* Payment & Channel Breakdown Card */}
        <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Payment Tender Split</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distribution of day's settlement methods</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Cash */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Banknote size={15} color="#059669" /> Cash in Drawer
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(d.cashSales)}</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                    {d.grossRevenue > 0 ? Math.round((d.cashSales / d.grossRevenue) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${d.grossRevenue > 0 ? (d.cashSales / d.grossRevenue) * 100 : 0}%`,
                    backgroundColor: '#059669',
                    borderRadius: '999px'
                  }}
                />
              </div>
            </div>

            {/* Card */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} color="#C5301A" /> Credit / Debit Card (POS)
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(d.cardSales)}</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                    {d.grossRevenue > 0 ? Math.round((d.cardSales / d.grossRevenue) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${d.grossRevenue > 0 ? (d.cardSales / d.grossRevenue) * 100 : 0}%`,
                    backgroundColor: '#C5301A',
                    borderRadius: '999px'
                  }}
                />
              </div>
            </div>

            {/* Digital Wallets */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={15} color="#D97706" /> Digital (JazzCash / EasyPaisa)
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(d.digitalSales)}</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                    {d.grossRevenue > 0 ? Math.round((d.digitalSales / d.grossRevenue) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${d.grossRevenue > 0 ? (d.digitalSales / d.grossRevenue) * 100 : 0}%`,
                    backgroundColor: '#D97706',
                    borderRadius: '999px'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Cancelled / Voided Bills:</span>
            <span style={{ fontWeight: 700, color: d.cancelledOrders > 0 ? '#DC2626' : '#059669' }}>
              {d.cancelledOrders} {d.cancelledOrders === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
        </div>

        {/* Hourly Volume & Sales Curve */}
        <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Hourly Revenue Timeline</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sales volume across restaurant operating hours</p>
            </div>
            <span className="badge badge-primary">Operating Hours</span>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', paddingTop: '20px', borderBottom: '1px solid #E2E8F0' }}>
            {operationalHours.map((h) => {
              const heightPercent = maxHourlyRevenue > 0 ? (h.revenue / maxHourlyRevenue) * 100 : 0;
              return (
                <div
                  key={h.hour}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                  title={`${h.label}: ${formatCurrency(h.revenue)} (${h.count} orders)`}
                >
                  <span style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>
                    {h.count > 0 ? h.count : ''}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(4, heightPercent)}%`,
                      backgroundColor: h.revenue > 0 ? 'var(--primary)' : '#E2E8F0',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {h.hour % 12 === 0 ? 12 : h.hour % 12}{h.hour < 12 ? 'a' : 'p'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day's Orders Register Table */}
      <div className="pos-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Day's Bill Register ({filteredOrders.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Itemized billing history for {selectedDate}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', minWidth: '260px' }}>
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search by Bill #, customer, phone..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Bill #</th>
                <th style={{ padding: '12px 14px' }}>Time</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Type</th>
                <th style={{ padding: '12px 14px' }}>Payment</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧾</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No bills recorded for this date</div>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Select another date above or create a new order in POS.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isVoid = o.status === 'Cancelled';
                  const time = o.created_at ? o.created_at.split('T')[1]?.split('.')[0] : '';
                  return (
                    <tr
                      key={o.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        fontSize: '0.875rem',
                        opacity: isVoid ? 0.6 : 1
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--primary)' }}>
                        #{o.order_number || o.id}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {time}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{o.customer_name || 'Walk-in'}</div>
                        {o.customer_phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_phone}</div>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {o.order_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{o.payment_method || 'Cash'}</span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: isVoid ? '#94A3B8' : 'var(--text-main)' }}>
                        {formatCurrency(o.grand_total)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <StatusBadge status={o.status} />
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleViewReceipt(o)}
                          title="View / Print Receipt"
                        >
                          <Eye size={13} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
