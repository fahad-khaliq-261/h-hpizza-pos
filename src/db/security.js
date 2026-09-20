// Password and PIN Hashing Security Layer
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a 4-digit PIN code
 */
export function hashPin(pin) {
  return bcrypt.hashSync(pin.toString(), SALT_ROUNDS);
}

/**
 * Verify a 4-digit PIN against its hash
 */
export function verifyPin(pin, hash) {
  if (!pin || !hash) return false;
  try {
    return bcrypt.compareSync(pin.toString(), hash);
  } catch (err) {
    console.error('PIN verification error:', err);
    return false;
  }
}

/**
 * Hash a password
 */
export function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
