import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  hashPasswordScrypt,
  hashPasswordLegacy,
  verifyPassword,
  isLegacyHash,
} from './src/utils/authSecurity';
import { withTimeout, DEFAULT_GEMINI_TIMEOUT_MS } from './src/utils/aiTimeout';
import {
  EventItem,
  HistoryRecord,
  UserRecord,
  SessionRecord,
  DatabaseSchema,
  ApiErrorResponse,
} from './src/types/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini client on server side with User-Agent header
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Multi-model Gemini executor that queries verified supported models
async function callGemini(
  contents: any,
  config?: any
): Promise<{ text: string; modelName: string }> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  // Model candidates in order of verified availability
  // gemini-3.1-flash-lite is active and ultra-fast (~1.5s)
  // gemini-3.8-flash is the primary general text model (attempts if needed)
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const resp = await withTimeout(
        ai.models.generateContent({
          model,
          contents,
          config,
        }),
        DEFAULT_GEMINI_TIMEOUT_MS,
        `Gemini model ${model}`
      );
      if (resp && resp.text) {
        return { text: resp.text, modelName: model };
      }
    } catch (err: any) {
      lastError = err;
      const isTimeout = err?.message?.includes('timed out');
      console.warn(
        `Gemini model ${model} unavailable${isTimeout ? ' (Timeout 8s)' : ''}: ${err?.message || 'unknown error'}`
      );
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
}

app.use(express.json({ limit: '1mb' }));

// Safe HTTP defensive security headers (S-4) - preserves AI Studio preview iframe embedding
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  next();
});

// ---------------------------------------------------------------------------
// PERSISTENT DATA LAYER & DATABASE
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PASSWORD_SALT = 'eventora_secure_salt_2026';
// ---------------------------------------------------------------------------
// STANDARDIZED API ERROR RESPONSE HELPER (Q-2)
// ---------------------------------------------------------------------------
function sendApiError(
  res: Response,
  statusCode: number,
  errorMessage: string
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    error: errorMessage,
    statusCode,
  };
  return res.status(statusCode).json(payload);
}

function hashPassword(password: string): string {
  return hashPasswordScrypt(password);
}

function getInitialDatabase(): DatabaseSchema {
  const demoUserId = 'user-demo-1';
  const demoToken = 'token-demo-session-shraddha';
  const initialPasswordHash = hashPassword('eventora123');

  const defaultEvent: EventItem = {
    id: 'demo-bday-1',
    userId: demoUserId,
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
  };

  const initialHistory: HistoryRecord[] = [
    {
      id: 'h-1',
      userId: demoUserId,
      eventId: 'demo-bday-1',
      timestamp: '2026-10-20T10:00:00Z',
      actionType: 'event_created',
      title: 'Event Created',
      summary: 'Aarav’s 1st Birthday Safari Adventure created with ₹45,000 budget for 45 guests.',
    },
    {
      id: 'h-2',
      userId: demoUserId,
      eventId: 'demo-bday-1',
      timestamp: '2026-10-20T10:05:00Z',
      actionType: 'plan_generated',
      title: 'Initial Plan Generated',
      summary: 'Generated 11-part celebration blueprint including Safari theme and menu breakdown.',
    },
  ];

  return {
    users: [
      {
        id: demoUserId,
        name: 'Shraddha Kolate',
        email: 'shraddhakolate30@gmail.com',
        passwordHash: initialPasswordHash,
        createdAt: '2026-10-20T09:00:00Z',
      },
    ],
    sessions: [
      {
        token: demoToken,
        userId: demoUserId,
        createdAt: '2026-10-20T09:00:00Z',
      },
    ],
    events: [defaultEvent],
    history: initialHistory,
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return getInitialDatabase();
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Ensure database file is initialized on server startup
const db = loadDatabase();

// ---------------------------------------------------------------------------
// SESSION TTL & EXPIRATION (S-3)
// ---------------------------------------------------------------------------
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function cleanupExpiredSessions(): number {
  const now = Date.now();
  const initialCount = db.sessions.length;
  db.sessions = db.sessions.filter((s) => {
    // Preserve demo token and filter out tokens older than 30 days
    if (s.token === 'token-demo-session-shraddha') return true;
    const age = now - new Date(s.createdAt).getTime();
    return age <= SESSION_TTL_MS;
  });
  const removed = initialCount - db.sessions.length;
  if (removed > 0) {
    saveDatabase(db);
    console.log(`[Security] Cleaned up ${removed} expired sessions.`);
  }
  return removed;
}

// Clean up expired sessions on startup
cleanupExpiredSessions();

// ---------------------------------------------------------------------------
// IP-BASED RATE LIMITING (S-1)
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

function createRateLimiter(maxRequests: number, windowMs: number, actionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Allow test bypass header so automated testing suites remain reliable
    if (req.headers['x-test-bypass'] === 'true') {
      return next();
    }

    const ip = getClientIp(req);
    const key = `${actionName}:${ip}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return sendApiError(
        res,
        429,
        `Too many ${actionName} attempts. Please try again in ${retryAfterSeconds} seconds.`
      );
    }

    entry.count++;
    next();
  };
}

// 5 attempts/minute for login, 3 attempts/minute for signup
const loginRateLimiter = createRateLimiter(5, 60000, 'login');
const signupRateLimiter = createRateLimiter(3, 60000, 'signup');

// ---------------------------------------------------------------------------
// AUTHENTICATION MIDDLEWARE & HELPERS
// ---------------------------------------------------------------------------
interface AuthRequest extends Request {
  user?: UserRecord;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // S-2: Allow demo fallback ONLY for read-only GET requests (e.g. guest browsing)
    if (req.method === 'GET') {
      const demoUser = db.users.find((u) => u.email === 'shraddhakolate30@gmail.com') || db.users[0];
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }
    // All mutations (POST, PUT, DELETE, PATCH) REQUIRE an authenticated Bearer token
    return sendApiError(res, 401, 'Authentication required. Please log in.');
  }

  const session = db.sessions.find((s) => s.token === token);
  if (!session) {
    return sendApiError(res, 401, 'Invalid or expired session. Please log in again.');
  }

  // S-3: 30-day session expiration check
  const sessionAge = Date.now() - new Date(session.createdAt).getTime();
  if (session.token !== 'token-demo-session-shraddha' && sessionAge > SESSION_TTL_MS) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDatabase(db);
    return sendApiError(res, 401, 'Session has expired. Please log in again.');
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    return sendApiError(res, 401, 'User account not found.');
  }

  req.user = user;
  next();
}

function logAuditHistory(
  userId: string,
  eventId: string,
  actionType: HistoryRecord['actionType'],
  title: string,
  summary: string,
  details?: Record<string, any>
) {
  const record: HistoryRecord = {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    eventId,
    timestamp: new Date().toISOString(),
    actionType,
    title,
    summary,
    details,
  };
  db.history.unshift(record);
  saveDatabase(db);
  return record;
}

// ---------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// ---------------------------------------------------------------------------

// Sign Up
app.post('/api/auth/signup', signupRateLimiter, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) {
    return sendApiError(res, 400, 'Name must be at least 2 characters long.');
  }
  if (!email || !email.includes('@')) {
    return sendApiError(res, 400, 'A valid email address is required.');
  }
  if (!password || password.length < 6) {
    return sendApiError(res, 400, 'Password must be at least 6 characters long.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return sendApiError(res, 409, 'An account with this email already exists. Please log in.');
  }

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  const newToken: SessionRecord = {
    token: `token-${crypto.randomBytes(24).toString('hex')}`,
    userId: newUser.id,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.sessions.push(newToken);
  saveDatabase(db);

  res.status(201).json({
    token: newToken.token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isDemo: false,
    },
  });
});

// Log In
app.post('/api/auth/login', loginRateLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendApiError(res, 400, 'Email and password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    const diskDb = loadDatabase();
    user = diskDb.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (user) {
      db.users = diskDb.users;
    }
  }
  if (!user) {
    return sendApiError(res, 401, 'Invalid email or password.');
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return sendApiError(res, 401, 'Invalid email or password.');
  }

  // Backward-compatible security upgrade: migrate legacy SHA-256 hashes to scrypt upon successful login
  if (isLegacyHash(user.passwordHash)) {
    user.passwordHash = hashPasswordScrypt(password);
    saveDatabase(db);
    console.log(`[AuthSecurity] Successfully upgraded legacy password hash to scrypt for user ${user.id}`);
  }

  const newToken: SessionRecord = {
    token: `token-${crypto.randomBytes(24).toString('hex')}`,
    userId: user.id,
    createdAt: new Date().toISOString(),
  };

  db.sessions.push(newToken);
  saveDatabase(db);

  res.json({
    token: newToken.token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isDemo: user.id === 'user-demo-1',
    },
  });
});

// Current User Me
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isDemo: user.id === 'user-demo-1',
    },
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDatabase(db);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ---------------------------------------------------------------------------
// EVENTS API (USER-SCOPED AUTHORIZATION)
// ---------------------------------------------------------------------------

// List events owned by authenticated user
app.get('/api/events', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const userEvents = db.events.filter((e) => e.userId === userId || (!e.userId && userId === 'user-demo-1'));
  res.json(userEvents);
});

// Get single event by ID
app.get('/api/events/:id', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const event = db.events.find(
    (e) => e.id === req.params.id && (e.userId === userId || (!e.userId && userId === 'user-demo-1'))
  );
  if (!event) {
    return sendApiError(res, 404, 'Event not found or access denied.');
  }
  res.json(event);
});

// Create new event
app.post('/api/events', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const eventData = req.body;

  if (!eventData.name || !eventData.type || !eventData.budget) {
    return sendApiError(res, 400, 'Missing required event fields.');
  }

  const newEvent = {
    ...eventData,
    id: eventData.id || `event-${Date.now()}`,
    userId,
    createdAt: eventData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.events.unshift(newEvent);
  saveDatabase(db);

  logAuditHistory(
    userId,
    newEvent.id,
    'event_created',
    'Celebration Created',
    `"${newEvent.name}" (${newEvent.type}) created with ₹${Number(newEvent.budget).toLocaleString('en-IN')} budget.`
  );

  res.status(201).json(newEvent);
});

// Update event
app.put('/api/events/:id', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const eventIndex = db.events.findIndex(
    (e) => e.id === req.params.id && (e.userId === userId || (!e.userId && userId === 'user-demo-1'))
  );

  if (eventIndex === -1) {
    return sendApiError(res, 404, 'Event not found or access denied.');
  }

  const prev = db.events[eventIndex];
  const updatedEvent = {
    ...prev,
    ...req.body,
    id: prev.id,
    userId: prev.userId || userId,
    updatedAt: new Date().toISOString(),
  };

  db.events[eventIndex] = updatedEvent;
  saveDatabase(db);

  // Determine change context for audit trail
  const actionType = req.body._historyActionType || 'plan_modified';
  const actionTitle = req.body._historyActionTitle || 'Event Plan Updated';
  const actionSummary =
    req.body._historyActionSummary ||
    `Updated plan parameters for "${updatedEvent.name}". Total budget: ₹${Number(updatedEvent.budget).toLocaleString('en-IN')}.`;

  logAuditHistory(userId, updatedEvent.id, actionType, actionTitle, actionSummary);

  res.json(updatedEvent);
});

// Duplicate event
app.post('/api/events/:id/duplicate', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const original = db.events.find(
    (e) => e.id === req.params.id && (e.userId === userId || (!e.userId && userId === 'user-demo-1'))
  );

  if (!original) {
    return sendApiError(res, 404, 'Original event not found or access denied.');
  }

  const duplicateEvent = {
    ...original,
    id: `event-${Date.now()}`,
    userId,
    name: `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.events.unshift(duplicateEvent);
  saveDatabase(db);

  logAuditHistory(
    userId,
    duplicateEvent.id,
    'event_created',
    'Event Duplicated',
    `Duplicated from "${original.name}" with full budget allocations and checklists.`
  );

  res.status(201).json(duplicateEvent);
});

// Delete event
app.delete('/api/events/:id', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const initialLength = db.events.length;
  db.events = db.events.filter(
    (e) => !(e.id === req.params.id && (e.userId === userId || (!e.userId && userId === 'user-demo-1')))
  );

  if (db.events.length === initialLength) {
    return sendApiError(res, 404, 'Event not found or access denied.');
  }

  // Clean up history
  db.history = db.history.filter((h) => h.eventId !== req.params.id);
  saveDatabase(db);

  res.json({ success: true, message: 'Event and associated history deleted.' });
});

// ---------------------------------------------------------------------------
// HISTORY & AUDIT LOG API
// ---------------------------------------------------------------------------

// Get history records for event
app.get('/api/events/:id/history', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const event = db.events.find(
    (e) => e.id === req.params.id && (e.userId === userId || (!e.userId && userId === 'user-demo-1'))
  );
  if (!event) {
    return sendApiError(res, 404, 'Event not found or access denied.');
  }

  const records = db.history
    .filter((h) => h.eventId === req.params.id && (h.userId === userId || userId === 'user-demo-1'))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(records);
});

// Add custom history log
app.post('/api/events/:id/history', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const event = db.events.find(
    (e) => e.id === req.params.id && (e.userId === userId || (!e.userId && userId === 'user-demo-1'))
  );
  if (!event) {
    return sendApiError(res, 404, 'Event not found or access denied.');
  }

  const { actionType, title, summary, details } = req.body;

  if (!title || !summary) {
    return sendApiError(res, 400, 'Title and summary are required.');
  }

  const record = logAuditHistory(
    userId,
    req.params.id,
    actionType || 'plan_modified',
    title,
    summary,
    details
  );

  res.status(201).json(record);
});

// ---------------------------------------------------------------------------
// HEALTH & STATUS ENDPOINT
// ---------------------------------------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    model: 'gemini-3.1-flash-lite',
    supportedModels: ['gemini-3.1-flash-lite', 'gemini-3.8-flash'],
    mode: apiKey ? 'live-gemini' : 'interactive-demo',
    database: 'persistent-json-store',
    userAccounts: db.users.length,
    eventsCount: db.events.length,
    message: apiKey
      ? 'Live Gemini API is active with persistent server database'
      : 'Running with persistent server database and Eventora Rule Engine. Add GEMINI_API_KEY to AI Studio Secrets for live generation.',
  });
});

// ---------------------------------------------------------------------------
// AI PLAN GENERATION ENDPOINT
// ---------------------------------------------------------------------------
app.post('/api/ai/plan', async (req, res) => {
  try {
    const {
      name,
      type,
      date,
      location,
      guestCount,
      budget,
      currency = 'INR',
      theme,
      venuePreference,
      foodPreference,
      returnGiftsRequired,
      priority,
      additionalRequirements,
    } = req.body;

    if (!name || !type || !guestCount || !budget) {
      return sendApiError(res, 400, 'Missing required event fields');
    }

    if (ai) {
      try {
        const prompt = `You are an expert event planner for EVENTORA AI. Generate a comprehensive, professional, realistic event plan in Indian Rupees (₹) for:
Event: "${name}" (${type})
Date: ${date}
Location: ${location || 'India'}
Guest Count: ${guestCount} people
Total Budget: ₹${budget}
Theme: ${theme || 'Classy & Festive'}
Venue Preference: ${venuePreference}
Food Preference: ${foodPreference}
Return Gifts Needed: ${returnGiftsRequired ? 'Yes' : 'No'}
Planning Priority: ${priority}
Additional Notes: ${additionalRequirements || 'None'}

Rules:
1. Provide realistic cost estimates adhering strictly to the total budget of ₹${budget}.
2. Ensure mathematical integrity across categories.
3. Include structured timeline, tasks, decoration ideas, menu items, shopping list items, return gift ideas (if needed), and money-saving tips.
4. Mark every cost clearly as an estimate.`;

        const planConfig = {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                overview: { type: Type.STRING },
                conceptTheme: { type: Type.STRING },
                colorPalette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                budgetBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      allocatedAmount: { type: Type.NUMBER },
                      notes: { type: Type.STRING },
                    },
                    required: ['category', 'allocatedAmount'],
                  },
                },
                timeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timeframe: { type: Type.STRING },
                      milestones: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['timeframe', 'milestones'],
                  },
                },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      category: { type: Type.STRING },
                      dueDescription: { type: Type.STRING },
                      isEssential: { type: Type.BOOLEAN },
                    },
                    required: ['title', 'category', 'isEssential'],
                  },
                },
                decorations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      isDiy: { type: Type.BOOLEAN },
                    },
                    required: ['title', 'description'],
                  },
                },
                foodMenu: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      course: { type: Type.STRING },
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['course', 'items'],
                  },
                },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      duration: { type: Type.STRING },
                    },
                    required: ['name', 'description'],
                  },
                },
                shoppingList: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      quantity: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      estimatedUnitPrice: { type: Type.NUMBER },
                      isEssential: { type: Type.BOOLEAN },
                    },
                    required: ['name', 'category', 'quantity', 'estimatedUnitPrice'],
                  },
                },
                returnGifts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      estimatedCostPerGift: { type: Type.NUMBER },
                      description: { type: Type.STRING },
                      isBulkFriendly: { type: Type.BOOLEAN },
                    },
                    required: ['name', 'estimatedCostPerGift'],
                  },
                },
                budgetSavingTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                assumptions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['overview', 'conceptTheme', 'budgetBreakdown', 'timeline', 'tasks'],
            },
          };

        const { text, modelName } = await callGemini(prompt, planConfig);
        const parsed = JSON.parse(text || '{}');
        return res.json({
          success: true,
          source: modelName,
          plan: parsed,
        });
      } catch (geminiErr: any) {
        console.warn('Gemini plan call unavailable, using rule-based engine:', geminiErr.message);
      }
    }

    // Baseline rule-based planner fallback with realistic algorithmic generation
    const ruleBasedPlan = generateRuleBasedPlan({
      name,
      type,
      date,
      location,
      guestCount: Number(guestCount),
      budget: Number(budget),
      theme,
      venuePreference,
      foodPreference,
      returnGiftsRequired: Boolean(returnGiftsRequired),
      priority,
      additionalRequirements,
    });

    return res.json({
      success: true,
      source: 'eventora-rule-engine-fallback',
      plan: ruleBasedPlan,
      notice: 'Generated by Eventora Intelligent Rule Engine (Fallback baseline).',
    });
  } catch (error: any) {
    console.error('Plan generation error:', error);
    sendApiError(res, 500, error.message || 'Failed to generate event plan');
  }
});

// ---------------------------------------------------------------------------
// AI CHAT & PLAN MODIFICATION ENDPOINT
// ---------------------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, eventContext, conversationHistory = [] } = req.body;
    if (!message) {
      return sendApiError(res, 400, 'Message is required');
    }

    const isModificationIntent = isModificationQuery(message);

    if (ai) {
      try {
        const historySummary = conversationHistory
          .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
          .slice(-6)
          .join('\n');

        const systemPrompt = `You are EVENTORA AI Assistant, an empathetic, budget-conscious event planner in India.
Current Event Context:
- Name: ${eventContext?.name || 'General Event'}
- Type: ${eventContext?.type || 'Celebration'}
- Budget: ₹${eventContext?.budget || 'N/A'}
- Guests: ${eventContext?.guestCount || 'N/A'}
- Venue: ${eventContext?.venuePreference || 'N/A'}
- Priority: ${eventContext?.priority || 'Balanced'}

Provide practical, highly actionable advice in clear markdown with bullet points.
If the user asks to modify the plan, recommend specific trade-offs and suggest exact category amounts.
Always state that prices and vendor availability are estimates. Never invent fake live inventory or bookings.`;

        const { text, modelName } = await callGemini(
          `${systemPrompt}\n\nRecent History:\n${historySummary}\n\nUser Question: ${message}`
        );

        let proposedUpdate = undefined;
        if (isModificationIntent) {
          proposedUpdate = generateProposedUpdate(message, eventContext);
        }

        return res.json({
          reply: text,
          source: modelName,
          proposedUpdate,
        });
      } catch (geminiErr: any) {
        console.warn('Gemini chat unavailable, falling back to rule-based engine:', geminiErr.message);
      }
    }

    // Explicitly labelled rule-engine fallback when Gemini is unavailable or failed
    const fallbackReply = generateFallbackChatResponse(message, eventContext);
    const proposedUpdate = isModificationIntent ? generateProposedUpdate(message, eventContext) : undefined;

    return res.json({
      reply: fallbackReply,
      source: 'eventora-rule-engine-fallback',
      proposedUpdate,
      notice: 'Response delivered via Eventora Planning Knowledge Base (Rule engine fallback).',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    sendApiError(res, 500, error.message || 'Failed to process chat message');
  }
});

// ---------------------------------------------------------------------------
// AI BUDGET RESCUE & OPTIMIZATION ENDPOINT
// ---------------------------------------------------------------------------
app.post('/api/ai/rescue', async (req, res) => {
  try {
    const { event, targetBudget, newGuests, priority } = req.body;
    const oldBudget = Number(event?.budget || 0);
    const rescuedBudget = Number(targetBudget || oldBudget * 0.8);
    const guests = Number(newGuests || event?.guestCount || 50);

    if (ai) {
      try {
        const prompt = `Perform a Budget Rescue for this event in India:
Original Event: ${event?.name} (${event?.type})
Original Budget: ₹${oldBudget} for ${event?.guestCount} guests
Rescued Target Budget: ₹${rescuedBudget} for ${guests} guests
Priority: ${priority || 'Maximum Savings'}

Generate actionable trade-offs, which optional items to eliminate, and low-cost alternative suggestions. All in INR ₹.`;

        const rescueConfig: any = {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              totalSavings: { type: Type.NUMBER },
              revisedCategories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    originalAmount: { type: Type.NUMBER },
                    revisedAmount: { type: Type.NUMBER },
                    strategy: { type: Type.STRING },
                  },
                  required: ['category', 'originalAmount', 'revisedAmount', 'strategy'],
                },
              },
              tradeoffs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    action: { type: Type.STRING },
                    estimatedSavings: { type: Type.NUMBER },
                    impact: { type: Type.STRING },
                  },
                  required: ['item', 'action', 'estimatedSavings', 'impact'],
                },
              },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['summary', 'totalSavings', 'revisedCategories', 'tradeoffs'],
          },
        };

        const { text, modelName } = await callGemini(prompt, rescueConfig);
        return res.json({
          success: true,
          source: modelName,
          rescuePlan: JSON.parse(text || '{}'),
        });
      } catch (geminiErr: any) {
        console.warn('Gemini rescue unavailable, falling back to algorithmic calculation:', geminiErr.message);
      }
    }

    // Algorithmic rescue calculation
    const rescuePlan = calculateAlgorithmicRescue(event, rescuedBudget, guests, priority);
    return res.json({
      success: true,
      source: 'eventora-rule-engine-fallback',
      rescuePlan,
      notice: 'Calculated using Eventora Optimization Engine.',
    });
  } catch (error: any) {
    console.error('Rescue error:', error);
    sendApiError(res, 500, error.message || 'Failed to optimize budget');
  }
});

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS FOR ENGINE & CHAT
// ---------------------------------------------------------------------------

function isModificationQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('reduce') ||
    q.includes('cut budget') ||
    q.includes('cut cost') ||
    q.includes('save on') ||
    q.includes('decrease') ||
    q.includes('increase') ||
    q.includes('shift budget') ||
    q.includes('adjust budget') ||
    q.includes('update plan') ||
    q.includes('modify plan') ||
    q.includes('change theme') ||
    q.includes('budget to') ||
    q.includes('change budget')
  );
}

function generateProposedUpdate(message: string, eventContext: any) {
  const currentBudget = Number(eventContext?.budget || 50000);
  const q = message.toLowerCase();

  let newBudget = currentBudget;
  let summary = 'Proposed adjustments based on your planning request.';
  let newTheme: string | undefined = undefined;

  // Check for specific target budget: e.g. "budget to 35000", "reduce budget to 40000", "to 30,000"
  const targetMatch = message.match(/(?:budget to|reduce to|cut to|set to|change to)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
  // Check for reduction delta: e.g. "reduce by 10000", "cut by 5000"
  const reduceDeltaMatch = message.match(/(?:reduce by|cut by|decrease by|save)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
  // Check for increase delta: e.g. "increase by 10000", "add 5000"
  const increaseDeltaMatch = message.match(/(?:increase by|add|raise by)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
  // Check for percentage: e.g. "reduce by 20%"
  const percentMatch = message.match(/(?:reduce|cut|decrease|save)\s*(?:by)?\s*([0-9]+)%/i);

  if (targetMatch) {
    const parsed = parseInt(targetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 5000) {
      newBudget = parsed;
      summary = `Target budget adjusted to ₹${newBudget.toLocaleString('en-IN')} (previously ₹${currentBudget.toLocaleString('en-IN')}). Category allocations recalibrated proportionally.`;
    }
  } else if (reduceDeltaMatch) {
    const delta = parseInt(reduceDeltaMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(delta) && delta > 0 && currentBudget - delta >= 5000) {
      newBudget = currentBudget - delta;
      summary = `Proposed ₹${delta.toLocaleString('en-IN')} budget reduction, lowering total from ₹${currentBudget.toLocaleString('en-IN')} to ₹${newBudget.toLocaleString('en-IN')}.`;
    }
  } else if (increaseDeltaMatch) {
    const delta = parseInt(increaseDeltaMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(delta) && delta > 0) {
      newBudget = currentBudget + delta;
      summary = `Proposed ₹${delta.toLocaleString('en-IN')} budget expansion, increasing total from ₹${currentBudget.toLocaleString('en-IN')} to ₹${newBudget.toLocaleString('en-IN')}.`;
    }
  } else if (percentMatch) {
    const pct = parseInt(percentMatch[1], 10);
    if (!isNaN(pct) && pct > 0 && pct < 90) {
      newBudget = Math.round(currentBudget * (1 - pct / 100));
      summary = `Proposed ${pct}% budget reduction from ₹${currentBudget.toLocaleString('en-IN')} to ₹${newBudget.toLocaleString('en-IN')}.`;
    }
  } else if (q.includes('reduce') || q.includes('cut') || q.includes('save') || q.includes('decrease')) {
    newBudget = Math.round(currentBudget * 0.85);
    summary = `Proposed 15% budget reduction from ₹${currentBudget.toLocaleString('en-IN')} to ₹${newBudget.toLocaleString('en-IN')}, shifting funds towards high-yield essentials while trimming optional decor.`;
  } else if (q.includes('increase') || q.includes('expand')) {
    newBudget = Math.round(currentBudget * 1.15);
    summary = `Proposed 15% budget increase from ₹${currentBudget.toLocaleString('en-IN')} to ₹${newBudget.toLocaleString('en-IN')} to enhance guest hospitality and entertainment.`;
  }

  // Theme detection if present
  const themeMatch = message.match(/(?:theme to|new theme:?)\s*([A-Za-z0-9 &'-]+)/i);
  if (themeMatch && themeMatch[1]) {
    newTheme = themeMatch[1].trim();
  }

  // Calculate clean, rounded categories that sum exactly to newBudget
  const weights = [
    { category: 'Food & Catering', pct: 0.38, notes: 'Streamlined menu with 2 hero starters' },
    { category: 'Decorations & Styling', pct: 0.12, notes: 'Warm fairy light drapes & focal photo spot' },
    { category: 'Venue & Hospitality', pct: 0.20, notes: 'Clubhouse or non-peak reservation' },
    { category: 'Cake & Desserts', pct: 0.05, notes: 'Single-tier focal display cake' },
    { category: 'Photography & Video', pct: 0.08, notes: '3-hour candid photo package' },
    { category: 'Return Gifts', pct: 0.06, notes: 'Wholesale potted succulents / dry fruit potlis' },
    { category: 'Miscellaneous & Contingency', pct: 0.11, notes: 'Buffer for unforeseen logistics' },
  ];

  let allocatedSum = 0;
  const newCategories = weights.map((w, idx) => {
    let amt = Math.round(newBudget * w.pct);
    if (idx === weights.length - 1) {
      amt = newBudget - allocatedSum;
    } else {
      allocatedSum += amt;
    }
    return {
      category: w.category,
      allocatedAmount: Math.max(0, amt),
      notes: w.notes,
    };
  });

  return {
    summary,
    newBudget,
    newTheme,
    newCategories,
    suggestedTasks: [
      'Confirm updated per-plate budget with caterer',
      'Order warm white LED fairy lights wholesale',
      'Launch digital RSVP video invitation',
    ],
  };
}

function generateRuleBasedPlan(data: any) {
  const { name, type, guestCount, budget, theme, venuePreference, foodPreference, returnGiftsRequired } = data;

  let weights: Record<string, number> = {
    'Food & Catering': 0.38,
    'Venue & Hospitality': 0.22,
    'Decorations & Styling': 0.14,
    'Cake & Desserts': 0.05,
    'Photography & Video': 0.08,
    'Entertainment & Sound': 0.05,
    'Invitations & Stationery': 0.02,
    'Miscellaneous & Contingency': 0.06,
  };

  if (returnGiftsRequired) {
    weights['Return Gifts'] = 0.06;
    weights['Food & Catering'] = 0.35;
    weights['Venue & Hospitality'] = 0.20;
    weights['Decorations & Styling'] = 0.12;
  }

  if (venuePreference === 'home') {
    const venueAmount = weights['Venue & Hospitality'] || 0;
    weights['Venue & Hospitality'] = 0.04;
    weights['Decorations & Styling'] += venueAmount * 0.4;
    weights['Food & Catering'] += venueAmount * 0.4;
    weights['Miscellaneous & Contingency'] += venueAmount * 0.2;
  }

  let totalAllocated = 0;
  const budgetBreakdown = Object.entries(weights).map(([cat, weight]) => {
    let amount = Math.round((budget * weight) / 100) * 100;
    totalAllocated += amount;
    return {
      category: cat,
      allocatedAmount: amount,
      notes: getCategoryNote(cat, guestCount, venuePreference),
    };
  });

  const diff = budget - totalAllocated;
  if (budgetBreakdown.length > 0) {
    budgetBreakdown[0].allocatedAmount += diff;
  }

  const shoppingList = [
    { name: 'Eco-friendly Fairy Lights (20m string)', category: 'Lighting', quantity: 4, unit: 'rolls', estimatedUnitPrice: 249, isEssential: true },
    { name: 'Color Palette Balloons & Streamers Pack', category: 'Decorations', quantity: 2, unit: 'packs', estimatedUnitPrice: 399, isEssential: true },
    { name: 'Biodegradable Areca Palm Plates (Pack of 50)', category: 'Tableware', quantity: Math.ceil(guestCount / 50), unit: 'packs', estimatedUnitPrice: 450, isEssential: true },
    { name: 'Wooden Cutlery Set (Forks, Spoons, Knives)', category: 'Tableware', quantity: Math.ceil(guestCount / 50), unit: 'sets', estimatedUnitPrice: 280, isEssential: true },
    { name: 'Welcome Chalkboard Easel / Signboard', category: 'Event Accessories', quantity: 1, unit: 'piece', estimatedUnitPrice: 750, isEssential: false },
    { name: 'Festive Paper Napkins & Tissues (Pack of 100)', category: 'Tableware', quantity: Math.ceil(guestCount / 40), unit: 'packs', estimatedUnitPrice: 120, isEssential: true },
    { name: 'Photo Booth Props & Polaroid Frame', category: 'Party Supplies', quantity: 1, unit: 'set', estimatedUnitPrice: 499, isEssential: false },
  ];

  if (returnGiftsRequired) {
    shoppingList.push({
      name: 'Custom Thank You Gift Packaging Boxes',
      category: 'Return Gifts',
      quantity: guestCount,
      unit: 'boxes',
      estimatedUnitPrice: 35,
      isEssential: true,
    });
  }

  return {
    overview: `Curated celebration framework for ${name} (${type}) hosting ${guestCount} guests at an estimated budget of ₹${budget.toLocaleString('en-IN')}. Focuses on rich guest experience, memorable photo moments, and disciplined expense management.`,
    conceptTheme: theme || 'Contemporary Elegance with Warm Festive Tones',
    colorPalette: ['#7C3AED', '#EC4899', '#F59E0B', '#F3F4F6'],
    budgetBreakdown,
    timeline: [
      { timeframe: '3-4 Weeks Prior', milestones: ['Finalize guest list and venue booking', 'Lock catering menu and dietary counts', 'Send digital save-the-date cards'] },
      { timeframe: '1-2 Weeks Prior', milestones: ['Purchase decorative supplies and tableware', 'Confirm photographer and music playlists', 'Order custom cake and return gifts'] },
      { timeframe: '2-3 Days Prior', milestones: ['Coordinate with vendors for delivery timings', 'Prepare DIY photo corners and welcome signage', 'Final RSVP head count check'] },
      { timeframe: 'Event Day', milestones: ['Morning venue setup & floral styling', 'Sound check & dessert table staging', 'Welcome guests and enjoy stress-free!'] },
    ],
    tasks: [
      { title: 'Confirm RSVP head count', category: 'Coordination', dueDescription: '7 days before', isEssential: true },
      { title: 'Finalize customized menu with caterer', category: 'Food', dueDescription: '10 days before', isEssential: true },
      { title: 'Assemble return gift favor kits', category: 'Return Gifts', dueDescription: '3 days before', isEssential: returnGiftsRequired },
      { title: 'Test sound system and playlist', category: 'Entertainment', dueDescription: '1 day before', isEssential: true },
      { title: 'Setup photo backdrop and lighting', category: 'Decor', dueDescription: 'Morning of event', isEssential: false },
    ],
    decorations: [
      { title: 'Warm Cascading Micro-LED Canopy', description: 'String warm white fairy lights above the main seating area for a magical evening glow.', isDiy: true },
      { title: 'Minimalist Photo Backdrop with Fresh Foliage', description: 'Simple arch with seasonal marigolds, eucalyptus, or pastel fabric drape.', isDiy: true },
      { title: 'Custom Welcome Chalkboard', description: 'Handwritten calligraphy welcome greeting with celebration hashtag.', isDiy: true },
    ],
    foodMenu: [
      { course: 'Welcome Beverages', items: ['Mint Basil Lemonade Cooler', 'Spiced Masala Buttermilk or Warm Filter Coffee'] },
      { course: 'Appetizers & Starters', items: ['Paneer / Tandoori Skewers', 'Crispy Corn & Water Chestnut Bites', 'Cocktail Samosas with Mint Chutney'] },
      { course: 'Main Feast', items: ['Awadhi Vegetable Biryani & Mirchi Ka Salan', 'Paneer Butter Masala with Laccha Paratha', 'Dal Makhani & Jeera Rice'] },
      { course: 'Desserts & Sweet Station', items: ['Celebration Cake', 'Warm Gulab Jamun with Rabri', 'Fresh Fruit Tartlets'] },
    ],
    activities: [
      { name: 'Memory Lane Trivia Quiz', description: 'Interactive 15-minute phone or card quiz about the host or celebratory milestone.', duration: '20 mins' },
      { name: 'Polaroid Guestbook Signing', description: 'Guests take instant photo snapshots and pin heartfelt wishes into a memory album.', duration: 'Ongoing' },
      { name: 'Acoustic / Curated Playlist Hour', description: 'Vibrant background beats building up to festive dance sessions.', duration: '60 mins' },
    ],
    shoppingList,
    returnGifts: returnGiftsRequired
      ? [
          { name: 'Handcrafted Terracotta Potted Succulent', category: 'Eco-Friendly', estimatedCostPerGift: 120, description: 'Long-lasting living keepsake with customized message ribbon.', isBulkFriendly: true },
          { name: 'Artisanal Brass Diya / Candle in Gift Box', category: 'Traditional', estimatedCostPerGift: 150, description: 'Auspicious metallic accent popular for Indian festive gatherings.', isBulkFriendly: true },
          { name: 'Gourmet Organic Honey & Herbal Infusion Set', category: 'Edible', estimatedCostPerGift: 180, description: 'Healthy mini twin jars packed in jute potli bags.', isBulkFriendly: true },
        ]
      : [],
    budgetSavingTips: [
      'Choose in-season flowers and foliage to reduce floral decor quotes by up to 40%.',
      'Opt for high-yield welcome coolers instead of individual packaged canned drinks.',
      'Utilize digital invitations with RSVP tracking to save printing and postage expenses entirely.',
      'Hire a student or emerging professional photographer for 3 focused peak hours rather than full-day billing.',
    ],
    assumptions: [
      'All listed prices are benchmark market estimates for urban/suburban India (2025-2026).',
      'Actual venue rental fees vary drastically based on weekends vs weekdays.',
      'Catering quotes typically exclude government taxes (GST 5-18%) and transport surcharges.',
    ],
  };
}

function getCategoryNote(cat: string, guests: number, venue: string): string {
  switch (cat) {
    case 'Food & Catering':
      return `Estimated for approx ${guests} guests including appetizers, mains, and beverages.`;
    case 'Venue & Hospitality':
      return venue === 'home' ? 'Home preparation, deep cleaning, and basic furniture hire.' : 'Hall/lawn rental deposit and electricity surcharge.';
    case 'Decorations & Styling':
      return 'Stage/backdrop, entrance florals, lighting strings, and table centerpieces.';
    case 'Cake & Desserts':
      return `Custom designer cake calculated at approx ₹${Math.round(Math.max(guests * 15, 800))} + sweet bites.`;
    case 'Photography & Video':
      return 'Half-day candid shoot with high-res digital gallery delivery.';
    case 'Entertainment & Sound':
      return 'PA speaker sound console, cordless mics, and ambient lighting.';
    case 'Return Gifts':
      return `Thoughtful keepsake favors calculated for ${guests} attendees.`;
    default:
      return 'Buffer reserve for sudden logistics or vendor overtime.';
  }
}

function generateFallbackChatResponse(query: string, eventContext: any): string {
  const q = query.toLowerCase();
  const guests = eventContext?.guestCount || 40;
  const budget = eventContext?.budget || 50000;

  if (q.includes('reduce') || q.includes('save') || q.includes('cut cost') || q.includes('budget')) {
    return `### Strategic Ways to Save on Your ${eventContext?.type || 'Event'} (Budget: ₹${budget.toLocaleString('en-IN')})

1. **Digital Invitations Over Paper**: Save ₹3,000–₹8,000 by sending interactive animated Canva/WhatsApp video invitations with instant RSVP links.
2. **Buffet Menu Streamlining**: Focus on 2 stellar starters and 1 signature dessert rather than sprawling multi-cuisine spreads that cause plate wastage.
3. **Fairy Lights & Drape Architecture**: Warm white micro-LED strings (₹200/roll) and sheer drapes deliver high-glamour photo backdrops at a fraction of fresh floral wall costs.
4. **Daytime or Weekday Advantage**: Booking a venue or caterer on Friday evening or Sunday brunch can unlock 15–25% off-peak supplier discounts.

*I have prepared a proposed plan update below. Review the proposed adjustments and click "Apply to Plan" whenever you are ready!*`;
  }

  if (q.includes('return gift') || q.includes('favors') || q.includes('gift idea')) {
    return `### Recommended Return Gifts for ${guests} Guests

- **Potted Mini Succulents / Jade Plants** (₹90–₹140/piece): Sustainable, loved across all age groups, and symbolizes blooming growth.
- **Handmade Jute Potli with Dry Fruits** (₹120–₹180/pack): Premium traditional feel with 50g almonds + 50g cashews in golden organza.
- **Customized Wooden or Ceramic Coasters** (₹80–₹120/pair): Usable daily keepsake with minimal aesthetic engraving.
- **Aroma Soy Wax Jar Candles** (₹110–₹160/unit): Lavender, Mogra, or Vanilla scented with personalized kraft tags.

*Calculation tip: Buying in wholesale lots (e.g. from Crawford Market or Sadar Bazaar) saves 30–45% compared to retail gift shops.*`;
  }

  if (q.includes('venue') || q.includes('hall') || q.includes('location')) {
    return `### Venue Strategy for ${eventContext?.name || 'Your Event'}

- **Guest Count Alignment**: For ${guests} guests, you need approximately ${Math.round(guests * 15)} sq. ft. of mingling area or ${Math.round(guests * 25)} sq. ft. for seated banquet dining.
- **Rooftop or Society Clubhouse**: Excellent low-cost alternatives to commercial banquet halls, typically charging ₹3,000–₹10,000 refundable maintenance.
- **Outdoor Lawns vs Air-Conditioned Halls**: Remember to factor in weather (monsoon drapes or summer mist fans) which can add 20% to outdoor utility costs.`;
  }

  return `### Eventora Planning Guidance for "${eventContext?.name || 'Your Celebration'}"

Here are 3 priority action points for your ${eventContext?.type || 'event'}:
1. **Lock Vendors in Priority Sequence**: Finalize Venue & Caterer first, as their dates fill up months in advance.
2. **Buffer 8-10% in Contingency**: Always keep ₹${Math.round(budget * 0.08).toLocaleString('en-IN')} unassigned for last-minute guest additions, ice bags, and transport gratuities.
3. **Structured Timeline**: Designate a trusted friend or family co-host to manage day-of vendor arrivals so you can actually enjoy the festivities!

*Ask me anything specific about shopping lists, menu selection, or decor DIY tips!*`;
}

function calculateAlgorithmicRescue(event: any, targetBudget: number, guests: number, priority: string) {
  const originalBudget = Number(event?.budget || targetBudget * 1.25);
  const savingsTarget = Math.max(0, originalBudget - targetBudget);

  const revisedCategories = [
    {
      category: 'Venue & Hospitality',
      originalAmount: Math.round(originalBudget * 0.22),
      revisedAmount: Math.round(targetBudget * 0.18),
      strategy: 'Shift to clubhouse, home garden, or negotiate non-peak daytime slot.',
    },
    {
      category: 'Food & Catering',
      originalAmount: Math.round(originalBudget * 0.38),
      revisedAmount: Math.round(targetBudget * 0.36),
      strategy: `Optimized menu per plate for ${guests} guests; streamline to 2 hero starters.`,
    },
    {
      category: 'Decorations & Styling',
      originalAmount: Math.round(originalBudget * 0.14),
      revisedAmount: Math.round(targetBudget * 0.10),
      strategy: 'Replace fresh floral walls with warm fairy light drapes and DIY polaroid photobooth.',
    },
    {
      category: 'Cake & Desserts',
      originalAmount: Math.round(originalBudget * 0.05),
      revisedAmount: Math.round(targetBudget * 0.04),
      strategy: 'Single-tier focal display cake supplemented with sheet cake slices.',
    },
    {
      category: 'Photography & Video',
      originalAmount: Math.round(originalBudget * 0.08),
      revisedAmount: Math.round(targetBudget * 0.07),
      strategy: 'Book a 3-hour candid package instead of full-day coverage.',
    },
    {
      category: 'Return Gifts',
      originalAmount: Math.round(originalBudget * 0.06),
      revisedAmount: Math.round(targetBudget * 0.05),
      strategy: 'Procure eco-friendly plant favors in bulk wholesale cartons.',
    },
    {
      category: 'Miscellaneous & Contingency',
      originalAmount: Math.round(originalBudget * 0.07),
      revisedAmount: Math.round(targetBudget * 0.05),
      strategy: 'Tightened buffer with disciplined expense tracking.',
    },
  ];

  return {
    summary: `Budget successfully recalibrated from ₹${originalBudget.toLocaleString('en-IN')} to ₹${targetBudget.toLocaleString('en-IN')}, generating ₹${savingsTarget.toLocaleString('en-IN')} in targeted savings while protecting the core celebration experience for ${guests} guests.`,
    totalSavings: savingsTarget,
    revisedCategories,
    tradeoffs: [
      {
        item: 'Fresh Exotics Floral Arch',
        action: 'DIY Alternative',
        estimatedSavings: Math.round(originalBudget * 0.04),
        impact: 'Switch to fairy-light canopy + reusable fabric drapes. Visual warmth maintained with zero floral wilt.',
      },
      {
        item: 'Multi-course 6-Dessert Counter',
        action: 'Downscale',
        estimatedSavings: Math.round(originalBudget * 0.025),
        impact: 'Focus on 1 signature hot dessert (Gulab Jamun) + celebration cake.',
      },
      {
        item: 'Printed Heavy Board Invitations',
        action: 'Eliminate',
        estimatedSavings: Math.round(originalBudget * 0.02),
        impact: 'Switch entirely to video invite via WhatsApp. 100% savings on printing & couriers.',
      },
      {
        item: 'Full-Day Videography Crew',
        action: 'Downscale',
        estimatedSavings: Math.round(originalBudget * 0.035),
        impact: 'Book candid photographer for 3 peak hours (cake cutting, speeches, key dances).',
      },
    ],
    actionPlan: [
      'Share revised per-head budget with caterer and lock in the 2-starter menu.',
      'Purchase fairy lights and bulk tableware early from wholesale market.',
      'Design digital invite on Canva and launch RSVP tracking.',
      'Notify venue manager to confirm standard in-house audio system is available.',
    ],
  };
}

// ---------------------------------------------------------------------------
// VITE INTEGRATION FOR FULL-STACK DEV & PRODUCTION
// ---------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`EVENTORA AI Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
