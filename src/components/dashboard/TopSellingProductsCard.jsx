import React, { useMemo } from 'react';

export default function TopSellingProductsCard({ filteredOrders }) {
  const products = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];

    const itemStats = {};
    let totalQuantity = 0;

    filteredOrders.forEach(order => {
      if (order.status === 'Cancelled') return;
      (order.items || []).forEach(item => {
        if (!itemStats[item.id]) {
          itemStats[item.id] = { name: item.name, quantity: 0 };
        }
        itemStats[item.id].quantity += item.quantity;
        totalQuantity += item.quantity;
      });
    });

    if (totalQuantity === 0) return [];

    const sorted = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // top 5

    // Calculate percentage based on total quantity of all items sold
    return sorted.map(item => ({
      name: item.name,
      percent: Math.round((item.quantity / totalQuantity) * 100)
    }));
  }, [filteredOrders]);

  return (
    <div className="top-products-progress-card">
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
        Top Selling Products
      </h3>

      <div className="progress-list-container">
        {products.length === 0 ? (
          <div style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '1rem' }}>No products sold yet.</div>
        ) : (
          products.map((item, idx) => (
            <div key={idx} className="progress-product-row">
              <span className="product-row-name">{item.name}</span>

              <div className="product-progress-track">
                <div
                  className="product-progress-fill"
                  style={{ width: `${item.percent}%` }}
                />
              </div>

              <span className="product-row-percent">{item.percent}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
