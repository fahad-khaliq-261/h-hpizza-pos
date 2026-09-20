import React from 'react';
import { usePOS } from '../../context/POSContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  LayoutDashboard,
  ReceiptText,
  Calendar,
  BarChart3,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Settings,
  LogOut,
  Wallet
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    triggerSound
  } = usePOS();

  const { logout, currentUser, setIsShiftCloseModalOpen } = useAuth();

  const primaryNav = [
    { id: 'new-order', label: 'Billing Counter', icon: ShoppingBag, badge: 'POS' },
    { id: 'dashboard', label: 'Live Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Register', icon: ReceiptText }
  ];

  const recordsNav = [
    { id: 'daily-records', label: 'Daily Records', icon: Calendar },
    { id: 'weekly-records', label: 'Weekly Records', icon: BarChart3 },
    { id: 'monthly-records', label: 'Monthly Records', icon: TrendingUp }
  ];

  const adminNav = [
    { id: 'menu', label: 'Menu & Pricing', icon: UtensilsCrossed },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'settings', label: 'Store Settings', icon: Settings }
  ];

  const renderNavGroup = (items, title = null) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {title && (
        <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', padding: '10px 14px 4px 14px' }}>
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            className={`nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => {
              triggerSound('click');
              setActiveTab(item.id);
            }}
            style={{ position: 'relative' }}
          >
            <Icon size={18} className="nav-icon" />
            <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  backgroundColor: isActive ? '#FFFFFF' : 'var(--primary)',
                  color: isActive ? 'var(--primary)' : '#FFFFFF',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="pos-sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo-area">
        <span className="brand-pizza-icon">🍕</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-text" style={{ lineHeight: '1.2' }}>
            H&H <span>Pizza Cafe</span>
          </span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Commercial Billing POS
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="sidebar-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {renderNavGroup(primaryNav, 'Billing Counter')}
        {renderNavGroup(recordsNav, 'Sales & Audit Records')}
        {renderNavGroup(adminNav, 'Administration')}
      </div>

      {/* Bottom Area: Shift Cashier & Sign Out */}
      <div className="sidebar-signout-area" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* End Shift / Drawer button */}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '8px' }}
          onClick={() => {
            triggerSound('click');
            setIsShiftCloseModalOpen(true);
          }}
          title="Close Current Shift & Reconcile Drawer"
        >
          <Wallet size={15} color="#059669" />
          <span>Shift Drawer Close</span>
        </button>

        <button
          className="signout-btn"
          onClick={() => {
            triggerSound('remove');
            logout();
          }}
          title="Sign Out / Lock Terminal"
        >
          <LogOut size={18} />
          <span>Sign Out ({currentUser?.name || 'Staff'})</span>
        </button>
      </div>
    </aside>
  );
}
