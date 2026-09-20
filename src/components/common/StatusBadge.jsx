import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  let badgeClass = 'badge-neutral';
  let dotColor = null;

  const normalized = status.toLowerCase();

  if (['completed', 'paid', 'in stock', 'vip', 'online', 'delivered'].includes(normalized)) {
    badgeClass = 'badge-success';
  } else if (['preparing', 'low stock', 'regular', 'away'].includes(normalized)) {
    badgeClass = 'badge-warning';
  } else if (['cancelled', 'out of stock', 'refunded', 'offline'].includes(normalized)) {
    badgeClass = 'badge-danger';
  } else if (['ready', 'delivery', 'new', 'info'].includes(normalized)) {
    badgeClass = 'badge-info';
  } else if (['dine in', 'primary'].includes(normalized)) {
    badgeClass = 'badge-primary';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
