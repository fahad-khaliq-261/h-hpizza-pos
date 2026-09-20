/**
 * useCart.js
 *
 * Custom hook: owns all cart state and CRUD operations.
 * Extracted from POSContext to satisfy SRP — the context becomes a thin coordinator.
 *
 * Design contract:
 *  - Called inside POSContext (not exported via a separate context).
 *  - Receives its external dependencies ({ settings, triggerSound, addToast })
 *    as a parameter so it stays decoupled from the global POS context.
 *  - The context value shape is unchanged — all cart fields are spread in as before.
 */

import { useState, useMemo } from 'react';
import { buildCartLineItem }  from '../services/menuService';
import { calcCartTotals }     from '../services/orderService';

/**
 * @param {{ settings: object, triggerSound: (type: string) => void, addToast: (msg: string, type: string) => void }} deps
 */
export function useCart({ settings, triggerSound, addToast }) {
  // ── Cart line-items ──────────────────────────────────────────────────────
  const [cartItems,        setCartItems]        = useState([]);

  // ── Order metadata ───────────────────────────────────────────────────────
  const [orderType,        setOrderType]        = useState('Dine In');
  const [selectedTable,    setSelectedTable]    = useState('Table 03');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderNotes,       setOrderNotes]       = useState('');

  // ── Discount ─────────────────────────────────────────────────────────────
  const [discountType,     setDiscountType]     = useState('percent');
  const [discountValue,    setDiscountValue]    = useState(0);

  // ── Derived totals (pure, memoised) ──────────────────────────────────────
  const cartTotals = useMemo(
    () => calcCartTotals(cartItems, discountType, discountValue, orderType, settings),
    [cartItems, discountType, discountValue, orderType, settings]
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Add a menu item to the cart, or increment quantity if the same
   * item + customisation combo already exists.
   *
   * @param {object}      menuItem      - Raw item from menuItems state
   * @param {object|null} customOptions - { size, crust, toppings[], notes }
   */
  const addToCart = (menuItem, customOptions = null) => {
    const lineItem = buildCartLineItem(menuItem, customOptions);

    setCartItems(prev => {
      const existingIdx = prev.findIndex(i => i.uniqueCartId === lineItem.uniqueCartId);
      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx !== existingIdx
            ? item
            : { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
        );
      }
      return [...prev, lineItem];
    });

    triggerSound('add');
    // No toast here — the cart panel shows real-time quantity feedback
  };

  /** Increment or decrement a cart line. Removes the line when quantity reaches 0. */
  const updateQuantity = (uniqueCartId, delta) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.uniqueCartId !== uniqueCartId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
        })
        .filter(Boolean)
    );
    triggerSound(delta > 0 ? 'add' : 'remove');
  };

  /** Remove a specific line from the cart entirely. */
  const removeFromCart = (uniqueCartId) => {
    setCartItems(prev => prev.filter(i => i.uniqueCartId !== uniqueCartId));
    triggerSound('remove');
  };

  /** Clear all cart lines and reset discount + notes. */
  const clearCart = () => {
    setCartItems([]);
    setDiscountValue(0);
    setOrderNotes('');
    triggerSound('click');
    addToast('Cart cleared', 'info');
  };

  /**
   * Full reset called after an order is completed.
   * Separate from clearCart so it does not trigger a toast.
   */
  const resetCartAfterOrder = () => {
    setCartItems([]);
    setDiscountValue(0);
    setOrderNotes('');
    setSelectedCustomer(null);
  };

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    cartItems,
    orderType,        setOrderType,
    selectedTable,    setSelectedTable,
    selectedCustomer, setSelectedCustomer,
    orderNotes,       setOrderNotes,
    discountType,     setDiscountType,
    discountValue,    setDiscountValue,
    cartTotals,
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    resetCartAfterOrder,
  };
}
