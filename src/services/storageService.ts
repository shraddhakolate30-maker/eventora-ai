import { EventItem, UserProfile } from '../types';
import { ApiService } from './apiService';

const STORAGE_KEY_EVENTS = 'eventora_events_v1';
const STORAGE_KEY_ACTIVE_ID = 'eventora_active_event_id';
const STORAGE_KEY_USER = 'eventora_user_profile';

const INITIAL_DEMO_EVENTS: EventItem[] = [
  {
    id: 'demo-bday-1',
    name: 'Aarav’s 1st Birthday Safari Adventure',
    type: 'Birthday Party',
    date: '2026-11-20',
    location: 'Bangalore, Karnataka',
    guestCount: 45,
    budget: 45000,
    currency: 'INR',
    theme: 'Pastel Jungle Safari',
    venuePreference: 'home',
    foodPreference: 'veg_nonveg',
    returnGiftsRequired: true,
    priority: 'decorations',
    additionalRequirements: 'Kids play mat area, pastel balloon arch for cake cutting, customized baby photo milestones wall.',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-25T14:30:00Z',
    plan: {
      overview: 'Delightful 1st birthday milestone celebration blending joyful animal safari motifs with comfortable home hospitality for 45 family and close friends.',
      conceptTheme: 'Pastel Jungle Safari (Sage green, baby peach, soft gold, warm white)',
      colorPalette: ['#10B981', '#F59E0B', '#EC4899', '#8B5CF6'],
      budgetBreakdown: [
        { category: 'Food & Catering', allocatedAmount: 18000, notes: 'Lunch buffet with live starter counter + mocktail cooler' },
        { category: 'Decorations & Styling', allocatedAmount: 9500, notes: 'Safari photo backdrop, balloon garland, milestones board' },
        { category: 'Cake & Desserts', allocatedAmount: 3500, notes: '2kg customized fondant animal cake + cupcakes' },
        { category: 'Photography & Video', allocatedAmount: 5000, notes: '3-hour candid coverage & digital high-res edits' },
        { category: 'Return Gifts', allocatedAmount: 3600, notes: 'Wooden animal puzzle boxes for 25 kids/families' },
        { category: 'Entertainment & Music', allocatedAmount: 2000, notes: 'Kids games host & speaker setup' },
        { category: 'Miscellaneous & Buffer', allocatedAmount: 3400, notes: 'Extra ice, disposables, sudden parking tips' },
      ],
      timeline: [
        { timeframe: '3 Weeks Prior', milestones: ['Finalize caterer menu & cake design', 'Confirm custom safari cutout prints'] },
        { timeframe: '1 Week Prior', milestones: ['Assemble kid-friendly return gift kits', 'Confirm final guest RSVP list (45 count)'] },
        { timeframe: '1 Day Prior', milestones: ['Living room furniture rearrangement & cleaning', 'Pick up party lights and favor bags'] },
        { timeframe: 'Event Day Morning', milestones: ['Balloon stylist setup (9:00 AM)', 'Food delivery check (11:30 AM)', 'Cake arrival & guest welcome (12:30 PM)'] },
      ],
      tasks: [
        { title: 'Finalize customized 2kg safari cake', category: 'Catering', dueDescription: '10 days before', isEssential: true },
        { title: 'Order wooden animal toys for return gifts', category: 'Shopping', dueDescription: '7 days before', isEssential: true },
        { title: 'Print milestone photo chart (1-12 months)', category: 'Decor', dueDescription: '4 days before', isEssential: false },
        { title: 'Arrange extra fold-out chairs for senior relatives', category: 'Venue', dueDescription: '2 days before', isEssential: true },
      ],
      decorations: [
        { title: 'Organic Biodegradable Balloon Garland', description: 'Sage green, chrome gold, and sand beige balloons framing the dessert table.', isDiy: true },
        { title: 'Cardboard Animal Cutouts & Faux Ivy', description: 'Giraffe, lion cub, and elephant cutouts nested with faux greenery vines.', isDiy: true },
      ],
      foodMenu: [
        { course: 'Welcome Sips', items: ['Watermelon Mint Cooler', 'Cold Kokum Spritz'] },
        { course: 'Finger Food & Starters', items: ['Corn Cheese Balls', 'Paneer Tikka Bites', 'Mini Chicken Sliders'] },
        { course: 'Main Lunch Feast', items: ['Awadhi Vegetable Biryani & Mirchi Ka Salan', 'Paneer Butter Masala with Laccha Paratha', 'Dal Makhani & Jeera Rice'] },
        { course: 'Desserts', items: ['Custom Safari Cake', 'Gajar Ka Halwa with Pistachio Slivers'] },
      ],
      activities: [
        { name: 'Pin the Tail on the Zebra', description: 'Safe felt board game for toddlers and children.', duration: '20 mins' },
        { name: 'Family Milestone Trivia', description: 'Fun 5-question speed quiz on baby Aarav’s funny first-year quirks.', duration: '15 mins' },
      ],
      shoppingList: [
        { name: 'Sage Green & Gold Balloon Arch Kit (120 pcs)', category: 'Decorations', quantity: 1, unit: 'kit', estimatedUnitPrice: 599, isEssential: true },
        { name: 'Eco-Friendly Areca Palm Plates (10 inch, 50 pk)', category: 'Tableware', quantity: 1, unit: 'pack', estimatedUnitPrice: 480, isEssential: true },
        { name: 'Wooden Toddler Safari Animal Puzzles (20 pk)', category: 'Return Gifts', quantity: 1, unit: 'carton', estimatedUnitPrice: 2600, isEssential: true },
        { name: 'Fairy Lights Warm White (25m roll)', category: 'Lighting', quantity: 2, unit: 'rolls', estimatedUnitPrice: 249, isEssential: true },
      ],
      returnGifts: [
        { name: 'Wooden Toddler Educational Safari Puzzle', category: 'Kids', estimatedCostPerGift: 130, description: 'Non-toxic sustainable puzzle with canvas draw-string bag.', isBulkFriendly: true },
        { name: 'Artisan Honey Mini Jar with Wooden Dipper', category: 'Family', estimatedCostPerGift: 140, description: '100g raw wild honey with festive custom tag.', isBulkFriendly: true },
      ],
      budgetSavingTips: [
        'Hosting at home saved approx ₹15,000 in venue hall rental fees.',
        'DIY assembling the balloon garland with an electric pump saved ₹3,000 over professional decorator charges.',
      ],
      assumptions: [
        'Home has sufficient parking/valet space for 12 cars.',
        'Estimates reflect local vendor pricing in Bangalore East.',
      ],
      source: 'eventora-engine',
    },
    budgetBreakdown: [
      { id: 'b-1', category: 'Food & Catering', allocatedAmount: 18000, actualAmount: 17500, notes: 'Lunch buffet booked with local caterer', isEssential: true },
      { id: 'b-2', category: 'Decorations & Styling', allocatedAmount: 9500, actualAmount: 9200, notes: 'Balloons, signage, and props', isEssential: true },
      { id: 'b-3', category: 'Cake & Desserts', allocatedAmount: 3500, actualAmount: 3600, notes: 'Custom fondant cake', isEssential: true },
      { id: 'b-4', category: 'Photography & Video', allocatedAmount: 5000, actualAmount: 5000, notes: 'Candid photographer friend deposit', isEssential: false },
      { id: 'b-5', category: 'Return Gifts', allocatedAmount: 3600, actualAmount: 3200, notes: 'Puzzle sets bought wholesale', isEssential: true },
      { id: 'b-6', category: 'Entertainment & Music', allocatedAmount: 2000, actualAmount: 1800, notes: 'Bluetooth party speaker rental', isEssential: false },
      { id: 'b-7', category: 'Miscellaneous & Buffer', allocatedAmount: 3400, actualAmount: 1500, notes: 'Ice, mineral water jars, spare tissues', isEssential: true },
    ],
    shoppingList: [
      { id: 's-1', name: 'Sage Green & Gold Balloon Arch Kit (120 pcs)', category: 'Decorations', quantity: 1, unit: 'kit', estimatedUnitPrice: 599, isEssential: true, status: 'purchased' },
      { id: 's-2', name: 'Eco-Friendly Areca Palm Plates (10 inch, 50 pk)', category: 'Tableware', quantity: 1, unit: 'pack', estimatedUnitPrice: 480, isEssential: true, status: 'purchased' },
      { id: 's-3', name: 'Wooden Toddler Safari Animal Puzzles (20 pk)', category: 'Return Gifts', quantity: 1, unit: 'carton', estimatedUnitPrice: 2600, isEssential: true, status: 'purchased' },
      { id: 's-4', name: 'Fairy Lights Warm White (25m roll)', category: 'Lighting', quantity: 2, unit: 'rolls', estimatedUnitPrice: 249, isEssential: true, status: 'shortlisted' },
      { id: 's-5', name: 'Kraft Paper Goodie Bags with Handles (30 pk)', category: 'Party Supplies', quantity: 1, unit: 'pack', estimatedUnitPrice: 320, isEssential: true, status: 'need_to_buy' },
      { id: 's-6', name: 'Photo Milestone Bunting Flags (Months 1-12)', category: 'Decorations', quantity: 1, unit: 'set', estimatedUnitPrice: 299, isEssential: false, status: 'need_to_buy' },
    ],
    timelineTasks: [
      { id: 't-1', title: 'Confirm RSVP head count from relatives', category: 'Coordination', dueDate: '2026-11-12', dueDescription: '8 days prior', isEssential: true, isCompleted: true },
      { id: 't-2', title: 'Finalize customized 2kg safari cake', category: 'Food', dueDate: '2026-11-10', dueDescription: '10 days prior', isEssential: true, isCompleted: true },
      { id: 't-3', title: 'Assemble gift boxes with personalized baby tags', category: 'Return Gifts', dueDate: '2026-11-17', dueDescription: '3 days prior', isEssential: true, isCompleted: false },
      { id: 't-4', title: 'Arrange extra fold-out chairs for senior relatives', category: 'Venue', dueDate: '2026-11-18', dueDescription: '2 days prior', isEssential: true, isCompleted: false },
      { id: 't-5', title: 'Finalize Spotify kids upbeat celebration playlist', category: 'Entertainment', dueDate: '2026-11-19', dueDescription: '1 day prior', isEssential: false, isCompleted: false },
    ],
    returnGiftPlan: {
      recipients: 25,
      ageGroup: 'Kids',
      budgetPerGift: 140,
      totalBudget: 3500,
      category: 'Eco-Friendly & Toys',
      personalization: 'Aarav Turns One custom ribbon',
      ideas: [
        { name: 'Wooden Toddler Safari Puzzle', category: 'Kids', estimatedCostPerGift: 130, description: 'Eco-friendly non-toxic wooden puzzle.', isBulkFriendly: true, diyTip: 'Bundle with a thank-you sticker.' },
        { name: 'Seed Paper Coloring Book & Crayons', category: 'Eco-Friendly', estimatedCostPerGift: 110, description: 'Plantable seed paper book that grows into herbs.', isBulkFriendly: true },
      ],
    },
    chatHistory: [
      {
        id: 'c-1',
        role: 'assistant',
        content: "Hi Shraddha! I'm your EVENTORA AI planner. I have initialized your plan for Aarav's 1st Birthday Safari. How can I help you adjust the budget, suggest games, or refine the menu?",
        timestamp: '2026-10-25T14:30:00Z',
        source: 'eventora-engine',
      },
    ],
  },
];

export const StorageService = {
  getEvents(): EventItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(INITIAL_DEMO_EVENTS));
        return INITIAL_DEMO_EVENTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_EVENTS;
    }
  },

  getEventById(id: string): EventItem | undefined {
    const list = this.getEvents();
    return list.find((e) => e.id === id);
  },

  async syncFromServer(): Promise<EventItem[]> {
    try {
      const serverEvents = await ApiService.getEvents();
      if (Array.isArray(serverEvents)) {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(serverEvents));
        if (serverEvents.length > 0) {
          const activeId = this.getActiveEventId();
          if (!serverEvents.some((e) => e.id === activeId)) {
            this.setActiveEventId(serverEvents[0].id);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
        }
        return serverEvents;
      }
    } catch (err) {
      console.warn('Could not sync events from server, using local cache:', err);
    }
    return this.getEvents();
  },

  getActiveEventId(): string {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (stored) return stored;
    const events = this.getEvents();
    if (events.length > 0) {
      this.setActiveEventId(events[0].id);
      return events[0].id;
    }
    return '';
  },

  setActiveEventId(id: string) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  },

  saveEvent(
    event: EventItem,
    historyContext?: { actionType?: string; title?: string; summary?: string }
  ) {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === event.id);
    const updated = { ...event, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      events[index] = updated;
    } else {
      events.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    this.setActiveEventId(event.id);

    // Sync to persistent server database
    if (index >= 0) {
      ApiService.updateEvent(event.id, updated, historyContext).catch((err) =>
        console.warn('Server sync error on update:', err)
      );
    } else {
      ApiService.createEvent(updated).catch((err) =>
        console.warn('Server sync error on create:', err)
      );
    }

    return updated;
  },

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const filtered = events.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(filtered));
    if (this.getActiveEventId() === id) {
      if (filtered.length > 0) {
        this.setActiveEventId(filtered[0].id);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      }
    }

    // Sync deletion to server
    ApiService.deleteEvent(id).catch((err) =>
      console.warn('Server sync error on delete:', err)
    );

    return true;
  },

  duplicateEvent(id: string): EventItem | null {
    const original = this.getEventById(id);
    if (!original) return null;
    const copy: EventItem = {
      ...original,
      id: 'event-' + Date.now(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.saveEvent(copy, {
      actionType: 'event_created',
      title: 'Event Duplicated',
      summary: `Duplicated from "${original.name}" with full allocations and milestones.`,
    });
  },

  getUserProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      id: 'user-demo-1',
      name: 'Shraddha Kolate',
      email: 'shraddhakolate30@gmail.com',
      isDemo: true,
      token: 'token-demo-session-shraddha',
    };
  },

  setUserProfile(profile: UserProfile) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
  },
};
