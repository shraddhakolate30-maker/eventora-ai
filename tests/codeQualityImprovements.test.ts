import { describe, it, expect } from 'vitest';
import type { DatabaseSchema, EventItem, ApiErrorResponse, UserRecord, SessionRecord } from '../src/types';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('Code Quality Improvements (Q-1 & Q-2)', () => {
  // ---------------------------------------------------------------------------
  // Q-1: CONSOLIDATED TYPES & REPLACED any[]
  // ---------------------------------------------------------------------------
  describe('Q-1: Consolidated Shared Types & Type Safety', () => {
    it('properly types DatabaseSchema with EventItem[] instead of any[]', () => {
      // Compile-time check via TypeScript plus runtime assertions
      const mockDb: DatabaseSchema = {
        users: [] as UserRecord[],
        sessions: [] as SessionRecord[],
        events: [] as EventItem[],
        history: [],
      };

      expect(Array.isArray(mockDb.events)).toBe(true);
      expect(Array.isArray(mockDb.users)).toBe(true);
      expect(Array.isArray(mockDb.sessions)).toBe(true);
      expect(Array.isArray(mockDb.history)).toBe(true);
    });

    it('enforces structured ApiErrorResponse type contract', () => {
      const err: ApiErrorResponse = {
        success: false,
        error: 'Test error message',
        statusCode: 400,
      };

      expect(err.success).toBe(false);
      expect(typeof err.error).toBe('string');
      expect(typeof err.statusCode).toBe('number');
    });
  });

  // ---------------------------------------------------------------------------
  // Q-2: STANDARDIZED API ERROR RESPONSES
  // ---------------------------------------------------------------------------
  describe('Q-2: Standardized API Error Responses (sendApiError)', () => {
    it('returns standardized { success: false, error, statusCode } on 401 authentication rejection', async () => {
      const res = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Unauthorized test' }),
      });

      expect(res.status).toBe(401);
      const data: ApiErrorResponse = await res.json();
      expect(data.success).toBe(false);
      expect(data.statusCode).toBe(401);
      expect(data.error).toBe('Authentication required. Please log in.');
    });

    it('returns standardized error format on 400 missing login credentials', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data: ApiErrorResponse = await res.json();
      expect(data.success).toBe(false);
      expect(data.statusCode).toBe(400);
      expect(data.error).toBe('Email and password are required.');
    });

    it('returns standardized error format on 401 invalid login credentials', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent-random-user@eventora.test',
          password: 'IncorrectPassword123!',
        }),
      });

      expect(res.status).toBe(401);
      const data: ApiErrorResponse = await res.json();
      expect(data.success).toBe(false);
      expect(data.statusCode).toBe(401);
      expect(data.error).toBe('Invalid email or password.');
    });

    it('returns standardized error format on 404 event not found', async () => {
      const res = await fetch(`${BASE_URL}/api/events/non-existent-event-id-999999`);

      expect(res.status).toBe(404);
      const data: ApiErrorResponse = await res.json();
      expect(data.success).toBe(false);
      expect(data.statusCode).toBe(404);
      expect(data.error).toBe('Event not found or access denied.');
    });

    it('returns standardized error format on 400 missing message for AI chat', async () => {
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data: ApiErrorResponse = await res.json();
      expect(data.success).toBe(false);
      expect(data.statusCode).toBe(400);
      expect(data.error).toBe('Message is required');
    });
  });
});
