import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  Calendar,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  Gift,
  RefreshCw,
  Tag,
  ShieldCheck,
  User,
} from 'lucide-react';
import { EventItem, HistoryRecord } from '../types';
import { ApiService } from '../services/apiService';

interface EventHistoryProps {
  event: EventItem | null;
  onNavigate: (view: string) => void;
}

export const EventHistory: React.FC<EventHistoryProps> = ({
  event,
  onNavigate,
}) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');

  const loadHistory = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const data = await ApiService.getEventHistory(event.id);
      setRecords(data);
    } catch (err) {
      console.warn('Failed to fetch event history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [event?.id]);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Please select or create an event first to view its audit history.
      </div>
    );
  }

  const getActionBadge = (type: HistoryRecord['actionType']) => {
    switch (type) {
      case 'event_created':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-violet-600" />,
          color: 'bg-violet-100 text-violet-800 border-violet-200',
          label: 'Creation',
        };
      case 'plan_generated':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'AI Plan',
        };
      case 'plan_modified':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />,
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          label: 'Modification',
        };
      case 'budget_updated':
        return {
          icon: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'Budget',
        };
      case 'task_updated':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />,
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          label: 'Checklist',
        };
      case 'shopping_updated':
        return {
          icon: <ShoppingBag className="w-3.5 h-3.5 text-pink-600" />,
          color: 'bg-pink-100 text-pink-800 border-pink-200',
          label: 'Shopping',
        };
      case 'rescue_applied':
        return {
          icon: <TrendingDown className="w-3.5 h-3.5 text-rose-600" />,
          color: 'bg-rose-100 text-rose-800 border-rose-200',
          label: 'Rescue',
        };
      default:
        return {
          icon: <Tag className="w-3.5 h-3.5 text-slate-600" />,
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Update',
        };
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filterAction === 'all') return true;
    return r.actionType === filterAction;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Audit Trail & Activity Log
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Planning History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable log of all AI plan generations, accepted budget rescues, checklist changes, and plan modifications.
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh History
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold mr-1">Filter by:</span>
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'event_created', label: 'Creations' },
          { id: 'plan_generated', label: 'AI Plans' },
          { id: 'plan_modified', label: 'Modifications' },
          { id: 'budget_updated', label: 'Budget Changes' },
          { id: 'rescue_applied', label: 'Rescues' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterAction(f.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterAction === f.id
                ? 'bg-violet-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No History Records Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              As you update budget items, check off tasks, and apply AI plan revisions, every action will be permanently recorded here.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-violet-100 ml-4 space-y-6">
            {filteredRecords.map((record) => {
              const badge = getActionBadge(record.actionType);
              const dateObj = new Date(record.timestamp);
              return (
                <div key={record.id} className="relative pl-6 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-violet-300 transition space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">{record.title}</h4>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {dateObj.toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          at{' '}
                          {dateObj.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {record.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
