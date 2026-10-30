import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Check,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  EventType,
  VenuePreference,
  FoodPreference,
  PlanningPriority,
  EventItem,
} from '../types';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventItem) => void;
  initialCategory?: EventType;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  initialCategory,
}) => {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>(initialCategory || 'Birthday Party');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21); // Default 3 weeks in future
    return d.toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('Bangalore, Karnataka');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [budget, setBudget] = useState<number>(50000);
  const [theme, setTheme] = useState('Modern Pastel Elegance');
  const [venuePreference, setVenuePreference] = useState<VenuePreference>('rented');
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('veg_nonveg');
  const [returnGiftsRequired, setReturnGiftsRequired] = useState(true);
  const [priority, setPriority] = useState<PlanningPriority>('best_food');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  if (!isOpen) return null;

  const eventTypes: EventType[] = [
    'Birthday Party',
    'Wedding',
    'Engagement',
    'College Fest',
    'Farewell Party',
    'Baby Shower',
    'Festival Celebration',
    'Family Function',
    'Community Event',
    'Custom Event',
  ];

  const handleValidate = () => {
    setError(null);
    if (!name.trim() || name.trim().length < 3) {
      setError('Please provide an event title of at least 3 characters.');
      return false;
    }
    if (!date) {
      setError('Please select an event date.');
      return false;
    }
    if (guestCount < 1) {
      setError('Guest count must be at least 1 person.');
      return false;
    }
    if (budget < 1000) {
      setError('Please enter a realistic celebration budget (minimum ₹1,000).');
      return false;
    }
    return true;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidate()) {
      setStep('review');
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const eventPayload = {
        name: name.trim(),
        type,
        date,
        location: location.trim(),
        guestCount: Number(guestCount),
        budget: Number(budget),
        currency: 'INR',
        theme: theme.trim(),
        venuePreference,
        foodPreference,
        returnGiftsRequired,
        priority,
        additionalRequirements: additionalRequirements.trim(),
      };

      const result = await ApiService.generatePlan(eventPayload);
      const plan = result.plan;

      // Map generated budget categories into editable line-items
      const budgetBreakdown = (plan.budgetBreakdown || []).map((item, idx) => ({
        id: `cat-${Date.now()}-${idx}`,
        category: item.category,
        allocatedAmount: item.allocatedAmount,
        actualAmount: 0,
        notes: item.notes || '',
        isEssential: true,
      }));

      // Map shopping list
      const shoppingList = (plan.shoppingList || []).map((item, idx) => ({
        id: `shop-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || 'items',
        estimatedUnitPrice: item.estimatedUnitPrice,
        isEssential: item.isEssential ?? true,
        status: 'need_to_buy' as const,
      }));

      // Map timeline tasks
      const timelineTasks = (plan.tasks || []).map((item, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        title: item.title,
        category: item.category,
        dueDate: date,
        dueDescription: item.dueDescription || 'Before event',
        isEssential: item.isEssential ?? true,
        isCompleted: false,
      }));

      const newEvent: EventItem = {
        id: `event-${Date.now()}`,
        name: name.trim(),
        type,
        date,
        location: location.trim(),
        guestCount: Number(guestCount),
        budget: Number(budget),
        currency: 'INR',
        theme: theme.trim(),
        venuePreference,
        foodPreference,
        returnGiftsRequired,
        priority,
        additionalRequirements: additionalRequirements.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        plan: {
          ...plan,
          source: result.source,
        },
        budgetBreakdown,
        shoppingList,
        timelineTasks,
        returnGiftPlan: returnGiftsRequired
          ? {
              recipients: Number(guestCount),
              ageGroup: 'Mixed',
              budgetPerGift: Math.round((Number(budget) * 0.06) / Math.max(1, Number(guestCount))),
              totalBudget: Math.round(Number(budget) * 0.06),
              category: 'Eco-Friendly & Keepsakes',
              personalization: `${name} Keepsake`,
              ideas: plan.returnGifts || [],
            }
          : undefined,
        chatHistory: [
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `I've prepared a complete celebration blueprint for "${name}" with a budget of ₹${budget.toLocaleString('en-IN')} for ${guestCount} guests. You can customize the budget categories, review the shopping list, or ask me for modifications anytime!`,
            timestamp: new Date().toISOString(),
            source: result.source,
          },
        ],
      };

      StorageService.saveEvent(newEvent);
      onEventCreated(newEvent);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate event plan. Please check inputs and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {step === 'form' ? 'Create New Event Blueprint' : 'Review Event Parameters'}
              </h2>
              <p className="text-xs text-purple-200">
                {step === 'form'
                  ? 'Define event specifics for precision AI budgeting'
                  : 'Verify information before neural plan generation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Step */}
        {step === 'form' && (
          <form onSubmit={handleProceedToReview} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riya's Sweet 16, Ananya & Rahul Wedding Sangeet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Category *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                >
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Celebration Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Mumbai, Bangalore, Delhi NCR"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Guests *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {/* Total Budget */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Budget in INR (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden font-semibold"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  ₹{budget.toLocaleString('en-IN')} total pool (approx ₹{Math.round(budget / Math.max(1, guestCount))} / guest)
                </span>
              </div>

              {/* Theme or Style */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Theme / Concept
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retro Disco, Royal Traditional, Pastel Minimalist"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {/* Venue Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Venue Preference
                </label>
                <select
                  value={venuePreference}
                  onChange={(e) => setVenuePreference(e.target.value as VenuePreference)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                >
                  <option value="home">Home / Terrace / Lawn</option>
                  <option value="outdoor">Outdoor Park / Open Ground</option>
                  <option value="rented">Rented Banquet Hall / Resort</option>
                  <option value="undecided">Undecided / Need Recommendation</option>
                </select>
              </div>

              {/* Food Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Food & Catering Style
                </label>
                <select
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value as FoodPreference)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                >
                  <option value="pure_veg">Pure Vegetarian Feast</option>
                  <option value="veg_nonveg">Vegetarian & Non-Veg Mixed</option>
                  <option value="jain">Jain Friendly</option>
                  <option value="buffet">Live Counters & Buffet</option>
                  <option value="high_tea">High Tea & Snacks Only</option>
                </select>
              </div>

              {/* Return Gifts Required */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Return Gifts / Favors Required?
                </label>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="returnGifts"
                      checked={returnGiftsRequired}
                      onChange={() => setReturnGiftsRequired(true)}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>Yes, include in budget</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="returnGifts"
                      checked={!returnGiftsRequired}
                      onChange={() => setReturnGiftsRequired(false)}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>No return gifts</span>
                  </label>
                </div>
              </div>

              {/* Planning Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Main Planning Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PlanningPriority)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                >
                  <option value="lowest_cost">Lowest Cost / Maximum Savings</option>
                  <option value="best_food">Best Food & Culinary Experience</option>
                  <option value="decorations">Vibrant Aesthetics & Photo Decor</option>
                  <option value="maximum_guests">Maximum Guest Accommodation</option>
                  <option value="premium_experience">Premium VIP Hospitality</option>
                </select>
              </div>

              {/* Additional Requirements */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Notes or Custom Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wheelchair accessible venue, dedicated kids activity zone, specific color palette, acoustic music only..."
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
              >
                <span>Review & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 space-y-3 text-xs">
              <div className="font-bold text-sm text-violet-950 flex items-center justify-between">
                <span>{name}</span>
                <span className="px-2 py-0.5 rounded-md bg-violet-200 text-violet-800 text-[11px]">
                  {type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Date</span>
                  <span className="font-semibold">{date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Location</span>
                  <span className="font-semibold">{location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Guest Count</span>
                  <span className="font-semibold">{guestCount} Guests</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Budget</span>
                  <span className="font-semibold text-violet-700">
                    ₹{budget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Theme</span>
                  <span className="font-semibold">{theme}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Priority</span>
                  <span className="font-semibold capitalize">{priority.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Venue & Food</span>
                  <span className="font-semibold capitalize">
                    {venuePreference} • {foodPreference.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Return Gifts</span>
                  <span className="font-semibold">{returnGiftsRequired ? 'Yes' : 'None'}</span>
                </div>
              </div>

              {additionalRequirements && (
                <div className="pt-2 border-t border-violet-200/50">
                  <span className="text-slate-400 block text-[11px]">Notes:</span>
                  <p className="text-slate-600 italic">{additionalRequirements}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Clicking <strong>Generate Event Plan</strong> will invoke the EVENTORA AI engine to compute your category budget allocations, draft a step-by-step preparation timeline, and compile a wholesale shopping list.
            </p>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Architecting Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Event Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
