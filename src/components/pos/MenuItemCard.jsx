import React, { useState }    from 'react';
import { usePOS }             from '../../context/POSContext';
import { formatCurrency }     from '../../utils/formatters';
import { getCategoryMeta, getBadgeClass } from '../../services/menuService';
import { Plus, Sliders, Check } from 'lucide-react';

export default function MenuItemCard({ item }) {
  const { addToCart, openCustomizer, cartItems } = usePOS();
  const [imageFailed, setImageFailed] = useState(false);

  // Find if item is already in cart
  const cartItemCount = cartItems
    .filter(ci => ci.menuItemId === item.id)
    .reduce((sum, ci) => sum + ci.quantity, 0);

  const { emoji: categoryEmoji, gradient: categoryGradient } = getCategoryMeta(item.category);

  const handleCardClick = () => {
    if (!item.available) return;
    if (item.isCustomizable) {
      openCustomizer(item);
    } else {
      addToCart(item);
    }
  };

  const handleDirectAdd = (e) => {
    e.stopPropagation();
    if (!item.available) return;
    addToCart(item);
  };

  const handleCustomize = (e) => {
    e.stopPropagation();
    if (!item.available) return;
    openCustomizer(item);
  };

  const hasImage = Boolean(item.image) && !imageFailed;

  return (
    <div
      className={`menu-card ${!item.available ? 'unavailable' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: item.available ? 'pointer' : 'not-allowed' }}
    >
      {/* Visual Header / Banner */}
      <div
        className="menu-card-image-wrapper"
        style={{
          background: hasImage ? '#F1F5F9' : categoryGradient
        }}
      >
        {hasImage ? (
          <img
            src={item.image}
            alt={item.name}
            className="menu-card-img"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <span style={{ fontSize: '38px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
              {categoryEmoji}
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9, marginTop: '2px' }}>
              {item.category}
            </span>
          </div>
        )}

        {/* Badge */}
        {item.badge && item.available && (
          <span className={`menu-card-badge ${getBadgeClass(item.badge)}`}>
            {item.badge}
          </span>
        )}

        {!item.available && (
          <div className="menu-card-badge sold-out">
            Sold Out
          </div>
        )}

        {/* Cart Count Quantity Pill */}
        {cartItemCount > 0 && item.available && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: '999px',
              minWidth: '24px',
              height: '24px',
              padding: '0 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '2px solid #FFFFFF'
            }}
          >
            {cartItemCount}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="menu-card-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <h4 className="menu-card-title" title={item.name}>
            {item.name}
          </h4>
          <p className="menu-card-desc" title={item.description}>
            {item.description || 'Freshly prepared handcrafted recipe with artisanal ingredients.'}
          </p>
        </div>

        {/* Guaranteed Visible Footer with Price & Actions */}
        <div className="menu-card-footer">
          <div className="menu-card-price">
            {formatCurrency(item.price)}
          </div>

          <div className="menu-card-actions">
            {item.isCustomizable && item.available && (
              <button
                type="button"
                className="menu-customize-btn"
                onClick={handleCustomize}
                title="Customize size, crust & extra toppings"
              >
                <Sliders size={13} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Custom</span>
              </button>
            )}

            <button
              type="button"
              className="menu-add-btn"
              onClick={handleDirectAdd}
              disabled={!item.available}
              title="Add to current order"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
