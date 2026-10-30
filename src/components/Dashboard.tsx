import React from 'react';
import {
  Calendar,
  DollarSign,
  ShoppingBag,
  Gift,
  CheckSquare,
  Sparkles,
  TrendingDown,
  ArrowRight,
  PlusCircle,
  Clock,
  MapPin,
  Users,
  Copy,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { EventItem, UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
  events: EventItem[];
  activeEvent: EventItem | null;
  onSelectEvent: (id: string) => void;
  onOpenCreateEvent: () => void;
  onDuplicateEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onNavigate: (view: string) => void;
  onOpenExport: () => void;
  onToggleTask: (taskId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  events,
  activeEvent,
  onSelectEvent,
  onOpenCreateEvent,
  onDuplicateEvent,
  onDeleteEvent,
  onNavigate,
  onOpenExport,
  onToggleTask,
}) => {
  // Budget calculations
  const totalBudget = activeEvent?.budget || 0;
  const plannedExpenses =
    activeEvent?.budgetBreakdown.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0) || 0;
  const actualOrSpent =
    activeEvent?.budgetBreakdown.reduce((sum, item) => sum + (item.actualAmount || 0), 0) || 0;
  const remainingBudget = totalBudget - plannedExpenses;
  const utilizationPercent =
    totalBudget > 0 ? Math.min(100, Math.round((plannedExpenses / totalBudget) * 100)) : 0;
  const isOverBudget = plannedExpenses > totalBudget;

  // Task calculations
  const tasks = activeEvent?.timelineTasks || [];
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  // Shopping calculations
  const shoppingItems = activeEvent?.shoppingList || [];
  const purchasedItemsCount = shoppingItems.filter((i) => i.status === 'purchased').length;

  if (events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto shadow-xs">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            You haven't planned an event yet
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Let's create your first celebration! Enter your event date, budget, and guest count, and EVENTORA AI will architect a complete blueprint.
          </p>
        </div>
        <button
          onClick={onOpenCreateEvent}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold text-sm shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create My First Event
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-pink-600 text-white shadow-lg shadow-violet-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
            Celebration Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            {activeEvent
              ? `Currently managing: "${activeEvent.name}" (${activeEvent.type})`
              : 'Select an event below or generate a new celebration plan.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeEvent && (
            <button
              onClick={onOpenExport}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export Plan
            </button>
          )}

          <button
            onClick={onOpenCreateEvent}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-violet-900 text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-violet-600" />
            Create New Event
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      {activeEvent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Budget Overview */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
              <span>Total Budget</span>
              <DollarSign className="w-4 h-4 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{totalBudget.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Planned: ₹{plannedExpenses.toLocaleString('en-IN')}</span>
              <span
                className={`font-semibold ${
                  isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {isOverBudget ? 'Over Budget!' : `Left: ₹${remainingBudget.toLocaleString('en-IN')}`}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-rose-500' : utilizationPercent > 90 ? 'bg-amber-500' : 'bg-violet-600'
                }`}
                style={{ width: `${Math.min(100, utilizationPercent)}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Attendees & Per-Head */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
              <span>Guests & Hospitality</span>
              <Users className="w-4 h-4 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {activeEvent.guestCount} <span className="text-sm font-normal text-slate-500">Guests</span>
            </div>
            <div className="text-xs text-slate-500">
              Approx <strong className="text-slate-800">₹{Math.round(totalBudget / Math.max(1, activeEvent.guestCount))}</strong> per attendee
            </div>
            <div className="text-[11px] text-pink-600 font-medium">
              Venue: {activeEvent.venuePreference === 'home' ? 'Home Celebration' : 'Rented Venue'}
            </div>
          </div>

          {/* Metric 3: Pending Tasks */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
              <span>Timeline Milestones</span>
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {completedTasksCount} / {tasks.length}
            </div>
            <div className="text-xs text-slate-500">
              {pendingTasks.length > 0 ? `${pendingTasks.length} pending actions` : 'All tasks completed!'}
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-[11px] text-violet-700 font-semibold hover:underline flex items-center gap-1"
            >
              Open Checklist <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Metric 4: Shopping Items */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
              <span>Wholesale Shopping</span>
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {purchasedItemsCount} / {shoppingItems.length}
            </div>
            <div className="text-xs text-slate-500">
              {shoppingItems.length - purchasedItemsCount} items remaining to procure
            </div>
            <button
              onClick={() => onNavigate('shopping')}
              className="text-[11px] text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              Manage Shopping Cart <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Over Budget Alert Banner */}
      {isOverBudget && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Budget Warning:</span> Planned expenditure (₹
              {plannedExpenses.toLocaleString('en-IN')}) exceeds total available budget by ₹
              {(plannedExpenses - totalBudget).toLocaleString('en-IN')}.
            </div>
          </div>
          <button
            onClick={() => onNavigate('rescue')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition"
          >
            Launch Budget Rescue
          </button>
        </div>
      )}

      {/* Main Grid: Saved Events & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): My Events & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Events Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">My Saved Celebrations</h2>
                <p className="text-xs text-slate-500">
                  Switch, duplicate, or inspect your event blueprints.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                {events.length} Events
              </span>
            </div>

            <div className="space-y-3">
              {events.map((ev) => {
                const isActive = ev.id === activeEvent?.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'border-violet-500 bg-violet-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{ev.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white">
                            Active
                          </span>
                        )}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {ev.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {ev.location || 'India'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {ev.guestCount} Guests
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₹{ev.budget.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0 self-end sm:self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onDuplicateEvent(ev.id)}
                        title="Duplicate Event Plan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {events.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete plan for "${ev.name}"?`)) {
                              onDeleteEvent(ev.id);
                            }
                          }}
                          title="Delete Event Plan"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onSelectEvent(ev.id);
                          onNavigate('plan');
                        }}
                        className="ml-1 px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition"
                      >
                        View Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Tasks Quick List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">High-Priority Tasks</h3>
                <p className="text-xs text-slate-500">Check off items as you complete them.</p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1"
              >
                View All ({tasks.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No tasks added for this event yet.</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      task.isCompleted
                        ? 'bg-slate-50/80 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => onToggleTask(task.id)}
                        className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {task.dueDescription || task.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Action Cards Hub */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs text-slate-500">
              Interactive Planning Suite
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigate('plan')}
                className="w-full text-left p-3 rounded-xl bg-violet-50 hover:bg-violet-100/80 border border-violet-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-violet-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-violet-950">AI Generated Plan</div>
                    <div className="text-[11px] text-violet-700">Theme, concept & timeline</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => onNavigate('budget')}
                className="w-full text-left p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-emerald-950">Smart Budget Planner</div>
                    <div className="text-[11px] text-emerald-700">Live line-item calculations</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => onNavigate('shopping')}
                className="w-full text-left p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-600 text-white">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-amber-950">Shopping Assistant</div>
                    <div className="text-[11px] text-amber-700">Wholesale hubs & product search</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => onNavigate('gifts')}
                className="w-full text-left p-3 rounded-xl bg-pink-50 hover:bg-pink-100/80 border border-pink-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-pink-600 text-white">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-pink-950">Return Gift Planner</div>
                    <div className="text-[11px] text-pink-700">Cost = Qty × Unit Price</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="w-full text-left p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-indigo-950">AI Planning Assistant</div>
                    <div className="text-[11px] text-indigo-700">Ask questions & tweak plans</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => onNavigate('rescue')}
                className="w-full text-left p-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-600 text-white">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-rose-950">Budget Rescue Mode</div>
                    <div className="text-[11px] text-rose-700">Downscale & find savings</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition" />
              </button>
              <button
                onClick={() => onNavigate('history')}
                className="w-full text-left p-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-purple-950">Planning History & Log</div>
                    <div className="text-[11px] text-purple-700">Audit trail of all changes & plans</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Storage Architecture Card */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Persistent Database & Auth Active
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Your celebration blueprints, budget allocations, checklists, and audit history are permanently persisted in the server database with user authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
