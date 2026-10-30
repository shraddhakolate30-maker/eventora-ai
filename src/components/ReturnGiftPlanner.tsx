import React, { useState } from 'react';
import {
  Gift,
  Sparkles,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Save,
  Tag,
  Leaf,
  Coffee,
  Smile,
  ShieldAlert,
} from 'lucide-react';
import { EventItem, ReturnGiftPlan, ReturnGiftIdea } from '../types';
import { StorageService } from '../services/storageService';
import { calculateReturnGiftMetrics } from '../utils/calculations';

interface ReturnGiftPlannerProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  onNavigate: (view: string) => void;
}

export const ReturnGiftPlanner: React.FC<ReturnGiftPlannerProps> = ({
  event,
  onUpdateEvent,
  onNavigate,
}) => {
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Please select or create an event first.
      </div>
    );
  }

  // Pre-fill from event
  const existingPlan = event.returnGiftPlan;
  const eventAllocatedGiftBudget =
    event.budgetBreakdown.find((b) => b.category === 'Return Gifts')?.allocatedAmount ||
    Math.round(event.budget * 0.06);

  const [recipients, setRecipients] = useState<number>(
    existingPlan?.recipients || event.guestCount || 40
  );
  const [ageGroup, setAgeGroup] = useState<'Kids' | 'Adults' | 'Mixed' | 'Seniors'>(
    existingPlan?.ageGroup || 'Mixed'
  );
  const [budgetPerGift, setBudgetPerGift] = useState<number>(
    existingPlan?.budgetPerGift || Math.round(eventAllocatedGiftBudget / Math.max(1, recipients))
  );
  const [category, setCategory] = useState<string>(
    existingPlan?.category || 'Eco-Friendly & Keepsakes'
  );
  const [personalization, setPersonalization] = useState<string>(
    existingPlan?.personalization || 'Custom name tag ribbon'
  );
  const [selectedIdeaName, setSelectedIdeaName] = useState<string>(
    existingPlan?.ideas?.[0]?.name || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Exact mathematical calculation from modular utility
  const { totalGiftCost, isExceedingAllocated } = calculateReturnGiftMetrics(
    recipients,
    budgetPerGift,
    eventAllocatedGiftBudget
  );

  const curatedGiftIdeas: ReturnGiftIdea[] = [
    {
      name: 'Potted Mini Jade / Succulent in Terracotta Cup',
      category: 'Eco-Friendly',
      estimatedCostPerGift: 120,
      description: 'Living sustainable plant symbolizing good fortune with personalized printed kraft band.',
      isBulkFriendly: true,
      diyTip: 'Buy nursery trays wholesale (₹60/plant) and pot into mini earthen cups with twine ribbon.',
    },
    {
      name: 'Gourmet Kashmiri Raw Honey Jar (100g) with Wooden Dipper',
      category: 'Edible & Wellness',
      estimatedCostPerGift: 150,
      description: 'Pure forest honey packed in hexagonal glass jar with custom message label.',
      isBulkFriendly: true,
      diyTip: 'Order 10kg raw honey bulk canister and fill mini jars at home to save 40%.',
    },
    {
      name: 'Artisan Brass Diya or Mogra Scented Soy Candle in Tin',
      category: 'Handicrafts & Decor',
      estimatedCostPerGift: 140,
      description: 'Festive keepsake popular for housewarming, weddings, and traditional celebrations.',
      isBulkFriendly: true,
      diyTip: 'Procure brass diyas from Moradabad wholesale dealers in packs of 50.',
    },
    {
      name: 'Handcrafted Wooden Tangram & Animal Puzzle Set',
      category: 'Kids Special',
      estimatedCostPerGift: 110,
      description: 'Non-toxic sustainable wooden puzzle with cotton drawstring pouch.',
      isBulkFriendly: true,
      diyTip: 'Available at Crawford Market / Sadar Bazaar wholesale novelty shops at ₹70-80 in carton lots.',
    },
    {
      name: 'Handwoven Jute Potli with California Almonds (100g)',
      category: 'Edible & Traditional',
      estimatedCostPerGift: 160,
      description: 'Golden lace drawstring potli filled with vacuum-packed premium almonds.',
      isBulkFriendly: true,
      diyTip: 'Buy almonds in 5kg wholesale cartons from local Market Yard.',
    },
    {
      name: 'Seed Paper Botanical Diary & Plantable Seed Pen',
      category: 'Eco-Friendly',
      estimatedCostPerGift: 130,
      description: 'Pocket notebook embedded with marigold/basil seeds that can be planted in soil after use.',
      isBulkFriendly: true,
      diyTip: 'Great conversation starter for college fests, farewells, and green corporate offsites.',
    },
  ];

  const handleSavePlan = () => {
    const updatedPlan: ReturnGiftPlan = {
      recipients,
      ageGroup,
      budgetPerGift,
      totalBudget: totalGiftCost,
      category,
      personalization,
      ideas: curatedGiftIdeas,
    };

    // Also update return gifts in budget breakdown if desired
    const updatedBreakdown = event.budgetBreakdown.map((b) => {
      if (b.category === 'Return Gifts') {
        return {
          ...b,
          allocatedAmount: totalGiftCost,
        };
      }
      return b;
    });

    const updatedEvent: EventItem = {
      ...event,
      returnGiftPlan: updatedPlan,
      budgetBreakdown: updatedBreakdown,
    };

    StorageService.saveEvent(updatedEvent);
    onUpdateEvent(updatedEvent);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
              Celebration Keepsakes
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Return Gift & Favors Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Calculate exact bulk favor costs, explore curated themes, and avoid overspending.
          </p>
        </div>

        <button
          onClick={handleSavePlan}
          className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
        >
          <Save className="w-3.5 h-3.5" />
          {savedSuccess ? 'Saved to Event!' : 'Save Gift Plan'}
        </button>
      </div>

      {/* Mathematical Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-200">
            Total Return Gift Calculation
          </span>
          <div className="text-3xl sm:text-4xl font-black">
            ₹{totalGiftCost.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-pink-100">
            Formula: <strong>{recipients} Recipients</strong> × <strong>₹{budgetPerGift} Per Gift</strong> = ₹{totalGiftCost.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-1.5 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <span className="text-pink-200">Event Budget Allocation:</span>
            <span className="font-bold">₹{eventAllocatedGiftBudget.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-pink-200">Budget Status:</span>
            <span
              className={`font-extrabold ${
                isExceedingAllocated ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              {isExceedingAllocated
                ? `Exceeds by ₹${(totalGiftCost - eventAllocatedGiftBudget).toLocaleString('en-IN')}`
                : `₹${(eventAllocatedGiftBudget - totalGiftCost).toLocaleString('en-IN')} remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Warning if Exceeds */}
      {isExceedingAllocated && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Budget Warning:</span> The proposed gift plan (₹
            {totalGiftCost.toLocaleString('en-IN')}) exceeds the allocated return gift category pool
            (₹{eventAllocatedGiftBudget.toLocaleString('en-IN')}). Consider opting for DIY bulk packaging or selecting an idea under ₹{Math.floor(eventAllocatedGiftBudget / Math.max(1, recipients))} per gift.
          </div>
        </div>
      )}

      {/* Parameter Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Gift className="w-4 h-4 text-pink-600" />
          Gift Parameters & Customization
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Number of Recipients *</label>
            <input
              type="number"
              min="1"
              value={recipients}
              onChange={(e) => setRecipients(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Budget Per Gift (₹) *</label>
            <input
              type="number"
              min="10"
              step="10"
              value={budgetPerGift}
              onChange={(e) => setBudgetPerGift(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Recipient Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
            >
              <option value="Mixed">Mixed (All Family & Friends)</option>
              <option value="Kids">Kids & Toddlers</option>
              <option value="Adults">Adults & Working Pros</option>
              <option value="Seniors">Elders & Senior Relatives</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Personalization Style</label>
            <input
              type="text"
              placeholder="e.g. Handwritten Thank You tags"
              value={personalization}
              onChange={(e) => setPersonalization(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Curated Ideas Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Curated Gift Concepts & DIY Sourcing Ideas
            </h3>
            <p className="text-xs text-slate-500">
              Benchmark ideas tailored for Indian celebrations with bulk savings insights.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedGiftIdeas.map((idea, idx) => {
            const isSelected = selectedIdeaName === idea.name;
            const projectedCost = recipients * idea.estimatedCostPerGift;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-white border shadow-xs transition space-y-3 flex flex-col justify-between ${
                  isSelected
                    ? 'border-pink-500 ring-2 ring-pink-100 bg-pink-50/20'
                    : 'border-slate-200 hover:border-pink-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                      {idea.category}
                    </span>
                    <span className="text-xs font-extrabold text-pink-700">
                      ₹{idea.estimatedCostPerGift} / piece
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{idea.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{idea.description}</p>

                  {idea.diyTip && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <strong className="text-slate-800">DIY Tip:</strong> {idea.diyTip}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total for {recipients} units:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{projectedCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedIdeaName(idea.name);
                        setBudgetPerGift(idea.estimatedCostPerGift);
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ Selected Gift' : 'Select This Idea'}
                    </button>

                    <a
                      href={`https://www.amazon.in/s?k=${encodeURIComponent(idea.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Search products on Amazon India"
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
