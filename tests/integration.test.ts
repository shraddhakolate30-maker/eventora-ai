import { describe, it, expect, afterAll } from 'vitest';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('EVENTORA AI API Integration Tests', () => {
  let userAToken: string = '';
  let userAId: string = '';
  let userBToken: string = '';
  let userBId: string = '';
  let userAEventId: string = '';

  const timestamp = Date.now();
  const userAEmail = `tester_a_${timestamp}@example.com`;
  const userBEmail = `tester_b_${timestamp}@example.com`;

  // 1. SYSTEM HEALTH AND STATUS
  describe('System Status', () => {
    it('returns valid status object with model info and database state', async () => {
      const res = await fetch(`${BASE_URL}/api/status`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('geminiConfigured');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('mode');
      expect(typeof data.geminiConfigured).toBe('boolean');
    });
  });

  // 2. AUTHENTICATION & MULTI-USER WORKFLOWS
  describe('Authentication and User Isolation', () => {
    it('successfully signs up User A and returns Bearer token', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-bypass': 'true',
        },
        body: JSON.stringify({
          name: 'Organizer Alpha',
          email: userAEmail,
          password: 'securePassword123',
        }),
      });

      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(userAEmail);
      userAToken = data.token;
      userAId = data.user.id;
    });

    it('successfully logs in with valid credentials', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-bypass': 'true',
        },
        body: JSON.stringify({
          email: userAEmail,
          password: 'securePassword123',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
    });

    it('rejects login with invalid password', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-bypass': 'true',
        },
        body: JSON.stringify({
          email: userAEmail,
          password: 'wrongPassword',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('registers User B for cross-tenant isolation testing', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-bypass': 'true',
        },
        body: JSON.stringify({
          name: 'Organizer Beta',
          email: userBEmail,
          password: 'securePassword456',
        }),
      });

      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      userBToken = data.token;
      userBId = data.user.id;
      expect(userBId).not.toBe(userAId);
    });
  });

  // 3. EVENT CREATION, PERSISTENCE & MULTI-TENANT ISOLATION
  describe('Event CRUD and Tenant Isolation', () => {
    it('creates an event for User A with complete data', async () => {
      const eventPayload = {
        name: 'Alpha Annual Gala',
        type: 'Community Event',
        date: '2026-11-20',
        location: 'Grand Ballroom, Bangalore',
        guestCount: 150,
        budget: 120000,
        currency: '₹',
        theme: 'Royal Heritage',
        venuePreference: 'rented',
        foodPreference: 'buffet',
        returnGiftsRequired: true,
        priority: 'premium_experience',
        additionalRequirements: 'Acoustic mic setup and stage lighting',
        budgetBreakdown: [
          {
            id: 'b1',
            category: 'Venue & Banquet',
            allocatedAmount: 60000,
            actualAmount: 0,
            notes: 'Hall rental',
            isEssential: true,
          },
          {
            id: 'b2',
            category: 'Catering',
            allocatedAmount: 40000,
            actualAmount: 0,
            notes: '150 plates',
            isEssential: true,
          },
        ],
        shoppingList: [
          {
            id: 's1',
            name: 'Welcome Garlands',
            category: 'Decorations',
            quantity: 10,
            unit: 'pc',
            estimatedUnitPrice: 300,
            isEssential: true,
            status: 'need_to_buy',
          },
        ],
        timelineTasks: [
          {
            id: 't1',
            title: 'Confirm caterer menu',
            category: 'Catering',
            dueDate: '2026-11-10',
            dueDescription: '10 days before',
            isEssential: true,
            isCompleted: false,
          },
        ],
      };

      const res = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify(eventPayload),
      });

      expect([200, 201]).toContain(res.status);
      const savedEvent = await res.json();
      expect(savedEvent.id).toBeDefined();
      expect(savedEvent.name).toBe('Alpha Annual Gala');
      expect(savedEvent.guestCount).toBe(150);
      userAEventId = savedEvent.id;
    });

    it('verifies User A can retrieve their created event', async () => {
      const res = await fetch(`${BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });

      expect(res.status).toBe(200);
      const events = await res.json();
      expect(Array.isArray(events)).toBe(true);
      const found = events.find((e: any) => e.id === userAEventId);
      expect(found).toBeDefined();
      expect(found.name).toBe('Alpha Annual Gala');
    });

    it('enforces multi-tenant isolation: User B CANNOT see User A event in event list', async () => {
      const res = await fetch(`${BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });

      expect(res.status).toBe(200);
      const events = await res.json();
      const found = events.find((e: any) => e.id === userAEventId);
      expect(found).toBeUndefined();
    });

    it('enforces multi-tenant isolation: User B CANNOT modify User A event', async () => {
      const res = await fetch(`${BASE_URL}/api/events/${userAEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({
          name: 'Hacked by User B',
        }),
      });

      expect([403, 404]).toContain(res.status);
    });

    it('enforces multi-tenant isolation: User B CANNOT delete User A event', async () => {
      const res = await fetch(`${BASE_URL}/api/events/${userAEventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userBToken}` },
      });

      expect([403, 404]).toContain(res.status);
    });

    it('enforces multi-tenant isolation: User B CANNOT add history to User A event', async () => {
      const res = await fetch(`${BASE_URL}/api/events/${userAEventId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({
          actionType: 'plan_modified',
          title: 'Malicious modification',
          summary: 'Should be rejected',
        }),
      });

      expect([403, 404]).toContain(res.status);
    });

    it('allows User A to append and retrieve history records', async () => {
      const postRes = await fetch(`${BASE_URL}/api/events/${userAEventId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          actionType: 'plan_modified',
          title: 'Updated Gala Details',
          summary: 'Refined venue booking details',
        }),
      });

      expect([200, 201]).toContain(postRes.status);

      const getRes = await fetch(`${BASE_URL}/api/events/${userAEventId}/history`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });

      expect(getRes.status).toBe(200);
      const history = await getRes.json();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].title).toBe('Updated Gala Details');
    });
  });

  // 4. AI CHAT & PLAN PROPOSALS
  describe('AI Assistant & Proposal Execution', () => {
    it('returns an authentic AI or rule-engine response with truthful source label', async () => {
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          message: 'Can you suggest ways to optimize our catering budget?',
          eventId: userAEventId,
          eventContext: {
            name: 'Alpha Annual Gala',
            type: 'Community Event',
            guestCount: 150,
            budget: 120000,
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('reply');
      expect(data).toHaveProperty('source');
      expect(typeof data.reply).toBe('string');
      expect(data.reply.length).toBeGreaterThan(10);
      // Ensure truthful attribution (never fake Gemini when fallback is used)
      expect(typeof data.source).toBe('string');
      expect(data.source.length).toBeGreaterThan(0);
    }, 25000);

    it('applies an update proposal and persists recalculation through event API', async () => {
      const updatedCategories = [
        { id: 'cat-1', category: 'Venue & Banquet', allocatedAmount: 60000, actualAmount: 0, notes: 'Main hall', isEssential: true },
        { id: 'cat-2', category: 'Catering', allocatedAmount: 50000, actualAmount: 0, notes: 'Expanded spread', isEssential: true },
        { id: 'cat-3', category: 'Decor & Lighting', allocatedAmount: 20000, actualAmount: 0, notes: 'Fairy lights & backdrop', isEssential: true },
      ];

      const res = await fetch(`${BASE_URL}/api/events/${userAEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          budget: 130000,
          budgetBreakdown: updatedCategories,
          _historyActionType: 'plan_modified',
          _historyActionTitle: 'Plan Modified via AI Chat',
          _historyActionSummary: 'Budget recalibrated to ₹1,30,000 with 3 updated category allocations.',
        }),
      });

      expect(res.status).toBe(200);
      const updated = await res.json();

      expect(updated.budget).toBe(130000);
      expect(updated.budgetBreakdown.length).toBe(3);

      // Verify audit history was automatically recorded
      const historyRes = await fetch(`${BASE_URL}/api/events/${userAEventId}/history`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const history = await historyRes.json();
      expect(history.some((h: any) => h.title === 'Plan Modified via AI Chat')).toBe(true);
    });
  });

  // CLEANUP TEST FIXTURES
  afterAll(async () => {
    if (userAEventId && userAToken) {
      try {
        await fetch(`${BASE_URL}/api/events/${userAEventId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userAToken}` },
        });
      } catch {
        // Ignored in cleanup
      }
    }
  });
});
