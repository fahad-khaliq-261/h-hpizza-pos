import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { POSProvider, usePOS } from './context/POSContext';
import TopHeader from './components/layout/TopHeader';
import Sidebar from './components/layout/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import NewOrderView from './components/pos/NewOrderView';
import OrdersView from './components/orders/OrdersView';
import DailyRecordsView from './components/records/DailyRecordsView';
import WeeklyRecordsView from './components/records/WeeklyRecordsView';
import MonthlyRecordsView from './components/records/MonthlyRecordsView';
import DailyZReportModal from './components/records/DailyZReportModal';
import MenuManagementView from './components/menu/MenuManagementView';
import CategoriesView from './components/menu/CategoriesView';
import CustomersView from './components/customers/CustomersView';
import EmployeesView from './components/auth/EmployeesView';
import DiscountsView from './components/settings/DiscountsView';
import SettingsView from './components/settings/SettingsView';
import LoginScreen from './components/auth/LoginScreen';
import ShiftOpenModal from './components/auth/ShiftOpenModal';
import ShiftCloseModal from './components/auth/ShiftCloseModal';
import ManagerAuthModal from './components/auth/ManagerAuthModal';
import ReceiptModal from './components/pos/ReceiptModal';
import ShortcutsModal from './components/common/ShortcutsModal';
import ToastContainer from './components/common/ToastContainer';

function POSAppContent() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const {
    activeTab,
    setActiveTab,
    isShortcutsOpen,
    setIsShortcutsOpen,
    orders,
    setReceiptOrder,
    setIsReceiptModalOpen,
    triggerSound
  } = usePOS();

  // Desktop Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        triggerSound('click');
        setActiveTab('new-order');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (orders.length > 0) {
          triggerSound('print');
          setReceiptOrder(orders[0]);
          setIsReceiptModalOpen(true);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        triggerSound('click');
        const tabMap = {
          '1': 'new-order',
          '2': 'dashboard',
          '3': 'orders',
          '4': 'daily-records',
          '5': 'weekly-records',
          '6': 'monthly-records',
          '7': 'menu',
          '8': 'customers',
          '9': 'settings'
        };
        if (tabMap[e.key]) {
          setActiveTab(tabMap[e.key]);
        }
      } else if (e.key === 'F1') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orders, setActiveTab, setIsReceiptModalOpen, setIsShortcutsOpen, setReceiptOrder, triggerSound]);

  // Loading state
  if (isAuthLoading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', color: '#111827' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍕</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Loading Pizza POS...</h2>
          <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginTop: '4px' }}>Initializing SQLite Database Engine</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show PIN Keypad & Login Screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'new-order':
        return <NewOrderView />;
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'daily-records':
        return <DailyRecordsView />;
      case 'weekly-records':
        return <WeeklyRecordsView />;
      case 'monthly-records':
        return <MonthlyRecordsView />;
      case 'menu':
        return <MenuManagementView />;
      case 'categories':
        return <CategoriesView />;
      case 'customers':
        return <CustomersView />;
      case 'employees':
        return <EmployeesView />;
      case 'discounts':
        return <DiscountsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <NewOrderView />;
    }
  };

  return (
    <div className="desktop-app-container">
      {/* Top Header with Prominent Search & Actions */}
      <TopHeader />

      <div className="desktop-app-body">
        {/* Fixed Desktop Sidebar Navigation */}
        <Sidebar />

        {/* Scrollable Main Workspace */}
        <main
          className="main-content-scroll"
          style={{
            padding: activeTab === 'new-order' ? '0' : '24px 32px'
          }}
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Auth & Shift Modals */}
      <ShiftOpenModal />
      <ShiftCloseModal />
      <ManagerAuthModal />
      <ReceiptModal />
      <DailyZReportModal />

      {/* Global Modals & Toast System */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <POSProvider>
        <POSAppContent />
      </POSProvider>
    </AuthProvider>
  );
}
