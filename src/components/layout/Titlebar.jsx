import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { useAuth } from '../../context/AuthContext';
import {
  Volume2,
  VolumeX,
  Keyboard,
  Clock,
  Minus,
  Square,
  X,
  Lock,
  LogOut,
  Receipt,
  UserCheck,
  Shield,
  Timer
} from 'lucide-react';

export default function Titlebar() {
  const {
    soundEnabled,
    setSoundEnabled,
    setIsShortcutsOpen,
    isCashierOnline,
    setIsCashierOnline,
    triggerSound
  } = usePOS();

  const {
    currentUser,
    activeShift,
    logout,
    setIsShiftCloseModalOpen
  } = useAuth();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [shiftDuration, setShiftDuration] = useState('00h 00m');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      );

      // Compute live shift duration
      if (activeShift?.start_time) {
        const start = new Date(activeShift.start_time).getTime();
        const diffMs = Math.max(0, now.getTime() - start);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setShiftDuration(`${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const handleMinimize = () => {
    triggerSound('click');
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    triggerSound('click');
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    triggerSound('click');
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <header className="desktop-titlebar">
      {/* Brand & Database Status */}
      <div className="titlebar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🍕</span>
          <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            H&H PIZZA POS
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
            SQLite Live
          </span>
        </div>
      </div>

      {/* Center Clock & Shift Timer */}
      <div className="titlebar-center">
        <div className="clock-widget">
          <Clock size={14} style={{ color: 'var(--primary)' }} />
          <span>{dateStr}</span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{timeStr}</span>
        </div>

        {activeShift && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#92400E'
            }}
          >
            <Timer size={13} />
            <span>Shift: {shiftDuration}</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="titlebar-right">
        {/* End Shift / Z-Report Button */}
        {currentUser && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              triggerSound('click');
              setIsShiftCloseModalOpen(true);
            }}
            title="Settle Shift & Print Z-Report"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            <Receipt size={13} style={{ color: 'var(--primary)' }} />
            <span>End Shift (Z-Report)</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          className="btn-icon btn-secondary"
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) triggerSound('add');
          }}
          title={soundEnabled ? 'Audio cues enabled' : 'Mute audio cues'}
          style={{ width: '32px', height: '32px', padding: 0 }}
        >
          {soundEnabled ? <Volume2 size={16} style={{ color: '#16A34A' }} /> : <VolumeX size={16} style={{ color: '#94A3B8' }} />}
        </button>

        {/* Shortcuts button */}
        <button
          className="btn-icon btn-secondary"
          onClick={() => {
            triggerSound('click');
            setIsShortcutsOpen(true);
          }}
          title="Keyboard Shortcuts (Ctrl+K, Ctrl+N)"
          style={{ width: '32px', height: '32px', padding: 0 }}
        >
          <Keyboard size={16} />
        </button>

        {/* Cashier profile & Lock Screen */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981'
                }}
              />
              <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{currentUser.name}</span>
              <span className="badge badge-primary" style={{ fontSize: '0.625rem', padding: '1px 5px', textTransform: 'capitalize' }}>
                {currentUser.role}
              </span>
            </div>

            <button
              className="btn-icon btn-secondary"
              onClick={logout}
              title="Lock Terminal / Switch User"
              style={{ width: '32px', height: '32px', padding: 0, color: '#EF4444' }}
            >
              <Lock size={15} />
            </button>
          </div>
        )}

        {/* Window controls */}
        <div className="window-controls">
          <button className="win-btn" onClick={handleMinimize} title="Minimize">
            <Minus size={14} />
          </button>
          <button className="win-btn" onClick={handleMaximize} title="Maximize">
            <Square size={12} />
          </button>
          <button className="win-btn close" onClick={handleClose} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
