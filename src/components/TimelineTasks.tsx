import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  PlusCircle,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
} from 'lucide-react';
import { EventItem, TimelineTask } from '../types';
import { StorageService } from '../services/storageService';
import { calculateTimelineProgress } from '../utils/calculations';

interface TimelineTasksProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  onNavigate: (view: string) => void;
}

export const TimelineTasks: React.FC<TimelineTasksProps> = ({
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

  const [tasks, setTasks] = useState<TimelineTask[]>(event.timelineTasks || []);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Coordination');
  const [newDueDate, setNewDueDate] = useState(event.date);
  const [newDueDesc, setNewDueDesc] = useState('3 days before');
  const [newEssential, setNewEssential] = useState(true);

  // Exact mathematical calculation from modular utility
  const { completedCount, progressPercent } = calculateTimelineProgress(tasks);

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    setTasks(updated);
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      dueDate: newDueDate,
      dueDescription: newDueDesc.trim(),
      isEssential: newEssential,
      isCompleted: false,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setShowAddModal(false);
    setNewTitle('');
  };

  const saveTasks = (newTasks: TimelineTask[]) => {
    const updatedEvent: EventItem = {
      ...event,
      timelineTasks: newTasks,
    };
    StorageService.saveEvent(updatedEvent);
    onUpdateEvent(updatedEvent);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Checklist & Milestones
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Timeline & Task Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep track of vendor bookings, decor assembly, and preparation deadlines leading up to{' '}
            <strong>{event.date}</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Custom Task
        </button>
      </div>

      {/* Progress Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Preparation Progress ({completedCount} of {tasks.length} tasks completed)
          </span>
          <span className="font-bold text-emerald-700">{progressPercent}% Ready</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'pending'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pending ({tasks.filter((t) => !t.isCompleted).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Check off tasks as you execute them
        </span>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No tasks match the selected filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition ${
                task.isCompleted ? 'bg-slate-50/70 text-slate-400' : 'hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleTask(task.id)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-xs ${
                        task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.isEssential && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-100 text-violet-800">
                        Essential
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.dueDescription || task.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900">Add Milestone / Preparation Task</h3>

            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm DJ playlist, Finalize dessert table setup"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="Coordination">Coordination</option>
                    <option value="Food & Catering">Food & Catering</option>
                    <option value="Decorations">Decorations</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Return Gifts">Return Gifts</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Venue">Venue</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 days before"
                    value={newDueDesc}
                    onChange={(e) => setNewDueDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="taskEss"
                  checked={newEssential}
                  onChange={(e) => setNewEssential(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="taskEss" className="font-semibold text-slate-700 cursor-pointer">
                  High-Priority / Essential Task
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
