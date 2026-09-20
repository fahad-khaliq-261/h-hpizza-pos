import React from 'react';
import Modal from './Modal';

export default function ShortcutsModal({ isOpen, onClose }) {
  const shortcuts = [
    { key: 'Ctrl + N', desc: 'Create New Bill / Open POS Counter' },
    { key: 'Ctrl + K', desc: 'Focus Quick Search bar' },
    { key: 'Ctrl + P', desc: 'Print / Reprint Active Thermal Receipt' },
    { key: 'Ctrl + Enter', desc: 'Proceed to Payment (when cart has items)' },
    { key: 'Esc', desc: 'Close any active modal or dropdown' },
    { key: 'Ctrl + 1', desc: 'Billing Counter' },
    { key: 'Ctrl + 2', desc: 'Live Overview Dashboard' },
    { key: 'Ctrl + 3', desc: 'Orders Register' },
    { key: 'Ctrl + 4', desc: 'Daily Sales Records & Audit' },
    { key: 'Ctrl + 5', desc: 'Weekly Sales Records' },
    { key: 'Ctrl + 6', desc: 'Monthly Sales Records' },
    { key: 'Ctrl + 7', desc: 'Menu & Pricing' },
    { key: 'Ctrl + 8', desc: 'Customers Directory' },
    { key: 'Ctrl + 9', desc: 'Store Settings' },
    { key: 'F1', desc: 'Open this Keyboard Shortcuts Cheat Sheet' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Desktop Keyboard Shortcuts"
      subtitle="Fast workflow key bindings for high-speed cashier checkout"
      maxWidth="500px"
      footer={
        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {shortcuts.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 500 }}>{item.desc}</span>
            <kbd
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '5px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--primary)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              {item.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
