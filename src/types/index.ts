export type EventType =
  | 'Birthday Party'
  | 'Wedding'
  | 'Engagement'
  | 'College Fest'
  | 'Farewell Party'
  | 'Baby Shower'
  | 'Festival Celebration'
  | 'Family Function'
  | 'Community Event'
  | 'Custom Event';

export type VenuePreference = 'home' | 'outdoor' | 'rented' | 'undecided';

export type FoodPreference =
  | 'pure_veg'
  | 'veg_nonveg'
  | 'jain'
  | 'buffet'
  | 'high_tea';

export type PlanningPriority =
  | 'lowest_cost'
  | 'best_food'
  | 'decorations'
  | 'maximum_guests'
  | 'premium_experience';

export interface BudgetItem {
  id: string;
  category: string;
  allocatedAmount: number;
  actualAmount: number;
  notes: string;
  isEssential: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  isEssential: boolean;
  status: 'need_to_buy' | 'shortlisted' | 'purchased';
  notes?: string;
}

export interface TimelineTask {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  dueDescription: string;
  isEssential: boolean;
  isCompleted: boolean;
}

export interface ReturnGiftIdea {
  name: string;
  category: string;
  estimatedCostPerGift: number;
  description: string;
  isBulkFriendly: boolean;
  diyTip?: string;
}

export interface ReturnGiftPlan {
  recipients: number;
  ageGroup: 'Kids' | 'Adults' | 'Mixed' | 'Seniors';
  budgetPerGift: number;
  totalBudget: number;
  category: string;
  personalization: string;
  ideas: ReturnGiftIdea[];
}

export interface GeneratedPlan {
  overview: string;
  conceptTheme: string;
  colorPalette: string[];
  budgetBreakdown: Array<{
    category: string;
    allocatedAmount: number;
    notes?: string;
  }>;
  timeline: Array<{
    timeframe: string;
    milestones: string[];
  }>;
  tasks: Array<{
    title: string;
    category: string;
    dueDescription: string;
    isEssential: boolean;
  }>;
  decorations: Array<{
    title: string;
    description: string;
    isDiy?: boolean;
  }>;
  foodMenu: Array<{
    course: string;
    items: string[];
  }>;
  activities: Array<{
    name: string;
    description: string;
    duration?: string;
  }>;
  shoppingList: Array<{
    name: string;
    category: string;
    quantity: number;
    unit?: string;
    estimatedUnitPrice: number;
    isEssential: boolean;
  }>;
  returnGifts: ReturnGiftIdea[];
  budgetSavingTips: string[];
  assumptions: string[];
  source?: string;
}

export interface ProposedPlanUpdate {
  summary: string;
  newBudget?: number;
  newTheme?: string;
  newCategories?: Array<{ category: string; allocatedAmount: number; notes?: string }>;
  suggestedTasks?: string[];
  suggestedShoppingItems?: Array<{ name: string; category: string; estimatedUnitPrice: number; quantity: number }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  proposedUpdate?: ProposedPlanUpdate;
}

export interface HistoryRecord {
  id: string;
  userId: string;
  eventId: string;
  timestamp: string;
  actionType:
    | 'event_created'
    | 'plan_generated'
    | 'plan_modified'
    | 'budget_updated'
    | 'task_updated'
    | 'shopping_updated'
    | 'rescue_applied'
    | 'chat_insight';
  title: string;
  summary: string;
  details?: Record<string, any>;
}

export interface EventItem {
  id: string;
  userId?: string;
  name: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  currency: string;
  theme: string;
  venuePreference: VenuePreference;
  foodPreference: FoodPreference;
  returnGiftsRequired: boolean;
  priority: PlanningPriority;
  additionalRequirements: string;
  createdAt: string;
  updatedAt: string;
  plan?: GeneratedPlan;
  budgetBreakdown: BudgetItem[];
  shoppingList: ShoppingItem[];
  timelineTasks: TimelineTask[];
  returnGiftPlan?: ReturnGiftPlan;
  chatHistory: ChatMessage[];
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  isDemo: boolean;
  token?: string;
}

export interface ProductComparisonItem {
  id: string;
  name: string;
  category: string;
  brandOrSeller: string;
  unitPrice: number;
  packageQuantity: number;
  unitLabel: string;
  costPerUnit: number;
  rating: number;
  isBestValue: boolean;
  verifiedWholesale: boolean;
  directSearchUrl: string;
  notes: string;
}

export interface LocalWholesaleHub {
  city: string;
  marketName: string;
  specialty: string;
  address: string;
  wholesaleDiscountAvg: string;
  minOrderQuantity: string;
  bestTimeToVisit: string;
  insiderTips: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  sessions: SessionRecord[];
  events: EventItem[];
  history: HistoryRecord[];
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode: number;
}
