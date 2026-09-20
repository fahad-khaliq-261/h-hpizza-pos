/**
 * menuService.js
 *
 * Single-responsibility module for all menu-domain logic.
 * Pure functions — no React imports, no side effects, fully testable.
 */

import { PIZZA_SIZES, PIZZA_CRUSTS } from '../data/seedData';

// ─── Category display metadata (H&H-specific) ────────────────────────────────

/** @type {Record<string, { emoji: string, gradient: string, iconName: string }>} */
const CATEGORY_META = {
  all:            { emoji: '🍽️', gradient: 'linear-gradient(135deg, #64748B 0%, #334155 100%)', iconName: 'LayoutGrid' },
  'special-pizza':{ emoji: '🍕', gradient: 'linear-gradient(135deg, #FF6B35 0%, #D84315 100%)', iconName: 'Pizza' },
  'regular-pizza':{ emoji: '🍕', gradient: 'linear-gradient(135deg, #FF8C42 0%, #C5301A 100%)', iconName: 'Pizza' },
  'chefs-pizza':  { emoji: '👨‍🍳', gradient: 'linear-gradient(135deg, #FF5722 0%, #BF360C 100%)', iconName: 'ChefHat' },
  burgers:        { emoji: '🍔', gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', iconName: 'Sandwich' },
  wraps:          { emoji: '🌯', gradient: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)', iconName: 'Sandwich' },
  'pratha-roll':  { emoji: '🫓', gradient: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)', iconName: 'Sandwich' },
  sandwich:       { emoji: '🥪', gradient: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)', iconName: 'Sandwich' },
  pasta:          { emoji: '🍝', gradient: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)', iconName: 'Soup' },
  fries:          { emoji: '🍟', gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', iconName: 'Flame' },
  appetizers:     { emoji: '🍗', gradient: 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)', iconName: 'Flame' },
};

const DEFAULT_META = {
  emoji: '🍕',
  gradient: 'linear-gradient(135deg, #C5172E 0%, #991B1B 100%)',
  iconName: 'LayoutGrid',
};

/**
 * Returns display metadata for a given category ID.
 * Always safe — returns a default if the ID is unknown.
 */
export function getCategoryMeta(categoryId) {
  return CATEGORY_META[categoryId] ?? DEFAULT_META;
}

// ─── Item pricing ────────────────────────────────────────────────────────────

/**
 * Resolve the correct price for an item + size combination.
 *
 * H&H items use an explicit `sizePrices` map (e.g. { s: 700, m: 1200, l: 1600, xl: 2000 }).
 * This is authoritative. The legacy `priceMultiplier` approach is NOT used.
 *
 * @param {object} item    - Menu item object from the DB / state
 * @param {string} sizeId  - One of: 's' | 'm' | 'l' | 'xl'
 * @returns {number}
 */
export function getItemPriceForSize(item, sizeId) {
  if (item?.sizePrices && sizeId != null && item.sizePrices[sizeId] != null) {
    return item.sizePrices[sizeId];
  }
  return item?.price ?? 0;
}

// ─── Cart construction ───────────────────────────────────────────────────────

const PIZZA_CATEGORIES = new Set(['special-pizza', 'regular-pizza', 'chefs-pizza']);

/**
 * Produce a deterministic, stable cart-line identifier.
 * Two requests with the same item + same options resolve to the same key
 * and will increment quantity rather than creating a duplicate line.
 */
export function buildCartId(menuItemId, size, crust, toppingIds, notes) {
  const sortedToppings = [...(toppingIds ?? [])].sort().join(',');
  return `${menuItemId}||${size}||${crust}||${sortedToppings}||${notes}`;
}

/**
 * Convert a menu item + optional customisation selections into a cart line-item.
 * This is the single source of truth for how an item enters the cart.
 *
 * @param {object}      menuItem      - Raw item from menuItems state
 * @param {object|null} customOptions - { size, crust, toppings[], notes }
 * @returns {object} Cart line-item ready for state insertion
 */
export function buildCartLineItem(menuItem, customOptions = null) {
  const isPizza = PIZZA_CATEGORIES.has(menuItem.category);

  const size     = customOptions?.size   ?? 'm';
  const crust    = customOptions?.crust  ?? 'regular';
  const toppings = customOptions?.toppings ?? [];
  const notes    = customOptions?.notes    ?? '';

  const sizeObj  = PIZZA_SIZES.find(s => s.id === size);
  const crustObj = PIZZA_CRUSTS.find(c => c.id === crust);

  // ✅ Correct: read from sizePrices map, NOT priceMultiplier * item.price
  const basePrice    = getItemPriceForSize(menuItem, size);
  const crustPrice   = crustObj?.extraPrice ?? 0;
  const toppingPrice = toppings.reduce((sum, t) => sum + (t.price ?? 0), 0);
  const unitPrice    = basePrice + crustPrice + toppingPrice;

  // Human-readable modifier labels shown in cart
  const modifiers = [];
  if (isPizza && sizeObj)                          modifiers.push(sizeObj.name);
  if (isPizza && crustObj && crustObj.extraPrice > 0) modifiers.push(crustObj.name);
  if (toppings.length > 0) modifiers.push(`+ ${toppings.map(t => t.name).join(', ')}`);

  return {
    uniqueCartId: buildCartId(menuItem.id, size, crust, toppings.map(t => t.id), notes),
    menuItemId:   menuItem.id,
    name:         menuItem.name,
    category:     menuItem.category,
    image:        menuItem.image,
    size,
    crust,
    toppings,
    modifiers,
    notes,
    unitPrice,
    quantity:     1,
    totalPrice:   unitPrice,
  };
}

// ─── Badge classification ────────────────────────────────────────────────────

/** Returns a CSS class name for a badge string. Used by MenuItemCard. */
export function getBadgeClass(badge) {
  if (!badge) return '';
  const b = badge.toLowerCase();
  if (b.includes('bestseller')) return 'bestseller';
  if (b.includes('spicy'))      return 'spicy';
  if (b.includes('classic'))    return 'classic';
  if (b.includes('chef'))       return 'chef';
  return '';
}
