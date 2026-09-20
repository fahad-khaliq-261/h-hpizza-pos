import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function ShiftOpenModal() {
  const { isShiftOpenModalNeeded, setIsShiftOpenModalNeeded, openShift, currentUser } = useAuth();
  const [openingFloat, setOpeningFloat] = useState('5000');

  if (!isShiftOpenModalNeeded || !currentUser) return null;

  const floatPresets = [2000, 3000, 5000, 10000];

  const handleStartShift = (e) => {
    e.preventDefault();
    const floatNum = parseFloat(openingFloat) || 0;
    openShift(floatNum);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
            color: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)' }}>
              <Clock size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Start New Cashier Shift</h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Cashier: <strong>{currentUser.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleStartShift} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.875rem' }}>
              Starting Cash Drawer Float (Rs.)
            </label>
            <input
              type="number"
              className="form-input font-mono"
              style={{ fontSize: '1.5rem', fontWeight: 800, padding: '10px 14px' }}
              value={openingFloat}
              onChange={e => setOpeningFloat(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Quick presets */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Quick Presets:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
              {floatPresets.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setOpeningFloat(val.toString())}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontWeight: 700,
                    background: openingFloat === val.toString() ? 'var(--primary-light)' : '#F8FAFC',
                    borderColor: openingFloat === val.toString() ? 'var(--primary)' : '#CBD5E1',
                    color: openingFloat === val.toString() ? 'var(--primary)' : 'inherit'
                  }}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            ℹ️ Cash drawer float is recorded in the SQLite database to balance the end-of-day Shift Z-Report.
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setIsShiftOpenModalNeeded(false)}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5 }}
            >
              <CheckCircle size={16} />
              <span>Open Drawer & Begin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
