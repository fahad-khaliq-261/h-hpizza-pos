import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

export default function ManagerAuthModal() {
  const { managerAuthPending, verifyManagerPin } = useAuth();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!managerAuthPending) return null;

  const handleKeypad = (digit) => {
    setErrorMsg('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handleVerify(nextPin);
      }
    }
  };

  const handleClear = () => {
    setErrorMsg('');
    setPin('');
  };

  const handleVerify = async (pinToTest = pin) => {
    if (pinToTest.length !== 4) return;
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await verifyManagerPin(pinToTest);
      if (res.success) {
        managerAuthPending.onApproved(res.manager);
      } else {
        setErrorMsg(res.message || 'Invalid Manager PIN.');
        setPin('');
      }
    } catch {
      setErrorMsg('Verification failed.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={!!managerAuthPending}
      onClose={managerAuthPending.onCancelled}
      title="Manager Authorization Required"
      subtitle={`Action: ${managerAuthPending.actionName}`}
      maxWidth="420px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
          <button className="btn btn-secondary" onClick={managerAuthPending.onCancelled}>
            Cancel
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '12px', borderRadius: '50%', background: '#FEF2F2', color: '#DC2626' }}>
          <ShieldAlert size={28} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            This operation requires authorization from a Store Supervisor or Manager.
          </p>
        </div>

        {errorMsg && (
          <div style={{ width: '100%', padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* PIN Dots */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid #CBD5E1',
                backgroundColor: pin.length > idx ? 'var(--primary)' : '#F1F5F9'
              }}
            />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%', maxWidth: '240px' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(btn => (
            <button
              key={btn}
              type="button"
              onClick={() => {
                if (btn === 'C') handleClear();
                else if (btn === '⌫') setPin(prev => prev.slice(0, -1));
                else handleKeypad(btn);
              }}
              style={{
                height: '46px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: btn === 'C' ? '#FEE2E2' : '#FFFFFF',
                color: btn === 'C' ? '#DC2626' : 'var(--text-main)',
                fontSize: '1.125rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer'
              }}
            >
              {btn}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Hint: Enter Admin PIN (<code>1234</code>)
        </div>
      </div>
    </Modal>
  );
}
