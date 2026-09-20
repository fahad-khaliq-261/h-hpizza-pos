import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePOS } from '../../context/POSContext';
import { UserCheck, Plus, Shield, Clock, KeyRound } from 'lucide-react';
import Modal from '../common/Modal';

export default function EmployeesView() {
  const { usersList } = useAuth();
  const { triggerSound, addToast } = usePOS();
  const [employees, setEmployees] = useState([
    { id: '1', name: 'Ahmad Khan', role: 'Store Manager', pin: '1234', shift: 'Morning Shift', email: 'ahmad@pizzapos.com', status: 'Active' },
    { id: '2', name: 'Ali Raza', role: 'Lead Cashier', pin: '1234', shift: 'Evening Shift', email: 'ali@pizzapos.com', status: 'Active' },
    { id: '3', name: 'Sara Malik', role: 'Kitchen Supervisor', pin: '5678', shift: 'All-Day', email: 'sara@pizzapos.com', status: 'Active' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cashier');
  const [pin, setPin] = useState('1234');

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!name) return;
    const newEmp = {
      id: Date.now().toString(),
      name,
      role,
      pin,
      shift: 'Standard Shift',
      email: `${name.toLowerCase().replace(/\s+/g, '')}@pizzapos.com`,
      status: 'Active'
    };
    setEmployees(prev => [...prev, newEmp]);
    setIsModalOpen(false);
    setName('');
    triggerSound('success');
    addToast(`Employee "${name}" registered`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>Staff & Employees</h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '2px' }}>
            Manage staff PINs, permissions, and shift schedules
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
        {employees.map((emp) => (
          <div key={emp.id} className="pos-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF0E8', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem' }}>
                {emp.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>{emp.name}</h3>
                <span className="badge badge-primary" style={{ fontSize: '0.6875rem', marginTop: '2px' }}>
                  {emp.role}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', borderTop: '1px solid #F3F4F6', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>PIN Code:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>•••• ({emp.pin})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Shift:</span>
                <span style={{ fontWeight: 600 }}>{emp.shift}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Status:</span>
                <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>{emp.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Employee"
          maxWidth="440px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddEmployee}>Save Employee</button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Usman Tariq"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="Cashier">Cashier</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Kitchen Supervisor">Kitchen Supervisor</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Terminal PIN</label>
              <input
                type="text"
                className="form-input font-mono"
                value={pin}
                onChange={e => setPin(e.target.value)}
                maxLength={4}
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
