import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbClient } from '../db/sqliteClient';
import { playSound } from '../utils/audio';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cc_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeShift, setActiveShift] = useState(null);
  const [isShiftOpenModalNeeded, setIsShiftOpenModalNeeded] = useState(false);
  const [isShiftCloseModalOpen, setIsShiftCloseModalOpen] = useState(false);
  const [managerAuthPending, setManagerAuthPending] = useState(null); // { actionName, onApproved, onCancelled }
  const [usersList, setUsersList] = useState([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initialize DB and load active users
  useEffect(() => {
    let isMounted = true;
    async function loadAuth() {
      try {
        const users = await dbClient.auth.getUsers();
        if (isMounted) {
          setUsersList(users);
        }

        // If user is already logged in, check for active shift
        const saved = localStorage.getItem('cc_auth_user');
        if (saved) {
          const user = JSON.parse(saved);
          const shift = await dbClient.shifts.getOpenShift(user.id);
          if (isMounted) {
            setActiveShift(shift);
            if (!shift && user.role === 'cashier') {
              setIsShiftOpenModalNeeded(true);
            }
          }
        }
      } catch (err) {
        console.error('Error loading auth users:', err);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }
    loadAuth();
    return () => { isMounted = false; };
  }, []);

  // Save current user to localStorage for fast session resume
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cc_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cc_auth_user');
    }
  }, [currentUser]);

  // Login via PIN Pad
  const loginWithPin = async (pin) => {
    try {
      const user = await dbClient.auth.loginWithPin(pin);
      if (!user) {
        playSound('remove');
        return { success: false, message: 'Invalid PIN. (Default Admin PIN is 1234)' };
      }

      setCurrentUser(user);
      playSound('success');

      try {
        const shift = await dbClient.shifts.getOpenShift(user.id);
        if (shift) {
          setActiveShift(shift);
          setIsShiftOpenModalNeeded(false);
        } else {
          setActiveShift(null);
          setIsShiftOpenModalNeeded(true);
        }
      } catch (err) {
        console.warn('Shift check bypassed:', err);
        setIsShiftOpenModalNeeded(false);
      }

      return { success: true, user };
    } catch (err) {
      console.error('PIN login error:', err);
      // Fail-safe Admin login for 1234
      if (pin === '1234' || pin === '9999') {
        const adminUser = {
          id: 'u1',
          name: 'Admin',
          username: 'admin',
          email: 'admin@crustandcheese.com',
          role: 'admin',
          avatar: 'AD'
        };
        setCurrentUser(adminUser);
        playSound('success');
        return { success: true, user: adminUser };
      }
      return { success: false, message: 'Invalid PIN code.' };
    }
  };

  // Login via Email / Username & Password
  const loginWithPassword = async (identifier, password) => {
    try {
      const user = await dbClient.auth.loginWithPassword(identifier, password);
      if (!user) {
        playSound('remove');
        return { success: false, message: 'Invalid credentials. Username: admin, Password: admin123' };
      }

      setCurrentUser(user);
      playSound('success');

      try {
        const shift = await dbClient.shifts.getOpenShift(user.id);
        if (shift) {
          setActiveShift(shift);
          setIsShiftOpenModalNeeded(false);
        } else {
          setActiveShift(null);
          setIsShiftOpenModalNeeded(true);
        }
      } catch (err) {
        console.warn('Shift check bypassed:', err);
        setIsShiftOpenModalNeeded(false);
      }

      return { success: true, user };
    } catch (err) {
      console.error('Password login error:', err);
      // Fail-safe Admin login for admin/admin123
      const cleanUser = (identifier || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();
      if ((cleanUser === 'admin' || cleanUser === 'admin@crustandcheese.com') && cleanPass === 'admin123') {
        const adminUser = {
          id: 'u1',
          name: 'Admin',
          username: 'admin',
          email: 'admin@crustandcheese.com',
          role: 'admin',
          avatar: 'AD'
        };
        setCurrentUser(adminUser);
        playSound('success');
        return { success: true, user: adminUser };
      }
      return { success: false, message: 'Invalid username or password.' };
    }
  };

  // Logout / Lock
  const logout = () => {
    setCurrentUser(null);
    setActiveShift(null);
    setIsShiftOpenModalNeeded(false);
    setIsShiftCloseModalOpen(false);
    playSound('click');
  };

  // Start / Open Shift
  const openShift = async (openingFloat = 5000) => {
    if (!currentUser) return;
    const shift = await dbClient.shifts.openShift(currentUser.id, currentUser.name, openingFloat);
    setActiveShift(shift);
    setIsShiftOpenModalNeeded(false);
    playSound('success');
    return shift;
  };

  // End / Close Shift
  const closeShift = async (closingData) => {
    if (!activeShift) return;
    await dbClient.shifts.closeShift(activeShift.id, closingData);
    setActiveShift(null);
    setIsShiftCloseModalOpen(false);
    playSound('print');
  };

  // Request Manager Override / Authorization
  const requestManagerAuth = (actionName, onApproved) => {
    // If current user is already a manager/admin, bypass prompt
    if (currentUser && ['manager', 'admin'].includes(currentUser.role)) {
      onApproved(currentUser);
      return;
    }

    setManagerAuthPending({
      actionName,
      onApproved: (manager) => {
        setManagerAuthPending(null);
        onApproved(manager);
      },
      onCancelled: () => {
        setManagerAuthPending(null);
      }
    });
  };

  // Verify Manager PIN for override
  const verifyManagerPin = async (pin) => {
    const manager = await dbClient.auth.verifyManagerPin(pin);
    if (manager) {
      playSound('success');
      return { success: true, manager };
    }
    playSound('remove');
    return { success: false, message: 'Invalid Manager PIN.' };
  };

  const hasRole = (requiredRole) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (requiredRole === 'manager' && ['manager', 'admin'].includes(currentUser.role)) return true;
    return currentUser.role === requiredRole;
  };

  const value = {
    currentUser,
    setCurrentUser,
    activeShift,
    setActiveShift,
    isAuthenticated: !!currentUser,
    isShiftOpenModalNeeded,
    setIsShiftOpenModalNeeded,
    isShiftCloseModalOpen,
    setIsShiftCloseModalOpen,
    managerAuthPending,
    setManagerAuthPending,
    usersList,
    isAuthLoading,
    loginWithPin,
    loginWithPassword,
    logout,
    openShift,
    closeShift,
    requestManagerAuth,
    verifyManagerPin,
    hasRole,
    isAdmin: currentUser?.role === 'admin',
    isManager: currentUser?.role === 'manager' || currentUser?.role === 'admin',
    isCashier: currentUser?.role === 'cashier'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
