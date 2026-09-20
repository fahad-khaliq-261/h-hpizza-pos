import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CASHIERS } from '../../data/seedData';
import {
  Store,
  Receipt,
  Percent,
  CreditCard,
  Users,
  Printer,
  Database,
  Save,
  RotateCcw,
  CheckCircle,
  Download,
  Upload
} from 'lucide-react';

export default function SettingsView() {
  const {
    settings,
    setSettings,
    currentCashier,
    setCurrentCashier,
    resetDemoData,
    triggerSound,
    addToast,
    setIsReceiptModalOpen,
    setReceiptOrder,
    orders
  } = usePOS();

  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState({ ...settings });

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formData);
    triggerSound('success');
    addToast('Settings updated successfully', 'success');
  };

  const handleTestPrint = () => {
    triggerSound('print');
    if (orders.length > 0) {
      setReceiptOrder(orders[0]);
      setIsReceiptModalOpen(true);
    } else {
      addToast('No orders available for test receipt', 'warning');
    }
  };

  const handleExportBackup = () => {
    triggerSound('click');
    const dump = {
      timestamp: new Date().toISOString(),
      settings: localStorage.getItem('cc_pizza_settings_v1'),
      orders: localStorage.getItem('cc_pizza_orders_v1'),
      menu: localStorage.getItem('cc_pizza_menu_v1'),
      inventory: localStorage.getItem('cc_pizza_inventory_v1'),
      customers: localStorage.getItem('cc_pizza_customers_v1')
    };

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crust_cheese_pos_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('POS backup file generated and downloaded', 'success');
  };

  const navSections = [
    { id: 'general', label: 'Restaurant Profile', icon: Store },
    { id: 'tax', label: 'Tax & Billing Rules', icon: Percent },
    { id: 'receipt', label: 'Thermal Receipt Setup', icon: Receipt },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'users', label: 'Cashier & User Roles', icon: Users },
    { id: 'printer', label: 'Hardware & Thermal Printer', icon: Printer },
    { id: 'backup', label: 'Backup & Factory Reset', icon: Database }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>POS Configuration & Settings</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage store profile, tax rules (17% GST), receipt branding, cashier logins, and printer integration
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
        {/* Navigation Sidebar */}
        <div className="pos-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navSections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setActiveSection(sec.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={18} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="pos-card" style={{ padding: '24px' }}>
          {/* Section: Restaurant Profile */}
          {activeSection === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Restaurant Information</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Branding and contact details shown across invoices and reports</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Restaurant Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.tagline || ''}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Branch Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.branch || ''}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NTN / STRN Registration Number</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={formData.ntn || ''}
                    onChange={e => setFormData({ ...formData, ntn: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Official Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Tax & Billing Rules */}
          {activeSection === 'tax' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Tax & Billing Configurations</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Configure regional GST percentages, currency symbol and delivery fees</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">General Sales Tax (GST %)</label>
                  <input
                    type="number"
                    className="form-input font-mono"
                    value={formData.taxRate !== undefined ? formData.taxRate : 17}
                    onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Delivery Charge (Rs.)</label>
                  <input
                    type="number"
                    className="form-input font-mono"
                    value={formData.deliveryFee !== undefined ? formData.deliveryFee : 150}
                    onChange={e => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.currency || 'Rs.'}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ padding: '14px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', fontSize: '0.8125rem', color: '#065F46' }}>
                <strong>Tax Compliance Active:</strong> General Sales Tax of 17% is automatically computed on all taxable subtotal amounts and printed itemized on thermal receipts.
              </div>
            </div>
          )}

          {/* Section: Thermal Receipt Customization */}
          {activeSection === 'receipt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Thermal Receipt Customization</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Customize headers, footer messages, social handles, and guest Wi-Fi details</p>
              </div>

              <div className="form-group">
                <label className="form-label">Receipt Footer Message</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.receiptFooter || ''}
                  onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Guest Wi-Fi Password (Printed on receipt)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.wifiPassword || ''}
                  onChange={e => setFormData({ ...formData, wifiPassword: e.target.value })}
                />
              </div>

              <button type="button" className="btn btn-secondary" onClick={handleTestPrint} style={{ alignSelf: 'flex-start' }}>
                <Printer size={15} />
                <span>Preview Thermal Receipt Layout</span>
              </button>
            </div>
          )}

          {/* Section: Payment Methods */}
          {activeSection === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Enabled Payment Methods</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Configure acceptable tender types at point-of-sale checkout</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Cash on Counter', desc: 'Accept physical cash currency with automated change return calculator', enabled: true },
                  { name: 'Credit & Debit Cards (Visa / Mastercard)', desc: 'Integrated payment terminal for bank cards', enabled: true },
                  { name: 'JazzCash Mobile Wallet', desc: 'Accept instant mobile account and QR scan payments', enabled: true },
                  { name: 'Easypaisa Mobile Wallet', desc: 'Accept digital wallet transfers and QR scan', enabled: true },
                  { name: 'Split Tender Payments', desc: 'Allow cashiers to divide single ticket across cash and cards', enabled: true }
                ].map((m, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                    </div>
                    <span className="badge badge-success">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Users & Roles */}
          {activeSection === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Cashiers & Staff Profiles</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Switch active terminal cashier or view operator authorization pins</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CASHIERS.map(c => {
                  const isCurrent = currentCashier.id === c.id;

                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: '14px 16px',
                        background: isCurrent ? 'var(--primary-light)' : '#F8FAFC',
                        borderRadius: '8px',
                        border: `1.5px solid ${isCurrent ? 'var(--primary)' : '#E2E8F0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#334155', color: '#FFFFFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                            {c.name} {isCurrent && <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>Active Session</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Role: {c.role} • {c.shift}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setCurrentCashier(c);
                          triggerSound('success');
                          addToast(`Switched terminal session to ${c.name}`, 'info');
                        }}
                      >
                        {isCurrent ? 'Current Cashier' : 'Switch to this User'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Printer & Hardware */}
          {activeSection === 'printer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Hardware & Thermal Printer</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>POS 80mm thermal receipt printer, cash drawer kick pulse, and barcode scanner</p>
              </div>

              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Thermal Printer Connection (USB / LAN)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EPSON TM-T88VI 80mm Thermal Receipt Printer (Ready)</div>
                  </div>
                  <span className="badge badge-success">Connected</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleTestPrint}>
                    <Printer size={15} />
                    <span>Run Printer Diagnostics</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section: Backup & Factory Reset */}
          {activeSection === 'backup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Data Backup & Demo Reset</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Export demo state or restore initial prototype data</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Export Demo State Backup</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Save all custom menu items, placed orders, and inventory adjustments as JSON.</p>
                  <button type="button" className="btn btn-secondary" onClick={handleExportBackup} style={{ marginTop: 'auto' }}>
                    <Download size={15} />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991B1B' }}>Factory Reset Demo Data</div>
                  <p style={{ fontSize: '0.75rem', color: '#B91C1C' }}>Clear all test orders and restore original sample pizzas, customers, and inventory levels.</p>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to reset all demo state to default seed data?")) {
                        resetDemoData();
                      }
                    }}
                    style={{ marginTop: 'auto' }}
                  >
                    <RotateCcw size={15} />
                    <span>Reset to Default Demo State</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
