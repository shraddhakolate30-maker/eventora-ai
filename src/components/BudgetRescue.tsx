import React, { useState } from 'react';
import {
  TrendingDown,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Users,
  Layers,
  Check,
  Loader2,
  Info,
} from 'lucide-react';
import { EventItem, BudgetItem } from '../types';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';

interface BudgetRescueProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  onNavigate: (view: string) => void;
}

export const BudgetRescue: React.FC<BudgetRescueProps> = ({
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

  const originalBudget = event.budget;
  const currentTotal = event.budgetBreakdown.reduce(
    (sum, item) => sum + (item.allocatedAmount || 0),
    0
  );

  const [targetBudget, setTargetBudget] = useState<number>(
    Math.round(Math.min(originalBudget * 0.8, currentTotal * 0.8))
  );
  const [targetGuests, setTargetGuests] = useState<number>(event.guestCount);
  const [priority, setPriority] = useState<string>('Maximum Savings');
  const [loading, setLoading] = useState(false);
  const [rescueResult, setRescueResult] = useState<any | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleRunRescue = async () => {
    setLoading(true);
    setAppliedSuccess(false);
    try {
      const res = await ApiService.rescueBudget(event, targetBudget, targetGuests, priority);
      setRescueResult(res.rescuePlan);
    } catch (err: any) {
      console.error(err);
      alert('Failed to optimize budget: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToEvent = () => {
    if (!rescueResult) return;

    // Apply the revised categories and new target budget to the event
    const updatedCategories: BudgetItem[] = rescueResult.revisedCategories.map(
      (cat: any, idx: number) => ({
        id: `cat-rescued-${idx}`,
        category: cat.category,
        allocatedAmount: cat.revisedAmount,
        actualAmount: 0,
        notes: `Rescued: ${cat.strategy}`,
        isEssential: true,
      })
    );

    const updatedEvent: EventItem = {
      ...event,
      budget: targetBudget,
      guestCount: targetGuests,
      budgetBreakdown: updatedCategories,
    };

    StorageService.saveEvent(updatedEvent);
    onUpdateEvent(updatedEvent);
    setAppliedSuccess(true);
  };

  const calculatedDifference = originalBudget - targetBudget;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              Plan Optimization Engine
            </span>
            <span className="text-amber-200 text-xs">•</span>
            <span className="text-white/80 text-xs">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Budget Rescue & Downscaling</h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
            Need to trim costs without ruining the celebration? Define your new target budget and
            EVENTORA AI will calculate strategic substitutions, vendor trade-offs, and DIY
            alternatives.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
          <span className="text-xs text-amber-200 block uppercase font-semibold">
            Current Benchmark
          </span>
          <span className="text-2xl font-bold text-white">
            ₹{originalBudget.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-amber-200 block mt-0.5">
            {event.guestCount} Guests • ₹{Math.round(originalBudget / Math.max(1, event.guestCount))}/head
          </span>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-amber-600" />
          Define Your Rescued Target Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Target Rescued Budget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Rescued Target Budget (₹)</label>
              <span className="font-bold text-amber-700">
                ₹{targetBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={Math.round(originalBudget * 0.4)}
              max={originalBudget}
              step="1000"
              value={targetBudget}
              onChange={(e) => setTargetBudget(parseInt(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>₹{Math.round(originalBudget * 0.4).toLocaleString('en-IN')} (-60%)</span>
              <span>₹{originalBudget.toLocaleString('en-IN')} (Current)</span>
            </div>
            <div className="text-xs text-emerald-700 font-semibold pt-1">
              Estimated Target Savings: ₹{calculatedDifference.toLocaleString('en-IN')} (
              {Math.round((calculatedDifference / originalBudget) * 100)}%)
            </div>
          </div>

          {/* Adjusted Guest Count */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Adjusted Guest Count
            </label>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="5"
                max="5000"
                value={targetGuests}
                onChange={(e) => setTargetGuests(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
              />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Reduces per-plate catering expenditure directly.
            </span>
          </div>

          {/* Rescue Priority */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Rescue Strategy Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
            >
              <option value="Maximum Savings">Maximum Cost Savings (High DIY)</option>
              <option value="Protect Food Quality">Protect Food Quality (Trim Decor/Gifts)</option>
              <option value="Protect Decor & Photos">Protect Aesthetics & Candid Photos</option>
              <option value="Balanced Trimming">Balanced Equal Trimming</option>
            </select>
            <span className="text-[11px] text-slate-400 block">
              Guides where cuts are taken without ruining core moments.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Calculates line-by-line substitutions with realistic trade-off explanations.
          </span>
          <button
            onClick={handleRunRescue}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-pink-600 hover:from-amber-700 hover:to-pink-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Run Budget Rescue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rescue Results Section */}
      {rescueResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Summary Banner */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Optimization Overview
              </span>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full">
                ₹{rescueResult.totalSavings?.toLocaleString('en-IN')} Total Projected Savings
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {rescueResult.summary}
            </p>
          </div>

          {/* Trade-Offs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Strategic Trade-Offs & Substitutions
                </h3>
                <p className="text-xs text-slate-500">
                  Transparent explanations of what changes and why.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {(rescueResult.tradeoffs || []).map((t: any, idx: number) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{t.item}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.action === 'Eliminate'
                            ? 'bg-rose-100 text-rose-800'
                            : t.action === 'DIY Alternative'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.action}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{t.impact}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-emerald-700 block">
                      +₹{t.estimatedSavings?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400">Estimated Saving</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Category Comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Side-by-Side Category Allocation Comparison
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Original Allocation</th>
                    <th className="py-3 px-4">Rescued Allocation</th>
                    <th className="py-3 px-4">Category Savings</th>
                    <th className="py-3 px-4">Strategic Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(rescueResult.revisedCategories || []).map((cat: any, idx: number) => {
                    const diff = cat.originalAmount - cat.revisedAmount;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {cat.category}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          ₹{cat.originalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-700 font-mono">
                          ₹{cat.revisedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {diff > 0 ? `+₹${diff.toLocaleString('en-IN')}` : '₹0'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{cat.strategy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Button: Apply Plan */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Ready to lock in this optimized budget?
              </h4>
              <p className="text-xs text-slate-500">
                This updates your active event's budget pool to ₹{targetBudget.toLocaleString('en-IN')} and syncs your budget categories.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {appliedSuccess ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rescued Plan Applied!</span>
                </div>
              ) : (
                <button
                  onClick={handleApplyToEvent}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  Apply Rescued Plan to Event
                </button>
              )}
              <button
                onClick={() => onNavigate('budget')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Go to Budget Planner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
