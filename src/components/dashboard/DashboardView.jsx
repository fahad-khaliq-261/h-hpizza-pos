import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import WelcomeBanner from './WelcomeBanner';
import KpiCardsSection from './KpiCardsSection';
import PizzaSalesAnalytics from './PizzaSalesAnalytics';
import BestSellingProductCard from './BestSellingProductCard';
import TopSellingProductsCard from './TopSellingProductsCard';
import OrderChannelsCard from './OrderChannelsCard';

export default function DashboardView() {
  const { orders } = usePOS();
  const [dateFilter, setDateFilter] = useState('Today'); // 'Today', 'Week', 'Month'

  const filteredOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return orders.filter(o => {
      if (o.status === 'Cancelled') return false;
      const orderDate = new Date(o.date);
      if (dateFilter === 'Today') return orderDate >= today;
      if (dateFilter === 'Week') return orderDate >= weekAgo;
      if (dateFilter === 'Month') return orderDate >= monthAgo;
      return true;
    });
  }, [orders, dateFilter]);

  return (
    <div className="dashboard-view-wrapper">
      {/* 1. Welcome Greeting & Actions */}
      <WelcomeBanner />

      {/* 2. Four Large Statistics KPI Cards */}
      <KpiCardsSection filteredOrders={filteredOrders} dateFilter={dateFilter} />

      {/* 3. Middle Section: Pizza Sales Analytics & Best Selling Product */}
      <div className="middle-dashboard-grid">
        <PizzaSalesAnalytics dateFilter={dateFilter} setDateFilter={setDateFilter} filteredOrders={filteredOrders} />
        <BestSellingProductCard filteredOrders={filteredOrders} />
      </div>

      {/* 4. Bottom Section: Top Selling Products & Order Channels */}
      <div className="bottom-dashboard-grid">
        <TopSellingProductsCard filteredOrders={filteredOrders} />
        <OrderChannelsCard filteredOrders={filteredOrders} />
      </div>
    </div>
  );
}
