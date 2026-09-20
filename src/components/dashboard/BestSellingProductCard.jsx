import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function BestSellingProductCard({ filteredOrders }) {
  const topProduct = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return null;

    const itemStats = {};

    filteredOrders.forEach(order => {
      if (order.status === 'Cancelled') return;
      (order.items || []).forEach(item => {
        if (!itemStats[item.id]) {
          itemStats[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: item.image || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
            description: item.description || 'Our signature house special.'
          };
        }
        itemStats[item.id].quantity += item.quantity;
        itemStats[item.id].revenue += item.totalPrice;
      });
    });

    const sorted = Object.values(itemStats).sort((a, b) => b.quantity - a.quantity);
    return sorted.length > 0 ? sorted[0] : null;
  }, [filteredOrders]);

  if (!topProduct) {
    return (
      <div className="bestseller-product-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
        No sales data available.
      </div>
    );
  }

  return (
    <div className="bestseller-product-card">
      {/* Top Header */}
      <div className="bestseller-top-header">
        <div>
          <h3 className="bestseller-title">{topProduct.name}</h3>
          <p className="bestseller-desc">
            {topProduct.description}
          </p>
        </div>

        <div className="bestseller-badge">
          <Star size={12} fill="#FFFFFF" />
          <span>Best seller</span>
        </div>
      </div>

      {/* Pizza Product Image */}
      <div className="bestseller-image-wrapper">
        <img
          src={topProduct.image}
          alt={topProduct.name}
          className="bestseller-image"
        />
      </div>

      {/* Bottom Dual Orange Statistics Tiles */}
      <div className="bestseller-stats-row">
        <div className="bestseller-stat-tile">
          <span className="bestseller-stat-label">Orders</span>
          <span className="bestseller-stat-value">{topProduct.quantity}</span>
        </div>

        <div className="bestseller-stat-tile">
          <span className="bestseller-stat-label">Revenue</span>
          <span className="bestseller-stat-value">{formatCurrency(topProduct.revenue)}</span>
        </div>
      </div>
    </div>
  );
}
