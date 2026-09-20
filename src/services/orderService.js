/**
 * orderService.js
 *
 * Pure domain functions for order construction and cart total calculation.
 * No React, no DB access, no side-effects — fully testable in isolation.
 */

import { formatTime } from '../utils/formatters';

// ─── Cart totals ─────────────────────────────────────────────────────────────

/**
 * Calculate the full breakdown of cart totals from first principles.
 * Extracted from POSContext so it can be called anywhere without React context.
 *
 * @param {object[]} cartItems
 * @param {'percent'|'flat'} discountType
 * @param {number} discountValue
 * @param {'Dine In'|'Takeaway'|'Delivery'} orderType
 * @param {object} settings - { taxRate, deliveryFee }
 * @returns {{ subtotal, discountAmount, taxAmount, deliveryFee, grandTotal, itemCount }}
 */
export function calcCartTotals(cartItems, discountType, discountValue, orderType, settings) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  let discountAmount = 0;
  if (discountValue > 0) {
    discountAmount = discountType === 'percent'
      ? Math.round((subtotal * discountValue) / 100)
      : Math.min(discountValue, subtotal);
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate       = settings?.taxRate     ?? 0;
  const feeRate       = settings?.deliveryFee ?? 0;
  const taxAmount     = Math.round((taxableAmount * taxRate) / 100);
  const deliveryFee   = orderType === 'Delivery' && cartItems.length > 0 ? feeRate : 0;
  const grandTotal    = Math.max(0, taxableAmount + taxAmount + deliveryFee);
  const itemCount     = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discountAmount, taxAmount, deliveryFee, grandTotal, itemCount };
}

// ─── Order payload builder ───────────────────────────────────────────────────

/**
 * Assemble a complete, DB-ready order payload from cart state + payment details.
 * All logic that was previously inline in completeOrder() lives here.
 *
 * @param {object} params
 * @param {string}   params.orderId
 * @param {object[]} params.cartItems
 * @param {object}   params.cartTotals        - Output of calcCartTotals()
 * @param {object}   params.paymentDetails    - { method, amountReceived, change }
 * @param {string}   params.orderType
 * @param {string}   params.selectedTable
 * @param {object|null} params.selectedCustomer
 * @param {string}   params.orderNotes
 * @param {string}   params.discountType
 * @param {object|null} params.currentUser    - { id, name }
 * @param {object|null} params.activeShift    - { id }
 * @returns {object} Fully hydrated order object
 */
export function buildOrderPayload({
  orderId,
  cartItems,
  cartTotals,
  paymentDetails,
  orderType,
  selectedTable,
  selectedCustomer,
  orderNotes,
  discountType,
  currentUser,
  activeShift,
}) {
  const now = new Date();

  const customer = selectedCustomer ?? {
    name:  orderType === 'Dine In' ? `Guest (${selectedTable})` : 'Walk-in Customer',
    phone: '0300-0000000',
  };

  return {
    id:             orderId,
    orderNumber:    orderId,
    shiftId:        activeShift?.id ?? null,
    cashierId:      currentUser?.id ?? 'u1',
    cashier:        currentUser?.name ?? 'Admin',
    customer,
    orderType,
    tableNo:        orderType === 'Dine In' ? selectedTable : null,
    items:          cartItems.map(item => ({
      id:         item.menuItemId ?? item.id,
      name:       item.name,
      size:       item.size,
      crust:      item.crust,
      quantity:   item.quantity,
      unitPrice:  item.unitPrice,
      totalPrice: item.totalPrice,
      modifiers:  item.modifiers ?? [],
    })),
    subtotal:       cartTotals.subtotal,
    discount:       cartTotals.discountAmount,
    discountType,
    tax:            cartTotals.taxAmount,
    deliveryFee:    cartTotals.deliveryFee,
    grandTotal:     cartTotals.grandTotal,
    paymentMethod:  paymentDetails.method           ?? 'Cash',
    amountReceived: paymentDetails.amountReceived   ?? cartTotals.grandTotal,
    changeGiven:    paymentDetails.change           ?? 0,
    paymentStatus:  'Paid',
    status:         'Preparing',
    time:           formatTime(now),
    date:           now.toISOString().split('T')[0],
    notes:          orderNotes,
  };
}
