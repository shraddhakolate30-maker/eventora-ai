import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  User,
  Bot,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle,
  CornerDownLeft,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { EventItem, ChatMessage } from '../types';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';

interface ChatAssistantProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  geminiConfigured: boolean;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  event,
  onUpdateEvent,
  geminiConfigured,
}) => {
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Please select or create an event first to start the planning conversation.
      </div>
    );
  }

  const [messages, setMessages] = useState<ChatMessage[]>(event.chatHistory || []);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How can I reduce decoration expenses?',
    'Suggest affordable return gifts.',
    'What items should I purchase first?',
    'Can you suggest alternatives to an expensive venue?',
    'How do I calculate food portions to prevent waste?',
    'What are the key photo moments for this event?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      const eventContext = {
        name: event.name,
        type: event.type,
        budget: event.budget,
        guestCount: event.guestCount,
        venuePreference: event.venuePreference,
        priority: event.priority,
        location: event.location,
      };

      const res = await ApiService.sendChatMessage(text, eventContext, updatedMessages);

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
        source: res.source,
        proposedUpdate: res.proposedUpdate,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      // Save to event
      const updatedEvent: EventItem = {
        ...event,
        chatHistory: finalMessages,
      };
      StorageService.saveEvent(updatedEvent);
      onUpdateEvent(updatedEvent);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Sorry, I encountered an issue processing your request. Please verify your connection and try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const [appliedProposalIds, setAppliedProposalIds] = useState<Set<string>>(new Set());
  const [cancelledProposalIds, setCancelledProposalIds] = useState<Set<string>>(new Set());
  const [proposalErrors, setProposalErrors] = useState<Record<string, string>>({});

  const handleApplyProposal = async (msgId: string, proposal: any) => {
    if (!event || !proposal) return;

    // 1. Validation
    const proposedBudget = Number(proposal.newBudget);
    if (!proposedBudget || isNaN(proposedBudget) || proposedBudget <= 0) {
      setProposalErrors((prev) => ({
        ...prev,
        [msgId]: 'Invalid proposed budget. Must be a positive amount.',
      }));
      return;
    }

    if (!Array.isArray(proposal.newCategories) || proposal.newCategories.length === 0) {
      setProposalErrors((prev) => ({
        ...prev,
        [msgId]: 'Proposal must contain at least one valid category allocation.',
      }));
      return;
    }

    // Clear any previous error
    setProposalErrors((prev) => {
      const next = { ...prev };
      delete next[msgId];
      return next;
    });

    // 2. Map existing category actual amounts if present
    const existingActualMap = new Map<string, number>();
    (event.budgetBreakdown || []).forEach((b) => {
      existingActualMap.set(b.category.toLowerCase().trim(), b.actualAmount || 0);
    });

    const updatedCategories = proposal.newCategories.map((c: any, idx: number) => {
      const catKey = (c.category || '').toLowerCase().trim();
      return {
        id: `cat-upd-${Date.now()}-${idx}`,
        category: c.category || 'General',
        allocatedAmount: Number(c.allocatedAmount) || 0,
        actualAmount: existingActualMap.get(catKey) || 0,
        notes: c.notes || '',
        isEssential: true,
      };
    });

    // 3. Merge suggested tasks without duplicating existing titles
    let updatedTasks = [...(event.timelineTasks || [])];
    if (Array.isArray(proposal.suggestedTasks) && proposal.suggestedTasks.length > 0) {
      const existingTitles = new Set(updatedTasks.map((t) => t.title.toLowerCase().trim()));
      const newTasksToAdd = proposal.suggestedTasks
        .filter((tName: string) => !existingTitles.has(tName.toLowerCase().trim()))
        .map((tName: string, idx: number) => ({
          id: `task-prop-${Date.now()}-${idx}`,
          title: tName,
          category: 'Coordination',
          dueDate: event.date,
          dueDescription: 'Added via AI Assistant Proposal',
          isEssential: true,
          isCompleted: false,
        }));
      updatedTasks = [...newTasksToAdd, ...updatedTasks];
    }

    // 4. Construct updated event
    const historySummary =
      proposal.summary ||
      `Budget recalibrated to ₹${proposedBudget.toLocaleString('en-IN')} with ${updatedCategories.length} updated category allocations.`;

    const updatedEvent: EventItem = {
      ...event,
      budget: proposedBudget,
      theme: proposal.newTheme || event.theme,
      budgetBreakdown: updatedCategories,
      timelineTasks: updatedTasks,
    };

    const historyContext = {
      actionType: 'plan_modified',
      title: 'Plan Modified via AI Chat',
      summary: historySummary,
    };

    // 5. Update local persistent storage
    StorageService.saveEvent(updatedEvent, historyContext);

    // 6. Update server database via existing API and record audit history
    try {
      await ApiService.updateEvent(event.id, updatedEvent, historyContext);
    } catch (apiErr) {
      console.warn('Server sync error on applying proposal (saved locally):', apiErr);
    }

    // 7. Update parent state & UI
    onUpdateEvent(updatedEvent);

    // 8. Update proposal status
    setAppliedProposalIds((prev) => new Set(prev).add(msgId));
    setCancelledProposalIds((prev) => {
      const next = new Set(prev);
      next.delete(msgId);
      return next;
    });
  };

  const handleCancelProposal = (msgId: string) => {
    // Discard proposal without modifying saved data
    setCancelledProposalIds((prev) => new Set(prev).add(msgId));
    setAppliedProposalIds((prev) => {
      const next = new Set(prev);
      next.delete(msgId);
      return next;
    });
  };

  const handleReconsiderProposal = (msgId: string) => {
    setCancelledProposalIds((prev) => {
      const next = new Set(prev);
      next.delete(msgId);
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">EVENTORA AI Planner</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  geminiConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-violet-100 text-violet-800'
                }`}
              >
                {geminiConfigured ? 'Gemini AI Active' : 'Eventora Domain KB'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Active Context: <strong>{event.name}</strong> • ₹{event.budget.toLocaleString('en-IN')}{' '}
              budget for {event.guestCount} guests
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Clear conversation history for this event?')) {
              setMessages([]);
              const updatedEvent = { ...event, chatHistory: [] };
              StorageService.saveEvent(updatedEvent);
              onUpdateEvent(updatedEvent);
            }
          }}
          className="text-xs text-slate-400 hover:text-rose-600 transition"
        >
          Clear History
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Quick Planning Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 text-xs font-medium border border-slate-200 shadow-2xs transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Sparkles className="w-10 h-10 text-violet-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              Start your planning conversation
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ask about vendor bargaining, reducing expenses, menu ideas, or how to allocate your ₹
              {event.budget.toLocaleString('en-IN')} budget.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-1.5 ${
                    isUser
                      ? 'bg-violet-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                    <span className="font-semibold">{isUser ? 'You' : 'EVENTORA Assistant'}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {msg.content}
                  </div>

                  {!isUser && msg.proposedUpdate && (
                    <div className="mt-3 p-4 rounded-xl bg-violet-50/90 border-2 border-violet-200 text-violet-950 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-violet-200/80 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-violet-900">
                          <Sparkles className="w-4 h-4 text-violet-600" />
                          <span>Proposed Plan Modifications</span>
                        </div>
                        <span className="text-[10px] font-semibold bg-violet-200/70 text-violet-800 px-2 py-0.5 rounded-full">
                          Awaiting Approval
                        </span>
                      </div>

                      <p className="text-xs text-violet-900 leading-relaxed font-medium">
                        {msg.proposedUpdate.summary}
                      </p>

                      {proposalErrors[msg.id] && (
                        <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{proposalErrors[msg.id]}</span>
                        </div>
                      )}

                      {/* Budget Comparison Delta */}
                      {msg.proposedUpdate.newBudget && (
                        <div className="bg-white/80 p-2.5 rounded-lg border border-violet-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                              Budget Adjustment
                            </span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span>₹{event.budget.toLocaleString('en-IN')}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-violet-600" />
                              <span className="text-violet-700 font-extrabold text-sm">
                                ₹{msg.proposedUpdate.newBudget.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                msg.proposedUpdate.newBudget < event.budget
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : msg.proposedUpdate.newBudget > event.budget
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {msg.proposedUpdate.newBudget < event.budget
                                ? `₹${(event.budget - msg.proposedUpdate.newBudget).toLocaleString('en-IN')} Savings`
                                : msg.proposedUpdate.newBudget > event.budget
                                ? `+₹${(msg.proposedUpdate.newBudget - event.budget).toLocaleString('en-IN')} Expansion`
                                : 'Budget Neutral'}
                            </span>
                          </div>
                        </div>
                      )}

                      {msg.proposedUpdate.newTheme && (
                        <div className="text-[11px] text-violet-900 bg-white/70 px-2.5 py-1.5 rounded-lg border border-violet-100">
                          <span className="font-semibold text-slate-500">Theme: </span>
                          <span className="font-bold">{msg.proposedUpdate.newTheme}</span>
                        </div>
                      )}

                      {msg.proposedUpdate.newCategories && (
                        <div className="space-y-1 pt-1 border-t border-violet-200/60">
                          <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
                            Recalibrated Category Allocations:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                            {msg.proposedUpdate.newCategories.map((c, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center bg-white/90 px-2.5 py-1.5 rounded-md border border-violet-100/80"
                              >
                                <span className="truncate text-slate-700 font-medium">{c.category}:</span>
                                <span className="font-bold text-violet-900">
                                  ₹{c.allocatedAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Proposal Action Controls: Apply to Plan / Cancel */}
                      <div className="pt-2 border-t border-violet-200/60 flex items-center justify-between gap-2 flex-wrap">
                        {appliedProposalIds.has(msg.id) ? (
                          <div className="w-full text-xs text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-xl">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>✓ Applied to Active Event Plan (Saved & Refreshed)</span>
                          </div>
                        ) : cancelledProposalIds.has(msg.id) ? (
                          <div className="w-full flex items-center justify-between gap-2 bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <X className="w-4 h-4 text-slate-400" />
                              <span>Proposal discarded. Saved plan remains unchanged.</span>
                            </div>
                            <button
                              onClick={() => handleReconsiderProposal(msg.id)}
                              className="text-violet-700 hover:text-violet-900 font-semibold text-[11px] underline flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Review Again</span>
                            </button>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCancelProposal(msg.id)}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 text-slate-500" />
                              <span>Cancel</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApplyProposal(msg.id, msg.proposedUpdate)}
                              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Apply to Plan</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!isUser && msg.source && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Source:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md ${
                            msg.source.startsWith('gemini')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {msg.source === 'gemini-3.1-flash-lite'
                            ? 'Gemini 3.1 Flash Lite'
                            : msg.source === 'gemini-3.8-flash'
                            ? 'Gemini 3.8 Flash'
                            : msg.source.startsWith('gemini')
                            ? msg.source
                            : msg.source.includes('fallback')
                            ? 'Eventora Rule Engine (Fallback)'
                            : 'Eventora Rule Engine'}
                        </span>
                      </div>
                      <span className="text-slate-400">Estimates for reference</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-1 font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-500">
            <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
              <span>Analyzing event context and composing recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-xs focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask anything about "${event.name}"...`}
          className="flex-1 px-3 py-2 text-xs focus:outline-hidden text-slate-800"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
