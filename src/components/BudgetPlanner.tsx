import React, { useState } from 'react';
import {
  DollarSign,
  PlusCircle,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  Save,
  RotateCcw,
} from 'lucide-react';
import { EventItem, BudgetItem } from '../types';
import { StorageService } from '../services/storageService';

interface BudgetPlannerProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  onNavigate: (view: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
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

  const [categories, setCategories] = useState<BudgetItem[]>(event.budgetBreakdown || []);
  const [totalBudget, setTotalBudget] = useState<number>(event.budget);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');
  const [newCatNotes, setNewCatNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Exact mathematical calculation from category values!
  const totalPlanned = categories.reduce((sum, item) => sum + (Number(item.allocatedAmount) || 0), 0);
  const totalActual = categories.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
  const remainingBudget = totalBudget - totalPlanned;
  const utilizationPercentage =
    totalBudget > 0 ? Math.round((totalPlanned / totalBudget) * 100) : 0;
  const isOverBudget = totalPlanned > totalBudget;

  const handleUpdateCategory = (id: string, field: 'allocatedAmount' | 'actualAmount' | 'notes', val: any) => {
    const updated = categories.map((cat) => {
      if (cat.id === id) {
        return {
          ...cat,
          [field]: field === 'notes' ? val : Math.max(0, parseInt(val) || 0),
        };
      }
      return cat;
    });
    setCategories(updated);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const amount = Math.max(0, parseInt(newCatAmount) || 0);

    const newCat: BudgetItem = {
      id: `cat-${Date.now()}`,
      category: newCatName.trim(),
      allocatedAmount: amount,
      actualAmount: 0,
      notes: newCatNotes.trim(),
      isEssential: true,
    };

    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatAmount('');
    setNewCatNotes('');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleSaveChanges = () => {
    const updatedEvent: EventItem = {
      ...event,
      budget: totalBudget,
      budgetBreakdown: categories,
    };
    StorageService.saveEvent(updatedEvent);
    onUpdateEvent(updatedEvent);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToBaseline = () => {
    if (window.confirm('Reset all categories back to original AI baseline?')) {
      if (event.plan?.budgetBreakdown) {
        const resetCategories = event.plan.budgetBreakdown.map((item, idx) => ({
          id: `cat-reset-${idx}`,
          category: item.category,
          allocatedAmount: item.allocatedAmount,
          actualAmount: 0,
          notes: item.notes || '',
          isEssential: true,
        }));
        setCategories(resetCategories);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Mathematical Engine
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Smart Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Every category contributes directly to the total. Edit allocations or track actual payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToBaseline}
            title="Reset allocations to original plan"
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>

          <button
            onClick={handleSaveChanges}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            {saveSuccess ? 'Saved Successfully!' : 'Save Budget Changes'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Budget */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Available Budget</span>
            <DollarSign className="w-4 h-4 text-violet-600" />
          </div>
          {isEditingTotal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2 py-1 rounded border border-violet-400 text-lg font-bold"
              />
              <button
                onClick={() => setIsEditingTotal(false)}
                className="px-2 py-1 rounded bg-violet-600 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">
                ₹{totalBudget.toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => setIsEditingTotal(true)}
                className="text-[11px] text-violet-600 hover:underline font-semibold"
              >
                Edit
              </button>
            </div>
          )}
          <span className="text-[11px] text-slate-400 block">
            ₹{Math.round(totalBudget / Math.max(1, event.guestCount))} per guest ({event.guestCount} guests)
          </span>
        </div>

        {/* Total Estimated Planned Expenditure */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Planned Expenditure</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold">
              Sum of Categories
            </span>
          </div>
          <div className="text-2xl font-bold text-violet-700">
            ₹{totalPlanned.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {utilizationPercentage}% of total allocated
          </span>
        </div>

        {/* Remaining Budget Buffer */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Remaining Buffer</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOverBudget ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div
            className={`text-2xl font-bold ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {isOverBudget ? '-' : ''}₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
          </div>
          <span
            className={`text-[11px] font-medium block ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {isOverBudget ? 'Deficit over available budget!' : 'Safe unassigned contingency'}
          </span>
        </div>

        {/* Actual Paid Out So Far */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Actual Payments Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            ₹{totalActual.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Deposit payments recorded to vendors
          </span>
        </div>
      </div>

      {/* Over Budget Banner with Rescue Hook */}
      {isOverBudget && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Budget Overrun Detected</h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                Your planned allocations exceed the available budget by{' '}
                <strong>₹{(totalPlanned - totalBudget).toLocaleString('en-IN')}</strong>. Use Budget
                Rescue to eliminate non-essential items or scale down catering and decor.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('rescue')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 shadow-xs transition"
          >
            Open Budget Rescue
          </button>
        </div>
      )}

      {/* Visual Allocation Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Category Budget Allocation</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {utilizationPercentage}% Allocated
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          {categories.map((cat, idx) => {
            const widthPct = totalBudget > 0 ? (cat.allocatedAmount / totalBudget) * 100 : 0;
            const colors = [
              'bg-violet-600',
              'bg-pink-500',
              'bg-amber-500',
              'bg-emerald-500',
              'bg-indigo-500',
              'bg-cyan-500',
              'bg-rose-500',
              'bg-purple-600',
            ];
            return (
              <div
                key={cat.id}
                style={{ width: `${widthPct}%` }}
                className={`h-full ${colors[idx % colors.length]}`}
                title={`${cat.category}: ₹${cat.allocatedAmount.toLocaleString('en-IN')}`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-slate-600">
          {categories.map((cat, idx) => {
            const colors = [
              'bg-violet-600',
              'bg-pink-500',
              'bg-amber-500',
              'bg-emerald-500',
              'bg-indigo-500',
              'bg-cyan-500',
              'bg-rose-500',
              'bg-purple-600',
            ];
            return (
              <div key={cat.id} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
                <span>{cat.category}</span>
                <span className="font-semibold text-slate-900">
                  ₹{cat.allocatedAmount.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Category Line-Items</h3>
          <span className="text-xs text-slate-400">
            Click amounts to edit directly. Recalculates automatically.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Planned Allocation (₹)</th>
                <th className="py-3 px-4">Actual Paid (₹)</th>
                <th className="py-3 px-4">% Share</th>
                <th className="py-3 px-4">Vendor Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {cat.category}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="relative max-w-[140px]">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={cat.allocatedAmount}
                        onChange={(e) =>
                          handleUpdateCategory(cat.id, 'allocatedAmount', e.target.value)
                        }
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-bold text-slate-900 text-xs"
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="relative max-w-[140px]">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={cat.actualAmount}
                        onChange={(e) =>
                          handleUpdateCategory(cat.id, 'actualAmount', e.target.value)
                        }
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 text-xs"
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-500">
                    {totalBudget > 0
                      ? `${Math.round((cat.allocatedAmount / totalBudget) * 100)}%`
                      : '0%'}
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="text"
                      placeholder="Add vendor or menu notes..."
                      value={cat.notes}
                      onChange={(e) => handleUpdateCategory(cat.id, 'notes', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-violet-500 text-slate-600"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td className="py-3.5 px-4 uppercase text-[11px] text-slate-500">
                  Mathematically Verified Total
                </td>
                <td className="py-3.5 px-4 text-violet-700 text-sm">
                  ₹{totalPlanned.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-emerald-700 text-sm">
                  ₹{totalActual.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {utilizationPercentage}% of ₹{totalBudget.toLocaleString('en-IN')}
                </td>
                <td colSpan={2} className="py-3.5 px-4 text-right">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      isOverBudget
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOverBudget ? 'Over Budget' : 'Within Budget'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Custom Category Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-violet-600" />
          Add Custom Expense Category
        </h4>
        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Category Name (e.g. Transportation, Anchor DJ)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
          />
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
            <input
              type="number"
              min="0"
              required
              placeholder="Allocated Amount"
              value={newCatAmount}
              onChange={(e) => setNewCatAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
            />
          </div>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={newCatNotes}
            onChange={(e) => setNewCatNotes(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition"
          >
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
};
