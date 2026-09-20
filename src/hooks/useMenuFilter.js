/**
 * useMenuFilter.js
 *
 * Custom hook: encapsulates category + search filter state for the POS menu browser.
 * Keeps NewOrderView free from filter logic and makes the behaviour reusable.
 */

import { useState, useMemo } from 'react';

/**
 * @param {object[]} menuItems - Full menu item list from POS context
 * @returns {{
 *   filtered:          object[],
 *   selectedCategory:  string,
 *   setSelectedCategory: (id: string) => void,
 *   searchQuery:       string,
 *   setSearchQuery:    (q: string)  => void,
 * }}
 */
export function useMenuFilter(menuItems = []) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery,      setSearchQuery]      = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter(item => {
      const catMatch   = selectedCategory === 'all' || item.category === selectedCategory;
      const queryMatch = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return {
    filtered,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  };
}
