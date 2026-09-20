import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  User,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Delete,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function LoginScreen() {
  const { loginWithPin, loginWithPassword, usersList } = useAuth();

  const [authMode, setAuthMode] = useState('pin'); // 'pin' | 'password'
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password form state
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('');

  const handleKeypadPress = (digit) => {
    setErrorMsg('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setPin('');
  };

  const submitPin = async (pinToVerify = pin) => {
    if (pinToVerify.length !== 4) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await loginWithPin(pinToVerify);
      if (!res.success) {
        setErrorMsg(res.message || 'Invalid PIN code');
        setPin('');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please try again.');
      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await loginWithPassword(identifier, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Invalid username or password');
      }
    } catch (err) {
      setErrorMsg('Login error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0F172A',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #1E293B 0%, #0F172A 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #C5301A, #E65100)',
            padding: '24px',
            color: '#FFFFFF',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>🍕</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            H&H Pizza Cafe
          </h2>
          <p style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
            Commercial POS & Billing Terminal
          </p>
        </div>

        {/* Tab switcher: PIN Pad vs Password */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F1F5F9', padding: '4px', margin: '16px 20px 0 20px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setAuthMode('pin');
              setErrorMsg('');
              setPin('');
            }}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authMode === 'pin' ? '#FFFFFF' : 'transparent',
              color: authMode === 'pin' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              boxShadow: authMode === 'pin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Cashier PIN Keypad
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setErrorMsg('');
            }}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authMode === 'password' ? '#FFFFFF' : 'transparent',
              color: authMode === 'password' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              boxShadow: authMode === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Admin / Manager Login
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px 24px 24px 24px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === 'pin' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* PIN display mask */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enter 4-Digit Terminal PIN
                </span>
                <div style={{ display: 'flex', gap: '14px', margin: '4px 0' }}>
                  {[0, 1, 2, 3].map(idx => (
                    <div
                      key={idx}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid #CBD5E1',
                        backgroundColor: pin.length > idx ? 'var(--primary)' : '#F1F5F9',
                        transform: pin.length > idx ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Touch PIN Keypad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', maxWidth: '280px' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(btn => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') handleClear();
                      else if (btn === '⌫') handleBackspace();
                      else handleKeypadPress(btn);
                    }}
                    style={{
                      height: '52px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      background: btn === 'C' ? '#FEE2E2' : btn === '⌫' ? '#F1F5F9' : '#FFFFFF',
                      color: btn === 'C' ? '#DC2626' : 'var(--text-main)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.1s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {/* Demo Hint Banner */}
              <div
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#92400E',
                  marginTop: '4px',
                  textAlign: 'center'
                }}
              >
                <div><strong>Admin PIN:</strong> <code style={{ fontSize: '0.875rem', fontWeight: 800 }}>1234</code></div>
              </div>
            </div>
          ) : (
            <form onSubmit={submitPasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="admin"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input font-mono"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                🔑 <strong>Admin Credentials:</strong> Username: <code>admin</code> | Password: <code>admin123</code>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
                style={{ marginTop: '6px' }}
              >
                <KeyRound size={16} />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Terminal'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
