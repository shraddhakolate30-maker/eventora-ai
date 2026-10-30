import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  Utensils,
  Palette,
  ShoppingBag,
  Gift,
  HelpCircle,
  AlertCircle,
  Download,
  Share2,
  TrendingDown,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { EventItem } from '../types';

interface PlanViewProps {
  event: EventItem | null;
  onNavigate: (view: string) => void;
  onOpenExport: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  event,
  onNavigate,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'decor' | 'menu' | 'gifts'>('overview');

  if (!event || !event.plan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Generated Plan Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Select or create an event to generate your tailored AI celebration blueprint.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { plan } = event;
  const isGeminiSource = plan.source === 'gemini-3.8-flash';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Plan Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-purple-200 border border-white/20">
                {event.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-[11px] font-semibold text-pink-300 border border-pink-400/30">
                ₹{event.budget.toLocaleString('en-IN')} Budget Pool
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-semibold text-emerald-300 border border-emerald-400/30">
                {event.guestCount} Guests
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-amber-300 border border-amber-300/30">
                <Sparkles className="w-3 h-3" />
                {isGeminiSource ? 'Gemini 3.8 Flash' : 'Eventora Rule Engine'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{event.name}</h1>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-normal">
              {plan.overview}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenExport}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-violet-900 text-xs font-bold shadow-md flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Plan
            </button>
            <button
              onClick={() => onNavigate('rescue')}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Rescue Budget
            </button>
          </div>
        </div>

        {/* Concept Theme & Palette Preview Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-400" />
            <span className="text-purple-200">Theme Concept:</span>
            <span className="font-semibold text-white">{plan.conceptTheme}</span>
          </div>

          {plan.colorPalette && plan.colorPalette.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-[11px]">Palette:</span>
              <div className="flex items-center gap-1.5">
                {plan.colorPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full border border-white/40 shadow-xs"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview & Budget', icon: DollarSign },
          { id: 'timeline', label: 'Timeline & Tasks', icon: Clock },
          { id: 'decor', label: 'Decorations & Styling', icon: Palette },
          { id: 'menu', label: 'Menu & Entertainment', icon: Utensils },
          { id: 'gifts', label: 'Return Gifts & Favors', icon: Gift },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Budget Breakdown */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(plan.budgetBreakdown || []).map((cat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-violet-300 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{cat.category}</span>
                  <span className="text-violet-700 font-extrabold text-sm">
                    ₹{cat.allocatedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {cat.notes || 'Allocated fund benchmark for category vendor or supplies.'}
                </div>
                <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                  <span>
                    {Math.round((cat.allocatedAmount / Math.max(1, event.budget)) * 100)}% of total budget
                  </span>
                  <span className="text-emerald-600 font-medium">Estimated</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-between text-xs text-violet-900">
            <span>
              Need to fine-tune individual line item costs or add actual payments?
            </span>
            <button
              onClick={() => onNavigate('budget')}
              className="px-3.5 py-1.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 flex items-center gap-1 transition"
            >
              Open Budget Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Budget Saving Recommendations */}
          {plan.budgetSavingTips && plan.budgetSavingTips.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Smart Cost-Saving Recommendations
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.budgetSavingTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions & Pricing Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-500" />
              Important Cost Assumptions & Disclaimers
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
              {(plan.assumptions || [
                'All figures are benchmark estimates in Indian Rupees (INR) based on market averages.',
                'Prices may fluctuate based on festival seasons, wedding calendar auspicious dates (Muhurats), and weekend bookings.',
                'Taxes (GST 5-18%) and transport freight are typically charged additionally by vendors.',
              ]).map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Timeline & Tasks */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline Milestones */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                Preparation Timeline
              </h3>
              <div className="space-y-4">
                {(plan.timeline || []).map((tl, idx) => (
                  <div key={idx} className="relative pl-6 pb-2 border-l-2 border-violet-200 last:border-none">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-violet-600" />
                    <span className="text-xs font-bold text-violet-900 block mb-1">
                      {tl.timeframe}
                    </span>
                    <ul className="space-y-1">
                      {tl.milestones.map((m, mIdx) => (
                        <li key={mIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-violet-400">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Checklist */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Action Checklist
                </h3>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-xs text-violet-600 font-semibold hover:underline"
                >
                  Manage All Tasks
                </button>
              </div>

              <div className="space-y-2">
                {(plan.tasks || []).map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between bg-slate-50/50"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">{task.title}</span>
                      <span className="text-[11px] text-slate-400">
                        {task.category} • Due: {task.dueDescription}
                      </span>
                    </div>
                    {task.isEssential && (
                      <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 text-[10px] font-bold">
                        Essential
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Decorations & Styling */}
      {activeTab === 'decor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(plan.decorations || []).map((dec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-pink-300 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{dec.title}</h4>
                  {dec.isDiy && (
                    <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-700 text-[10px] font-bold">
                      DIY Friendly
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{dec.description}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-between text-xs text-pink-900">
            <span>
              Find matching balloon kits, fairy lights, and drapes on our Wholesale Shopping guide.
            </span>
            <button
              onClick={() => onNavigate('shopping')}
              className="px-3.5 py-1.5 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 flex items-center gap-1 transition"
            >
              Go to Shopping <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Menu & Entertainment */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Catering Menu */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                Catering Course Blueprint
              </h3>
              <div className="space-y-4">
                {(plan.foodMenu || []).map((course, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {course.course}
                    </span>
                    <ul className="space-y-1">
                      {course.items.map((item, iIdx) => (
                        <li key={iIdx} className="text-xs text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities & Entertainment */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Celebration Activities & Games
              </h3>
              <div className="space-y-3">
                {(plan.activities || []).map((act, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{act.name}</span>
                      {act.duration && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {act.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Return Gifts */}
      {activeTab === 'gifts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(plan.returnGifts || []).map((gift, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-amber-300 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{gift.name}</h4>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ₹{gift.estimatedCostPerGift} / gift
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{gift.description}</p>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                  <span>Category: {gift.category}</span>
                  {gift.isBulkFriendly && (
                    <span className="text-emerald-600 font-semibold">Bulk Friendly</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between text-xs text-amber-900">
            <span>
              Calculate exact bulk totals (Quantity × Unit Cost) and compare options in the Return Gift Planner.
            </span>
            <button
              onClick={() => onNavigate('gifts')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 flex items-center gap-1 transition"
            >
              Open Return Gift Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
