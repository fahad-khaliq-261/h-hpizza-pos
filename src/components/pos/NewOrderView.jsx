import React, { useRef, useEffect }          from 'react';
import { usePOS }                             from '../../context/POSContext';
import { CATEGORIES }                         from '../../data/seedData';
import { getCategoryMeta }                    from '../../services/menuService';
import { useMenuFilter }                      from '../../hooks/useMenuFilter';
import MenuItemCard                           from './MenuItemCard';
import CurrentOrderCart                       from './CurrentOrderCart';
import ItemCustomizerModal                    from './ItemCustomizerModal';
import PaymentModal                           from './PaymentModal';
import {
  Search, LayoutGrid, Pizza, Sandwich, Soup, Flame, ChefHat
} from 'lucide-react';

// Data-driven icon map keyed by H&H category IDs
const ICON_MAP = {
  LayoutGrid, Pizza, Sandwich, Soup, Flame, ChefHat,
};

function CategoryIcon({ categoryId, size = 16 }) {
  const { iconName } = getCategoryMeta(categoryId);
  const Icon = ICON_MAP[iconName] ?? LayoutGrid;
  return <Icon size={size} />;
}

export default function NewOrderView() {
  const { menuItems, triggerSound } = usePOS();

  // ── Search bar keyboard shortcut ────────────────────────────────────────
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Menu filter (category + search) via hook ────────────────────────────
  const { filtered, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } =
    useMenuFilter(menuItems);

  // Count per category for badge display
  const countFor = (catId) =>
    catId === 'all' ? menuItems.length : menuItems.filter(m => m.category === catId).length;

  return (
    <div className="pos-layout">
      {/* Left Column: Menu Explorer */}
      <section className="pos-menu-section">
        <div className="pos-menu-header">
          {/* Search Bar */}
          <div className="pos-search-bar">
            <Search size={18} className="pos-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="pos-search-input"
              placeholder="Search menu by pizza name, toppings, burgers, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="pos-search-kbd">Ctrl+K</span>
          </div>

          {/* Category Tabs */}
          <div className="pos-category-tabs">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    triggerSound('click');
                    setSelectedCategory(cat.id);
                  }}
                >
                  <CategoryIcon categoryId={cat.id} size={16} />
                  <span>{cat.name}</span>
                  <span className="category-tab-badge">{countFor(cat.id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="pos-menu-grid">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>No menu items found</div>
              <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Try searching with a different keyword or selecting "All Items".</p>
            </div>
          ) : (
            filtered.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      </section>

      {/* Right Column: Active Cart */}
      <CurrentOrderCart />

      {/* Modals */}
      <ItemCustomizerModal />
      <PaymentModal />
    </div>
  );
}
