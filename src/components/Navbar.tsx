import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  DollarSign,
  ShoppingBag,
  Gift,
  CheckSquare,
  MessageSquare,
  TrendingDown,
  Store,
  Menu,
  X,
  PlusCircle,
  Download,
  ShieldCheck,
  User,
  ChevronDown,
} from 'lucide-react';
import { EventItem, UserProfile } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  events: EventItem[];
  activeEvent: EventItem | null;
  onSelectEvent: (id: string) => void;
  onOpenCreateEvent: () => void;
  onOpenAuth: () => void;
  onOpenExport: () => void;
  user: UserProfile;
  geminiConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  events,
  activeEvent,
  onSelectEvent,
  onOpenCreateEvent,
  onOpenAuth,
  onOpenExport,
  user,
  geminiConfigured,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'plan', label: 'AI Plan' },
    { id: 'budget', label: 'Budget Planner' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'gifts', label: 'Return Gifts' },
    { id: 'tasks', label: 'Timeline & Tasks' },
    { id: 'chat', label: 'AI Assistant' },
    { id: 'rescue', label: 'Budget Rescue' },
    { id: 'history', label: 'History' },
    { id: 'marketplace', label: 'Marketplace' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner indicating mode & AI status */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-900 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            EVENTORA AI
          </span>
          <span className="hidden sm:inline text-purple-200">
            • Plan Smarter. Shop Better. Celebrate Together.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[11px] border border-white/20">
            <span
              className={`w-2 h-2 rounded-full ${
                geminiConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {geminiConfigured ? 'Gemini 3.8 Flash Active' : 'Eventora Demo Mode'}
          </span>
          <button
            onClick={onOpenAuth}
            className="text-[11px] text-purple-200 hover:text-white underline transition"
          >
            Session Info
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-violet-200 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-800 to-purple-600 bg-clip-text text-transparent">
                  EVENTORA<span className="text-pink-600">AI</span>
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                  Smart Event Studio
                </span>
              </div>
            </button>

            {/* Active Event Selector Pill */}
            {activeEvent && (
              <div className="relative hidden md:block ml-3">
                <button
                  onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-950 text-xs font-medium border border-violet-200 transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-violet-600" />
                  <span className="max-w-[140px] truncate">{activeEvent.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {eventDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Event
                    </div>
                    {events.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          onSelectEvent(ev.id);
                          setEventDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          ev.id === activeEvent.id
                            ? 'font-semibold text-violet-700 bg-violet-50/60'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{ev.name}</span>
                        <span className="text-[10px] text-slate-400">
                          ₹{ev.budget.toLocaleString('en-IN')}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setEventDropdownOpen(false);
                          onOpenCreateEvent();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-violet-600 font-medium hover:bg-violet-50 flex items-center gap-2"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Create New Event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.slice(1, 8).map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => onNavigate('rescue')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                currentView === 'rescue'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              Rescue
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                currentView === 'history'
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              History
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                currentView === 'marketplace'
                  ? 'bg-pink-600 text-white'
                  : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              <Store className="w-3 h-3" />
              Marketplace
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {activeEvent && (
              <button
                onClick={onOpenExport}
                title="Download or Print Event Plan"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Plan</span>
              </button>
            )}

            <button
              onClick={onOpenCreateEvent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white text-xs font-semibold shadow-sm shadow-violet-200 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Plan Event</span>
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs border border-violet-200">
                  {user.name.charAt(0)}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-violet-50 text-[10px] font-medium text-violet-700 border border-violet-200">
                      Interactive Demo Account
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                    Storage & Auth Status
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1">
          {activeEvent && (
            <div className="mb-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
              <div className="text-[11px] font-semibold text-violet-900 mb-1">
                Active Celebration:
              </div>
              <div className="font-bold text-xs text-violet-800">{activeEvent.name}</div>
              <div className="text-[11px] text-violet-600">
                Budget: ₹{activeEvent.budget.toLocaleString('en-IN')} • {activeEvent.guestCount} Guests
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                  currentView === link.id
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                onOpenCreateEvent();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold text-center"
            >
              + Create Event
            </button>
            {activeEvent && (
              <button
                onClick={() => {
                  onOpenExport();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium text-center"
              >
                Export
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
