import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbClient }           from '../db/sqliteClient';
import { useAuth }            from './AuthContext';
import {
  INITIAL_RESTAURANT_INFO,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
} from '../data/seedData';
import { playSound }          from '../utils/audio';
import { useCart }            from '../hooks/useCart';
import { buildOrderPayload }  from '../services/orderService';

const POSContext = createContext(null);

export function POSProvider({ children }) {
  const { currentUser, activeShift, requestManagerAuth } = useAuth();

  // Navigation & view
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('cc_pizza_sound_v1');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isCashierOnline, setIsCashierOnline] = useState(true);

  // SQLite Database States
  const [settings, setSettings] = useState(INITIAL_RESTAURANT_INFO);
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Cart state & actions — managed by useCart hook
  // (declared after addToast / triggerSound so they can be passed as deps)
  const [currentOrderNumber, setCurrentOrderNumber] = useState('10285');

  // Modals & Drawers
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [zReportData, setZReportData] = useState(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load state from SQLite Database
  useEffect(() => {
    let isMounted = true;
    async function loadDataFromDb() {
      try {
        const [dbMenu, dbOrders, dbInventory, dbCustomers, dbSettings] = await Promise.all([
          dbClient.menu.getAll(),
          dbClient.orders.getAll(),
          dbClient.inventory.getAll(),
          dbClient.customers.getAll(),
          dbClient.settings.getAll()
        ]);

        if (isMounted) {
          if (dbMenu.length > 0) setMenuItems(dbMenu);
          if (dbOrders.length > 0) setOrders(dbOrders);
          if (dbInventory.length > 0) setInventory(dbInventory);
          if (dbCustomers.length > 0) setCustomers(dbCustomers);
          if (dbSettings) setSettings(dbSettings);

          // Calculate next order sequence from latest order
          if (dbOrders.length > 0) {
            const maxOrder = Math.max(...dbOrders.map(o => parseInt(o.orderNumber || o.id, 10) || 10284));
            setCurrentOrderNumber((maxOrder + 1).toString());
          }
          setIsDbLoaded(true);
        }
      } catch (err) {
        console.error('Error loading data from SQLite:', err);
      }
    }
    loadDataFromDb();
    return () => { isMounted = false; };
  }, []);

  const triggerSound = (type = 'click') => {
    playSound(type, soundEnabled);
  };

  // Cart state & actions — delegate to useCart hook
  const cart = useCart({ settings, triggerSound, addToast });

  const openCustomizer = (menuItem) => {
    setCustomizingItem(menuItem);
    setIsCustomizerOpen(true);
    triggerSound('click');
  };

  // Complete Order & Insert into SQLite
  const completeOrder = async (paymentDetails) => {
    const newOrderId = currentOrderNumber;

    // Assemble the full order via the service (no inline object construction)
    const newOrder = buildOrderPayload({
      orderId:          newOrderId,
      cartItems:        cart.cartItems,
      cartTotals:       cart.cartTotals,
      paymentDetails,
      orderType:        cart.orderType,
      selectedTable:    cart.selectedTable,
      selectedCustomer: cart.selectedCustomer,
      orderNotes:       cart.orderNotes,
      discountType:     cart.discountType,
      currentUser,
      activeShift,
    });

    // 1. Instantly display Thermal Receipt Modal & update UI state
    setReceiptOrder(newOrder);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    setOrders(prev => [newOrder, ...prev]);

    // 2. Next order sequence
    setCurrentOrderNumber((parseInt(newOrderId, 10) + 1).toString());

    // 3. Audio & Feedback
    triggerSound('success');
    addToast(`Order #${newOrderId} confirmed & receipt slip ready!`, 'success');

    // 4. Reset Cart via hook (no toast)
    cart.resetCartAfterOrder();

    // 5. Asynchronously persist to SQLite Database
    try {
      await dbClient.orders.create(newOrder);

      // Update customer loyalty record if a customer was selected
      const cust = newOrder.customer;
      if (cust?.phone && cust.phone !== '0300-0000000') {
        await dbClient.customers.recordOrder(cust.phone, newOrder.grandTotal);
        setCustomers(prev => prev.map(c =>
          (c.id === cart.selectedCustomer?.id || c.phone === cust.phone)
            ? { ...c, ordersCount: (c.ordersCount || 0) + 1, totalSpent: (c.totalSpent || 0) + newOrder.grandTotal, lastOrder: 'Just now' }
            : c
        ));
      }
    } catch (dbErr) {
      console.warn('Database background persistence notice:', dbErr);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const idStr = String(orderId);

    // 1. Update React state immediately so UI and filters refresh instantly
    setOrders(prev => prev.map(o => {
      if (String(o.id) === idStr || String(o.orderNumber) === idStr) {
        return { ...o, status: newStatus };
      }
      return o;
    }));

    triggerSound('click');
    addToast(`Order #${idStr} status updated to ${newStatus}`, 'info');

    // 2. Persist to SQLite in background
    try {
      await dbClient.orders.updateStatus(idStr, newStatus);
    } catch (err) {
      console.warn('DB status update error:', err);
    }
  };

  // Protected Refund with Manager Authorization Override
  const refundOrder = (orderId, reason = 'Customer request') => {
    const idStr = String(orderId);
    requestManagerAuth(`Refund Order #${idStr}`, async (manager) => {
      setOrders(prev => prev.map(o => {
        if (String(o.id) === idStr || String(o.orderNumber) === idStr) {
          return { ...o, status: 'Cancelled', paymentStatus: 'Refunded', cancelReason: reason };
        }
        return o;
      }));
      triggerSound('remove');
      addToast(`Order #${idStr} refunded and cancelled with authorization`, 'warning');

      try {
        await dbClient.orders.refund(idStr, `${reason} (Approved by ${manager.name})`);
      } catch (err) {
        console.warn('DB refund error:', err);
      }
    });
  };

  const toggleItemAvailability = async (itemId) => {
    await dbClient.menu.toggleAvailability(itemId);
    const updatedMenu = await dbClient.menu.getAll();
    setMenuItems(updatedMenu);
    triggerSound('click');
    const target = updatedMenu.find(m => m.id === itemId);
    if (target) {
      addToast(`"${target.name}" is now ${target.available ? 'Available' : 'Sold Out'}`, target.available ? 'success' : 'warning');
    }
  };

  const addMenuItem = async (item) => {
    const created = await dbClient.menu.create(item);
    const updatedMenu = await dbClient.menu.getAll();
    setMenuItems(updatedMenu);
    triggerSound('success');
    addToast(`Added "${item.name}" to SQLite menu`, 'success');
  };

  const updateMenuItem = async (item) => {
    await dbClient.menu.update(item);
    const updatedMenu = await dbClient.menu.getAll();
    setMenuItems(updatedMenu);
    triggerSound('click');
    addToast(`Updated "${item.name}" in database`, 'success');
  };

  const deleteMenuItem = async (itemId) => {
    await dbClient.menu.delete(itemId);
    const updatedMenu = await dbClient.menu.getAll();
    setMenuItems(updatedMenu);
    triggerSound('remove');
    addToast('Item removed from menu', 'info');
  };

  const restockItem = async (invId, amount) => {
    await dbClient.inventory.restock(invId, amount);
    const updatedInventory = await dbClient.inventory.getAll();
    setInventory(updatedInventory);
    triggerSound('success');
    addToast('Inventory restocked in SQLite database', 'success');
  };

  const addInventoryItem = async (item) => {
    await dbClient.inventory.create(item);
    const updatedInventory = await dbClient.inventory.getAll();
    setInventory(updatedInventory);
    triggerSound('success');
    addToast(`Added "${item.name}" to inventory`, 'success');
  };

  const addCustomer = async (customer) => {
    const created = await dbClient.customers.create(customer);
    const updatedCustomers = await dbClient.customers.getAll();
    setCustomers(updatedCustomers);
    triggerSound('success');
    addToast(`Customer "${customer.name}" registered in database`, 'success');
    return created;
  };

  const updateSettings = async (newSettings) => {
    await dbClient.settings.saveAll(newSettings);
    setSettings(newSettings);
    triggerSound('success');
    addToast('Settings persisted to SQLite', 'success');
  };

  const resetDemoData = async () => {
    await dbClient.resetDatabase();
    const [dbMenu, dbOrders, dbInventory, dbCustomers, dbSettings] = await Promise.all([
      dbClient.menu.getAll(),
      dbClient.orders.getAll(),
      dbClient.inventory.getAll(),
      dbClient.customers.getAll(),
      dbClient.settings.getAll()
    ]);
    setMenuItems(dbMenu);
    setOrders(dbOrders);
    setInventory(dbInventory);
    setCustomers(dbCustomers);
    setSettings(dbSettings);
    setCurrentOrderNumber('10285');
    cart.resetCartAfterOrder();   // clear cart items via hook
    triggerSound('success');
    addToast('SQLite database restored to factory defaults', 'info');
  };

  const openZReport = (summary) => {
    setZReportData(summary);
    setIsZReportModalOpen(true);
    triggerSound('print');
  };

  const value = {
    // Navigation
    activeTab,       setActiveTab,
    globalSearch,    setGlobalSearch,
    // Sound & status
    soundEnabled,    setSoundEnabled,
    isCashierOnline, setIsCashierOnline,
    // Restaurant config
    settings,        setSettings: updateSettings,
    // DB collections
    menuItems,
    orders,
    customers,
    // Cart state & actions (spread from useCart hook — shape unchanged)
    ...cart,
    // Order sequencing
    currentOrderNumber,
    // POS actions
    openCustomizer,
    completeOrder,
    updateOrderStatus,
    refundOrder,
    toggleItemAvailability,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCustomer,
    resetDemoData,
    triggerSound,
    // Toast system
    toasts,
    addToast,
    removeToast,
    // Modal state
    isPaymentModalOpen,  setIsPaymentModalOpen,
    isReceiptModalOpen,  setIsReceiptModalOpen,
    receiptOrder,        setReceiptOrder,
    isZReportModalOpen,  setIsZReportModalOpen,
    zReportData,         setZReportData,
    openZReport,
    isCustomizerOpen,    setIsCustomizerOpen,
    customizingItem,
    isShortcutsOpen,     setIsShortcutsOpen,
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
