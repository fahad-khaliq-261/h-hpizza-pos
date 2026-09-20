import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  UserPlus,
  Crown,
  HeartHandshake,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Receipt,
  Sparkles
} from 'lucide-react';

export default function CustomersView() {
  const { customers, orders, addCustomer, triggerSound, addToast } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'New',
    notes: ''
  });

  // Calculate Metrics
  const totalCustomers = customers.length;
  const newCustomersCount = customers.filter(c => c.type === 'New').length;
  const vipCount = customers.filter(c => c.type === 'VIP').length;
  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpend = totalCustomers > 0 ? Math.round(totalSpentAll / totalCustomers) : 0;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchQuery =
        searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTier = tierFilter === 'all' || c.type === tierFilter;
      return matchQuery && matchTier;
    });
  }, [customers, searchQuery, tierFilter]);

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) return;

    addCustomer(newCust);
    setIsAddModalOpen(false);
    setNewCust({
      name: '',
      phone: '',
      email: '',
      address: '',
      type: 'New',
      notes: ''
    });
  };

  // Find orders for selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      o => o.customer?.phone === selectedCustomer.phone || o.customer?.name === selectedCustomer.name
    );
  }, [orders, selectedCustomer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customer Directory & CRM</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage loyal patrons, order history, VIP tiers, and contact preferences
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            triggerSound('click');
            setIsAddModalOpen(true);
          }}
        >
          <UserPlus size={16} />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          trend="+14.2%"
          trendSubtitle="vs last month"
          icon={Users}
          variant="primary"
        />

        <StatCard
          title="New Customers"
          value={newCustomersCount.toString()}
          trend="This Month"
          trendSubtitle="Registered"
          icon={UserPlus}
          variant="secondary"
        />

        <StatCard
          title="VIP Club Members"
          value={vipCount.toString()}
          trend="High Lifetime Value"
          trendSubtitle="Top Spenders"
          icon={Crown}
          variant="accent"
        />

        <StatCard
          title="Average Customer Spend"
          value={formatCurrency(avgSpend)}
          trend="+6.8%"
          trendSubtitle="Lifetime AOV"
          icon={HeartHandshake}
          variant="warning"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="pos-card">
        <div className="pos-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Tier filter tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'all', label: 'All Customers' },
              { id: 'VIP', label: 'VIP Members' },
              { id: 'Regular', label: 'Regulars' },
              { id: 'New', label: 'New Diners' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setTierFilter(tab.id);
                }}
                style={{
                  border: 'none',
                  background: tierFilter === tab.id ? '#FFFFFF' : 'transparent',
                  color: tierFilter === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: tierFilter === tab.id ? 700 : 500,
                  fontSize: '0.8125rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: tierFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              style={{ padding: '8px 12px 8px 36px', fontSize: '0.8125rem' }}
              placeholder="Search by name, phone, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Tier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: customer.type === 'VIP' ? '#FEF3C7' : '#F1F5F9',
                          color: customer.type === 'VIP' ? '#B45309' : '#475569',
                          fontWeight: 800,
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #CBD5E1'
                        }}
                      >
                        {customer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{customer.name}</div>
                        {customer.email && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{customer.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {customer.phone}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {customer.ordersCount || 0}
                    </span>{' '}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>orders</span>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-sans)' }}>
                    {formatCurrency(customer.totalSpent || 0)}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {customer.lastOrder}
                  </td>
                  <td>
                    <StatusBadge status={customer.type} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        triggerSound('click');
                        setSelectedCustomer(customer);
                      }}
                    >
                      <span>View Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Order History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer Profile: ${selectedCustomer.name}`}
          subtitle={`Registered Phone: ${selectedCustomer.phone}`}
          maxWidth="560px"
          footer={
            <button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Profile Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tier</div>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={selectedCustomer.type} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders</div>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedCustomer.ordersCount || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Spent</div>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)', marginTop: '2px' }}>
                  {formatCurrency(selectedCustomer.totalSpent || 0)}
                </div>
              </div>
            </div>

            {selectedCustomer.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <MapPin size={15} style={{ color: 'var(--primary)' }} />
                <span>{selectedCustomer.address}</span>
              </div>
            )}

            {selectedCustomer.notes && (
              <div style={{ padding: '10px 12px', background: '#FEF3C7', borderRadius: '6px', fontSize: '0.8125rem', color: '#92400E', border: '1px solid #FDE68A' }}>
                <strong>Patron Note:</strong> {selectedCustomer.notes}
              </div>
            )}

            {/* Order History */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '8px' }}>
                Recent Order History ({customerOrders.length})
              </div>
              {customerOrders.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '12px', textAlign: 'center' }}>
                  No recent orders logged in active demo session.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customerOrders.map(ord => (
                    <div
                      key={ord.id}
                      style={{
                        padding: '10px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                          #{ord.id}
                        </span>{' '}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {ord.date} {ord.time} ({ord.orderType})
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {ord.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                          {formatCurrency(ord.grandTotal)}
                        </div>
                        <StatusBadge status={ord.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Customer"
          subtitle="Add customer contact profile for billing and loyalty"
          maxWidth="480px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveCustomer}>
                Save Customer
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Daniyal Qureshi"
                value={newCust.name}
                onChange={e => setNewCust({ ...newCust, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input font-mono"
                  placeholder="0300-1234567"
                  value={newCust.phone}
                  onChange={e => setNewCust({ ...newCust, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Tier</label>
                <select
                  className="form-select"
                  value={newCust.type}
                  onChange={e => setNewCust({ ...newCust, type: e.target.value })}
                >
                  <option value="New">New Diner</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="daniyal@example.com"
                value={newCust.email}
                onChange={e => setNewCust({ ...newCust, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address, sector, apartment number..."
                value={newCust.address}
                onChange={e => setNewCust({ ...newCust, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferences / Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Loves spicy toppings, dislikes bell peppers..."
                value={newCust.notes}
                onChange={e => setNewCust({ ...newCust, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
