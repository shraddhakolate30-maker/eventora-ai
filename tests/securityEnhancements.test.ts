import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('Security Enhancements (S-1, S-2, S-3, S-4, S-5)', () => {
  // ---------------------------------------------------------------------------
  // S-2: UNAUTHENTICATED DEMO-USER ACCESS CONTROL
  // ---------------------------------------------------------------------------
  describe('S-2: Unauthenticated Demo Access Scoping', () => {
    it('allows read-only GET requests to fall back to demo event without a token', async () => {
      const res = await fetch(`${BASE_URL}/api/events`, {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const events = await res.json();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('strictly rejects unauthenticated POST event creation with 401', async () => {
      const res = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Unauthorized Event',
          type: 'Birthday Party',
          budget: 50000,
          guestCount: 20,
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Authentication required');
    });

    it('strictly rejects unauthenticated PUT event update with 401', async () => {
      const res = await fetch(`${BASE_URL}/api/events/demo-bday-1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hacked Demo Event',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('strictly rejects unauthenticated DELETE event with 401', async () => {
      const res = await fetch(`${BASE_URL}/api/events/demo-bday-1`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // S-1: IP-BASED RATE LIMITING
  // ---------------------------------------------------------------------------
  describe('S-1: IP-Based Rate Limiting on Auth Routes', () => {
    const testIp = '198.51.100.42'; // Simulated client IP via X-Forwarded-For

    it('enforces rate limit of 5 login attempts per minute per IP', async () => {
      // Send 5 rapid login attempts
      for (let i = 1; i <= 5; i++) {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': testIp,
          },
          body: JSON.stringify({
            email: 'rate_test@example.com',
            password: 'wrong_password',
          }),
        });

        // First 5 attempts should return 401 (invalid credentials) rather than 429
        expect(res.status).toBe(401);
      }

      // The 6th attempt must be blocked with HTTP 429 (Too Many Requests)
      const blockedRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': testIp,
        },
        body: JSON.stringify({
          email: 'rate_test@example.com',
          password: 'wrong_password',
        }),
      });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get('Retry-After')).toBeDefined();
      const data = await blockedRes.json();
      expect(data.error).toContain('Too many login attempts');
    });

    it('enforces rate limit of 3 signup attempts per minute per IP', async () => {
      const signupIp = '198.51.100.88';

      // Send 3 signup attempts
      for (let i = 1; i <= 3; i++) {
        const res = await fetch(`${BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': signupIp,
          },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `ratelimited_signup_${i}_${Date.now()}@example.com`,
            password: 'securePass123',
          }),
        });

        expect([200, 201]).toContain(res.status);
      }

      // The 4th signup attempt must be blocked with HTTP 429
      const blockedRes = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': signupIp,
        },
        body: JSON.stringify({
          name: 'Blocked User',
          email: `blocked_signup_${Date.now()}@example.com`,
          password: 'securePass123',
        }),
      });

      expect(blockedRes.status).toBe(429);
      const data = await blockedRes.json();
      expect(data.error).toContain('Too many signup attempts');
    });
  });

  // ---------------------------------------------------------------------------
  // S-3: 30-DAY SESSION EXPIRATION & PRUNING
  // ---------------------------------------------------------------------------
  describe('S-3: Session Expiration & Cleanup', () => {
    it('rejects an expired session token (>30 days old) with 401', async () => {
      const dbPath = path.resolve(process.cwd(), 'data', 'db.json');
      const expiredToken = `token-expired-test-${Date.now()}`;

      // Insert an expired session into db.json (35 days old)
      const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();

      dbContent.sessions.push({
        token: expiredToken,
        userId: 'user-demo-1',
        createdAt: thirtyFiveDaysAgo,
      });
      fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf-8');

      // Attempt to access protected endpoint with expired token
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
          'x-test-bypass': 'true',
        },
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('expired');
    });
  });

  // ---------------------------------------------------------------------------
  // S-4: SAFE HTTP DEFENSIVE HEADERS
  // ---------------------------------------------------------------------------
  describe('S-4: Safe HTTP Security Headers', () => {
    it('sets defensive headers without breaking AI Studio iframe preview', async () => {
      const res = await fetch(`${BASE_URL}/api/status`);
      expect(res.status).toBe(200);

      // Verify defensive security headers
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block');

      // Verify that X-Frame-Options is NOT set to DENY or SAMEORIGIN (which would break AI Studio)
      const frameOptions = res.headers.get('X-Frame-Options');
      expect(frameOptions).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // S-5: EXPRESS JSON PAYLOAD SIZE LIMIT (1MB)
  // ---------------------------------------------------------------------------
  describe('S-5: 1MB Request Payload Limit', () => {
    it('rejects oversized JSON payloads (>1MB) with HTTP 413 Payload Too Large', async () => {
      // Construct a payload slightly exceeding 1MB (1,100,000 bytes)
      const largeString = 'a'.repeat(1100000);

      const res = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-demo-session-shraddha',
          'x-test-bypass': 'true',
        },
        body: JSON.stringify({
          name: 'Oversized Payload Test',
          junk: largeString,
        }),
      });

      expect(res.status).toBe(413);
    });

    it('accepts legitimate event payloads under 1MB successfully', async () => {
      const res = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-demo-session-shraddha',
          'x-test-bypass': 'true',
        },
        body: JSON.stringify({
          name: 'Legitimate Standard Size Event',
          type: 'Birthday Party',
          date: '2026-12-01',
          budget: 50000,
          guestCount: 30,
        }),
      });

      expect([200, 201]).toContain(res.status);
      const created = await res.json();
      expect(created.id).toBeDefined();

      // Clean up the test event
      await fetch(`${BASE_URL}/api/events/${created.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer token-demo-session-shraddha',
          'x-test-bypass': 'true',
        },
      });
    });
  });
});
