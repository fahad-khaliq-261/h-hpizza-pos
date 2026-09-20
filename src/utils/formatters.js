/**
 * formatters.js
 *
 * Pure formatting utilities — no side effects, no React imports.
 * generateOrderId() has been removed: order sequencing lives in POSContext
 * (currentOrderNumber state, seeded from the DB on load).
 */

export function formatCurrency(amount, currency = 'Rs.') {
  if (amount === undefined || amount === null || isNaN(amount)) return `${currency} 0`;
  return `${currency} ${Math.round(amount).toLocaleString('en-PK')}`;
}

export function formatTime(dateObj = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    hour:   'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(dateObj);
}

export function formatDate(dateObj = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  }).format(dateObj);
}

export function calculatePercentageChange(current, previous) {
  if (!previous) return '+0.0%';
  const change = ((current - previous) / previous) * 100;
  const sign   = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

