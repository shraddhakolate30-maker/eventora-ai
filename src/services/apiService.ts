import { EventItem, GeneratedPlan, HistoryRecord, UserProfile, ProposedPlanUpdate } from '../types';

export interface ApiStatus {
  status: string;
  geminiConfigured: boolean;
  model: string;
  mode: 'live-gemini' | 'interactive-demo';
  database?: string;
  userAccounts?: number;
  eventsCount?: number;
  message: string;
}

const AUTH_TOKEN_KEY = 'eventora_auth_token';

export const ApiService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async getStatus(): Promise<ApiStatus> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('Status check failed');
      return await res.json();
    } catch {
      return {
        status: 'local-fallback',
        geminiConfigured: false,
        model: 'gemini-3.8-flash',
        mode: 'interactive-demo',
        message: 'Running in demo mode with local session storage.',
      };
    }
  },

  // -------------------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------------------
  async signup(name: string, email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign up');
    }

    this.setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }

    this.setToken(data.token);
    return data;
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.setToken(null);
    }
  },

  // -------------------------------------------------------------------------
  // EVENTS PERSISTENCE (SERVER-SIDE)
  // -------------------------------------------------------------------------
  async getEvents(): Promise<EventItem[]> {
    const res = await fetch('/api/events', {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch events from server');
    }
    return await res.json();
  },

  async getEventById(id: string): Promise<EventItem> {
    const res = await fetch(`/api/events/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Event not found');
    }
    return await res.json();
  },

  async createEvent(event: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to create event');
    }
    return await res.json();
  },

  async updateEvent(
    id: string,
    event: Partial<EventItem>,
    historyContext?: { actionType?: string; title?: string; summary?: string }
  ): Promise<EventItem> {
    const payload = {
      ...event,
      _historyActionType: historyContext?.actionType,
      _historyActionTitle: historyContext?.title,
      _historyActionSummary: historyContext?.summary,
    };

    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update event');
    }
    return await res.json();
  },

  async duplicateEvent(id: string): Promise<EventItem> {
    const res = await fetch(`/api/events/${id}/duplicate`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to duplicate event');
    }
    return await res.json();
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to delete event');
    }
  },

  // -------------------------------------------------------------------------
  // HISTORY AUDIT TRAIL
  // -------------------------------------------------------------------------
  async getEventHistory(eventId: string): Promise<HistoryRecord[]> {
    const res = await fetch(`/api/events/${eventId}/history`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  },

  async addEventHistory(
    eventId: string,
    actionType: HistoryRecord['actionType'],
    title: string,
    summary: string,
    details?: Record<string, any>
  ): Promise<HistoryRecord> {
    const res = await fetch(`/api/events/${eventId}/history`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ actionType, title, summary, details }),
    });
    if (!res.ok) {
      throw new Error('Failed to log event history');
    }
    return await res.json();
  },

  // -------------------------------------------------------------------------
  // AI ENGINE INTEGRATION
  // -------------------------------------------------------------------------
  async generatePlan(eventData: Partial<EventItem>): Promise<{
    success: boolean;
    source: string;
    plan: GeneratedPlan;
    notice?: string;
  }> {
    const res = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(eventData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate plan');
    }

    return await res.json();
  },

  async sendChatMessage(
    message: string,
    eventContext: any,
    conversationHistory: any[]
  ): Promise<{
    reply: string;
    source: string;
    proposedUpdate?: ProposedPlanUpdate;
    notice?: string;
  }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, eventContext, conversationHistory }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send message');
    }

    return await res.json();
  },

  async rescueBudget(
    event: EventItem,
    targetBudget: number,
    newGuests: number,
    priority: string
  ): Promise<{
    success: boolean;
    source: string;
    rescuePlan: any;
    notice?: string;
  }> {
    const res = await fetch('/api/ai/rescue', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ event, targetBudget, newGuests, priority }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to rescue budget');
    }

    return await res.json();
  },
};
