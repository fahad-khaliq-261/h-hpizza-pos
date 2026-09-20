import React from 'react';
import { usePOS } from '../../context/POSContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Download } from 'lucide-react';

export default function WelcomeBanner() {
  const { setActiveTab, triggerSound, orders, addToast } = usePOS();
  const { currentUser } = useAuth();

  const handleExport = () => {
    triggerSound('click');
    const headers = ["Order ID", "Date", "Customer", "Total", "Status"];
    const rows = orders.map(o => [o.id, o.date, `"${o.customer?.name || 'Walk-in'}"`, o.grandTotal, o.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Pizza_POS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report exported successfully', 'success');
  };

  const cashierName = currentUser?.name || 'Ahmad';

  return (
    <div className="welcome-hero-section">
      <div>
        <h1 className="welcome-title-main">Good Morning, Manager</h1>
        <h2 className="welcome-subtitle-accent">Welcome back, {cashierName}</h2>
      </div>

      <div className="welcome-actions-group">
        <button
          className="btn-welcome-primary"
          onClick={() => {
            triggerSound('click');
            setActiveTab('new-order');
          }}
          title="Open POS Billing Terminal"
        >
          <Plus size={18} />
          <span>New Order</span>
        </button>

        <button
          className="btn-welcome-secondary"
          onClick={handleExport}
          title="Export CSV Report"
        >
          <Download size={16} />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}
