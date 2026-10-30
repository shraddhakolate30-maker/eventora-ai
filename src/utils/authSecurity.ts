import crypto from 'crypto';

export const PASSWORD_SALT = 'eventora_secure_salt_2026';

/**
 * Derives a memory-hard scrypt hash with a cryptographically secure random 16-byte salt.
 * Output format: scrypt:<saltHex>:<derivedKeyHex>
 */
export function hashPasswordScrypt(
  password: string,
  salt: string = crypto.randomBytes(16).toString('hex')
): string {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derivedKey}`;
}

/**
 * Computes legacy salted SHA-256 hash for backward compatibility.
 */
export function hashPasswordLegacy(password: string): string {
  return crypto.createHash('sha256').update(password + PASSWORD_SALT).digest('hex');
}

/**
 * Returns true if the stored hash uses the legacy SHA-256 format.
 */
export function isLegacyHash(storedHash: string): boolean {
  if (!storedHash || typeof storedHash !== 'string') return false;
  return !storedHash.startsWith('scrypt:');
}

/**
 * Verifies a password against either a modern scrypt hash or a legacy SHA-256 hash.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  try {
    // 1. Modern scrypt format: scrypt:<salt>:<key>
    if (storedHash.startsWith('scrypt:')) {
      const parts = storedHash.split(':');
      if (parts.length !== 3) return false;
      const salt = parts[1];
      const expectedKeyHex = parts[2];
      const derivedKey = crypto.scryptSync(password, salt, 64);
      const expectedBuffer = Buffer.from(expectedKeyHex, 'hex');
      if (derivedKey.length !== expectedBuffer.length) return false;
      return crypto.timingSafeEqual(derivedKey, expectedBuffer);
    }

    // 2. Legacy SHA-256 format (64 hex characters)
    const legacyComputed = hashPasswordLegacy(password);
    const legacyBuffer = Buffer.from(legacyComputed, 'utf-8');
    const storedBuffer = Buffer.from(storedHash, 'utf-8');
    if (legacyBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(legacyBuffer, storedBuffer);
  } catch {
    return false;
  }
}
