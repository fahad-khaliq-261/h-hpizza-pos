import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Calendar,
  Calculator,
  User,
  Minus,
  Square,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function TopHeader() {
  const {
    setActiveTab,
    soundEnabled,
    setSoundEnabled,
    triggerSound,
    addToast
  } = usePOS();

  const { currentUser } = useAuth();

  // Mini Calculator State
  const [showCalc, setShowCalc] = useState(false);
  const [calcVal, setCalcVal] = useState('0');
  const [prevVal, setPrevVal] = useState(null);
  const [op, setOp] = useState(null);
  const [resetNext, setResetNext] = useState(false);

  const handleCalcNum = (num) => {
    triggerSound('click');
    if (calcVal === '0' || resetNext) {
      setCalcVal(String(num));
      setResetNext(false);
    } else {
      setCalcVal(calcVal + num);
    }
  };

  const handleCalcOp = (operation) => {
    triggerSound('click');
    setPrevVal(parseFloat(calcVal));
    setOp(operation);
    setResetNext(true);
  };

  const handleCalcEquals = () => {
    triggerSound('click');
    if (op && prevVal !== null) {
      const cur = parseFloat(calcVal);
      let res = 0;
      if (op === '+') res = prevVal + cur;
      else if (op === '-') res = prevVal - cur;
      else if (op === '×') res = prevVal * cur;
      else if (op === '÷') res = cur !== 0 ? Math.round((prevVal / cur) * 100) / 100 : 'Err';
      setCalcVal(String(res));
      setOp(null);
      setPrevVal(null);
      setResetNext(true);
    }
  };

  const handleCalcClear = () => {
    triggerSound('click');
    setCalcVal('0');
    setPrevVal(null);
    setOp(null);
    setResetNext(false);
  };

  const handleMinimize = () => {
    triggerSound('click');
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    triggerSound('click');
    window.electronAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    triggerSound('click');
    window.electronAPI?.closeWindow?.();
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="top-header-bar">
      {/* Top Left Brand & Live Status (Search bar completely removed) */}
      <div className="header-brand-section">
        <span className="header-brand-title">H&H PIZZA CAFE</span>
        <span className="header-status-badge">
          <span className="status-live-dot" />
          Live POS
        </span>
      </div>

      {/* Top Actions: Notification, Date, Calculator, "+ New Bill", Admin Profile */}
      <div className="header-actions-right">
        {/* 1. Notification */}
        <button
          className="header-icon-btn"
          title="Notifications"
          onClick={() => {
            triggerSound('click');
            addToast('No new unread alerts', 'info');
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '9px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#EF4444'
            }}
          />
        </button>

        {/* 2. Date */}
        <button
          className="header-date-btn"
          title="Current System Date"
          onClick={() => {
            triggerSound('click');
            addToast(`Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 'info');
          }}
        >
          <Calendar size={15} className="header-date-icon" />
          <span>{currentDateFormatted}</span>
        </button>

        {/* 3. Calculator */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-icon-btn"
            title="Calculator"
            style={{
              borderColor: showCalc ? 'var(--primary)' : undefined,
              color: showCalc ? 'var(--primary)' : undefined
            }}
            onClick={() => {
              triggerSound('click');
              setShowCalc(!showCalc);
            }}
          >
            <Calculator size={18} />
          </button>

          {/* Calculator Popover */}
          {showCalc && (
            <div className="header-calculator-popover">
              <div className="calc-display">{calcVal}</div>
              <div className="calc-buttons-grid">
                <button className="calc-btn op-btn" onClick={handleCalcClear}>C</button>
                <button className="calc-btn op-btn" onClick={() => handleCalcOp('÷')}>÷</button>
                <button className="calc-btn op-btn" onClick={() => handleCalcOp('×')}>×</button>
                <button className="calc-btn op-btn" onClick={() => handleCalcOp('-')}>-</button>

                <button className="calc-btn" onClick={() => handleCalcNum('7')}>7</button>
                <button className="calc-btn" onClick={() => handleCalcNum('8')}>8</button>
                <button className="calc-btn" onClick={() => handleCalcNum('9')}>9</button>
                <button className="calc-btn op-btn" onClick={() => handleCalcOp('+')}>+</button>

                <button className="calc-btn" onClick={() => handleCalcNum('4')}>4</button>
                <button className="calc-btn" onClick={() => handleCalcNum('5')}>5</button>
                <button className="calc-btn" onClick={() => handleCalcNum('6')}>6</button>
                <button className="calc-btn equals-btn" onClick={handleCalcEquals} style={{ gridRow: 'span 2', height: '69px' }}>=</button>

                <button className="calc-btn" onClick={() => handleCalcNum('1')}>1</button>
                <button className="calc-btn" onClick={() => handleCalcNum('2')}>2</button>
                <button className="calc-btn" onClick={() => handleCalcNum('3')}>3</button>

                <button className="calc-btn" onClick={() => handleCalcNum('0')} style={{ gridColumn: 'span 2' }}>0</button>
                <button className="calc-btn" onClick={() => handleCalcNum('.')}>.</button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Quick "+ New Bill" Button */}
        <button
          className="btn btn-primary"
          style={{ padding: '7px 14px', fontSize: '0.8125rem', fontWeight: 700, gap: '6px' }}
          onClick={() => {
            triggerSound('click');
            setActiveTab('new-order');
          }}
          title="Create New Bill (Ctrl+N)"
        >
          <span>+ New Bill</span>
          <span style={{ fontSize: '0.6875rem', opacity: 0.85, background: 'rgba(0,0,0,0.15)', padding: '1px 5px', borderRadius: '3px' }}>
            Ctrl+N
          </span>
        </button>

        {/* 5. User Profile Chip */}
        <div className="header-user-profile">
          <div className="user-text-meta">
            <span className="user-title">{currentUser?.name || 'Admin User'}</span>
            <span className="user-subtitle">Manager</span>
          </div>
          <div className="user-avatar-circle">
            <User size={18} />
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          className="header-icon-btn"
          style={{ width: '32px', height: '32px', border: 'none' }}
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
        >
          {soundEnabled ? <Volume2 size={16} style={{ color: '#10B981' }} /> : <VolumeX size={16} style={{ color: '#9CA3AF' }} />}
        </button>

        {/* Window controls for Desktop Electron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px', borderLeft: '1px solid #E5E7EB', paddingLeft: '8px' }}>
          <button
            onClick={handleMinimize}
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', borderRadius: '4px' }}
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={handleMaximize}
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', borderRadius: '4px' }}
            title="Maximize"
          >
            <Square size={11} />
          </button>
          <button
            onClick={handleClose}
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', borderRadius: '4px' }}
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
