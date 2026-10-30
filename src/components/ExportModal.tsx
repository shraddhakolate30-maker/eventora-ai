import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { EventItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const totalPlanned = event.budgetBreakdown.reduce(
    (sum, item) => sum + (item.allocatedAmount || 0),
    0
  );

  const generateTextSummary = () => {
    return `🎉 EVENTORA AI - COMPREHENSIVE EVENT BLUEPRINT
======================================================
Event Name: ${event.name}
Event Type: ${event.type}
Date: ${event.date}
Location: ${event.location || 'India'}
Guest Count: ${event.guestCount} Attendees
Total Available Budget: ₹${event.budget.toLocaleString('en-IN')}
Planned Expenditure: ₹${totalPlanned.toLocaleString('en-IN')}
Theme Concept: ${event.theme || 'Festive Elegance'}
Venue Preference: ${event.venuePreference}

💰 BUDGET ALLOCATIONS:
${event.budgetBreakdown.map((b) => `- ${b.category}: ₹${b.allocatedAmount.toLocaleString('en-IN')} (${b.notes || ''})`).join('\n')}

🛒 SHOPPING LIST ITEMS:
${event.shoppingList.map((s) => `- [${s.status.toUpperCase()}] ${s.name}: ${s.quantity} ${s.unit} @ ₹${s.estimatedUnitPrice}/unit = ₹${(s.quantity * s.estimatedUnitPrice).toLocaleString('en-IN')}`).join('\n')}

⏱️ PREPARATION TIMELINE & TASKS:
${event.timelineTasks.map((t) => `- [${t.isCompleted ? 'X' : ' '}] ${t.title} (${t.category} - Due: ${t.dueDescription})`).join('\n')}

🎁 RETURN GIFTS PLAN:
${event.returnGiftPlan ? `Recipients: ${event.returnGiftPlan.recipients} | Budget/Gift: ₹${event.returnGiftPlan.budgetPerGift} | Total: ₹${event.returnGiftPlan.totalBudget.toLocaleString('en-IN')}` : 'No return gifts specified.'}

======================================================
Generated via EVENTORA AI • "Plan Smarter. Shop Better. Celebrate Together."`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateTextSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(event, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Eventora_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Export Celebration Blueprint</h2>
              <p className="text-xs text-purple-200">{event.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          <p className="text-slate-600 leading-relaxed">
            Choose an export option below to print, download, or share your active event blueprint
            containing budget math, timeline milestones, wholesale shopping items, and favor ideas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Option 1: Print / Save PDF */}
            <div
              onClick={handlePrint}
              className="p-5 rounded-2xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 cursor-pointer transition space-y-3 text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Print / Save PDF</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Opens browser print dialog with styled print view.
                </p>
              </div>
            </div>

            {/* Option 2: Download JSON */}
            <div
              onClick={handleDownloadJson}
              className="p-5 rounded-2xl border border-slate-200 hover:border-pink-500 hover:bg-pink-50/50 cursor-pointer transition space-y-3 text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Download JSON</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Full raw event data backup file (.json).
                </p>
              </div>
            </div>

            {/* Option 3: Copy Text Summary */}
            <div
              onClick={handleCopyText}
              className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition space-y-3 text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {copied ? 'Copied!' : 'Copy Summary'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Formatted text for WhatsApp or Email.
                </p>
              </div>
            </div>
          </div>

          {/* Document Preview Box */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Document Content Preview
            </span>
            <pre className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
              {generateTextSummary()}
            </pre>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
