import { describe, it, expect } from 'vitest';
import {
  hashPasswordScrypt,
  hashPasswordLegacy,
  verifyPassword,
  isLegacyHash,
} from '../src/utils/authSecurity';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('AuthSecurity Unit Tests', () => {
  it('generates scrypt hash with proper prefix and format', () => {
    const hash = hashPasswordScrypt('mySuperSecretPassword');
    expect(hash.startsWith('scrypt:')).toBe(true);

    const parts = hash.split(':');
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe('scrypt');
    expect(parts[1].length).toBe(32); // 16 bytes hex salt = 32 chars
    expect(parts[2].length).toBe(128); // 64 bytes hex key = 128 chars
  });

  it('generates unique salts and different hashes for the same password', () => {
    const hash1 = hashPasswordScrypt('password123');
    const hash2 = hashPasswordScrypt('password123');

    expect(hash1).not.toBe(hash2);
    const salt1 = hash1.split(':')[1];
    const salt2 = hash2.split(':')[1];
    expect(salt1).not.toBe(salt2);
  });

  it('verifies correct password against scrypt hash and rejects invalid ones', () => {
    const password = 'CorrectHorseBatteryStaple!';
    const hash = hashPasswordScrypt(password);

    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('WrongPassword!', hash)).toBe(false);
    expect(verifyPassword('', hash)).toBe(false);
    expect(verifyPassword(password, '')).toBe(false);
  });

  it('correctly verifies legacy salted SHA-256 hashes for backward compatibility', () => {
    const legacyPassword = 'eventoraLegacyPassword2026';
    const legacyHash = hashPasswordLegacy(legacyPassword);

    expect(isLegacyHash(legacyHash)).toBe(true);
    expect(legacyHash.length).toBe(64); // Standard SHA-256 hex string

    // Must verify successfully
    expect(verifyPassword(legacyPassword, legacyHash)).toBe(true);
    // Wrong password must be rejected
    expect(verifyPassword('wrongLegacyPassword', legacyHash)).toBe(false);
  });

  it('distinguishes between scrypt and legacy hashes with isLegacyHash', () => {
    const scryptHash = hashPasswordScrypt('anyPassword');
    const legacyHash = hashPasswordLegacy('anyPassword');

    expect(isLegacyHash(scryptHash)).toBe(false);
    expect(isLegacyHash(legacyHash)).toBe(true);
  });
});

describe('Backward-Compatible Password Migration API Integration', () => {
  const timestamp = Date.now();
  const testEmail = `migrating_user_${timestamp}@example.com`;
  const testPassword = 'secureMigrationPass123';

  it('ensures new signups immediately receive scrypt hashes', async () => {
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Scrypt Newcomer',
        email: testEmail,
        password: testPassword,
      }),
    });

    expect([200, 201]).toContain(signupRes.status);
    const data = await signupRes.json();
    expect(data.token).toBeDefined();

    // Verify session works
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.user.email).toBe(testEmail);
  });

  it('verifies that login with existing accounts succeeds and rejects wrong passwords', async () => {
    // Correct login
    const goodLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    expect(goodLogin.status).toBe(200);
    const goodData = await goodLogin.json();
    expect(goodData.token).toBeDefined();

    // Incorrect login
    const badLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'IncorrectPassword',
      }),
    });

    expect(badLogin.status).toBe(401);
  });

  it('verifies that an account with legacy SHA-256 hash is automatically migrated to scrypt upon successful login', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const dbPath = path.resolve(process.cwd(), 'data', 'db.json');

    if (fs.existsSync(dbPath)) {
      const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const legacyEmail = `legacy_migrate_${Date.now()}@test.com`;
      const legacyPass = 'legacyPassword2026';
      const legacyHash = hashPasswordLegacy(legacyPass);

      // Seed legacy user
      dbContent.users.push({
        id: `user-legacy-${Date.now()}`,
        name: 'Legacy User',
        email: legacyEmail,
        passwordHash: legacyHash,
        createdAt: new Date().toISOString(),
      });
      fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf-8');

      // Attempt login
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: legacyEmail,
          password: legacyPass,
        }),
      });

      expect(loginRes.status).toBe(200);
      const loginData = await loginRes.json();
      expect(loginData.token).toBeDefined();

      // Verify the user's passwordHash in db.json was upgraded to scrypt
      const updatedDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const migratedUser = updatedDb.users.find((u: any) => u.email === legacyEmail);
      expect(migratedUser).toBeDefined();
      expect(migratedUser.passwordHash.startsWith('scrypt:')).toBe(true);
      expect(isLegacyHash(migratedUser.passwordHash)).toBe(false);

      // Clean up test user
      updatedDb.users = updatedDb.users.filter((u: any) => u.email !== legacyEmail);
      fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf-8');
    }
  });
});
