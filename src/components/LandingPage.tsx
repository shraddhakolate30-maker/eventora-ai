import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Cake,
  Heart,
  Crown,
  GraduationCap,
  Users,
  Baby,
  Flame,
  Home,
  Compass,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  Gift,
  Calendar,
  ShieldCheck,
  TrendingDown,
  Layers,
  Store,
  MapPin,
} from 'lucide-react';
import { EventType } from '../types';

interface LandingPageProps {
  onPlanEvent: () => void;
  onExploreCategory: (type: EventType) => void;
  onNavigate: (view: string) => void;
  geminiConfigured: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlanEvent,
  onExploreCategory,
  onNavigate,
  geminiConfigured,
}) => {
  const eventCategories: Array<{
    type: EventType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
  }> = [
    {
      type: 'Birthday Party',
      label: 'Birthday Party',
      description: '1st milestones, sweet 16s, to grand 50th jubilees with custom themes & games.',
      icon: <Cake className="w-6 h-6 text-pink-500" />,
      color: 'border-pink-200 hover:border-pink-400 bg-pink-50/40',
      badge: 'Most Popular',
    },
    {
      type: 'Wedding',
      label: 'Wedding',
      description: 'Multi-day celebrations, sangeet, pheras, and reception budget masterclasses.',
      icon: <Crown className="w-6 h-6 text-amber-500" />,
      color: 'border-amber-200 hover:border-amber-400 bg-amber-50/40',
      badge: 'Full Scale',
    },
    {
      type: 'Engagement',
      label: 'Engagement & Roka',
      description: 'Intimate ring ceremonies, ring platters, floral decor, and family feasts.',
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      color: 'border-rose-200 hover:border-rose-400 bg-rose-50/40',
      badge: 'Elegance',
    },
    {
      type: 'College Fest',
      label: 'College Fest',
      description: 'Sponsorship budgets, stage acoustics, artist hospitality, and crowd control.',
      icon: <GraduationCap className="w-6 h-6 text-indigo-500" />,
      color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/40',
      badge: 'Campus Ready',
    },
    {
      type: 'Farewell Party',
      label: 'Farewell Party',
      description: 'Sentimental memories, superlative awards, customized mementos, and buffets.',
      icon: <Users className="w-6 h-6 text-violet-500" />,
      color: 'border-violet-200 hover:border-violet-400 bg-violet-50/40',
      badge: 'Memories',
    },
    {
      type: 'Baby Shower',
      label: 'Baby Shower (Godh Bharai)',
      description: 'Pastel themes, blessing ceremonies, mom-to-be pampering, and cute favors.',
      icon: <Baby className="w-6 h-6 text-teal-500" />,
      color: 'border-teal-200 hover:border-teal-400 bg-teal-50/40',
      badge: 'Blessings',
    },
    {
      type: 'Festival Celebration',
      label: 'Festival Celebration',
      description: 'Diwali melas, Dandiya nights, Christmas socials, and Holi community parties.',
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      color: 'border-orange-200 hover:border-orange-400 bg-orange-50/40',
      badge: 'Vibrant',
    },
    {
      type: 'Family Function',
      label: 'Family Function',
      description: 'Anniversaries, housewarming (Griha Pravesh), poojas, and family reunions.',
      icon: <Home className="w-6 h-6 text-emerald-500" />,
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40',
      badge: 'Heritage',
    },
    {
      type: 'Community Event',
      label: 'Community & Society Event',
      description: 'RWA sports days, charity fundraisers, cultural evenings, and potlucks.',
      icon: <Users className="w-6 h-6 text-cyan-500" />,
      color: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/40',
      badge: 'Collaborative',
    },
    {
      type: 'Custom Event',
      label: 'Custom Event',
      description: 'Bespoke corporate offsites, product launches, pet parties, or weekend mixers.',
      icon: <Compass className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-200 hover:border-purple-400 bg-purple-50/40',
      badge: 'Tailored',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-violet-50/80 via-white to-slate-50">
        <div className="absolute top-0 inset-x-0 h-40 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-violet-200/50 via-pink-100/30 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Next-Gen Celebration Planning Architecture</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-violet-600">INR (₹) Native</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Celebrate Without the Chaos.{' '}
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Plan Smarter. Shop Better.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
              EVENTORA AI transforms your guest count, budget, and vision into a mathematically sound
              event blueprint, categorized wholesale shopping list, preparation timeline, and return
              gift breakdown in seconds.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onPlanEvent}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Plan My Event</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const target = document.getElementById('interactive-features');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm shadow-xs transition"
              >
                Explore Features
              </button>
            </div>

            {/* AI Engine Status Badge */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {geminiConfigured
                  ? 'Connected to live Gemini 3.8 Flash Engine'
                  : 'Eventora Rule Engine active (Connect Gemini API Key in Secrets for live generation)'}
              </span>
            </div>
          </div>

          {/* Interactive Preview Mock Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-slate-400">
                  EVENTORA Intelligent Dashboard Preview
                </span>
              </div>
              <span className="text-violet-300 font-medium">Live Budget Mathematics</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block uppercase">
                  Available Budget
                </span>
                <span className="text-2xl font-bold text-slate-900">₹50,000</span>
                <div className="mt-2 text-xs text-emerald-600 font-medium">
                  ✓ Within target allocation
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block uppercase">
                  Planned Expenditure
                </span>
                <span className="text-2xl font-bold text-violet-700">₹47,200</span>
                <div className="mt-2 text-xs text-slate-500">
                  Buffer Reserve: <strong className="text-emerald-700">₹2,800</strong>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block uppercase">
                  Guest Per-Head
                </span>
                <span className="text-2xl font-bold text-pink-600">₹944 / head</span>
                <div className="mt-2 text-xs text-slate-500">50 Confirmed Attendees</div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span>Food & Catering: <strong>38%</strong></span>
                <span>Decor: <strong>14%</strong></span>
                <span>Return Gifts: <strong>6%</strong></span>
                <span>Contingency: <strong>6%</strong></span>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-violet-700 font-semibold hover:underline flex items-center gap-1"
              >
                Open Full Interactive Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Event Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
            Tailored Domain Blueprints
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Select Your Celebration</h2>
          <p className="text-sm text-slate-600">
            Choose from 10 distinct celebration templates engineered with authentic Indian festive traditions, venue constraints, and budgeting nuances.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {eventCategories.map((cat) => (
            <div
              key={cat.type}
              onClick={() => onExploreCategory(cat.type)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${cat.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs group-hover:scale-110 transition">
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {cat.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-violet-700 transition">
                  {cat.label}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">{cat.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-violet-700 group-hover:translate-x-0.5 transition">
                <span>Start Planning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Step AI Planning Process */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
              The Eventora Workflow
            </span>
            <h2 className="text-3xl font-bold">How Intelligent Planning Works</h2>
            <p className="text-sm text-slate-400">
              From input to celebration day in 4 seamless, mathematically verified steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-400/50 transition">
              <div className="w-10 h-10 rounded-xl bg-violet-600/30 text-violet-300 font-bold flex items-center justify-center mb-4 text-base border border-violet-500/30">
                01
              </div>
              <h3 className="font-bold text-base mb-2">Define Vision & Budget</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide your date, estimated guest count, preferred style, venue type (home or rented), and hard budget in INR (₹).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-400/50 transition">
              <div className="w-10 h-10 rounded-xl bg-pink-600/30 text-pink-300 font-bold flex items-center justify-center mb-4 text-base border border-pink-500/30">
                02
              </div>
              <h3 className="font-bold text-base mb-2">Intelligent Cost Breakdown</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The engine calculates category allocations (catering, decor, cake, photo, return gifts) matching real market price benchmarks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 text-amber-300 font-bold flex items-center justify-center mb-4 text-base border border-amber-500/30">
                03
              </div>
              <h3 className="font-bold text-base mb-2">Smart Wholesale Shopping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review items categorized into essential vs optional with wholesale hub discovery, unit prices, and direct retailer queries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center mb-4 text-base border border-emerald-500/30">
                04
              </div>
              <h3 className="font-bold text-base mb-2">Celebrate Stress-Free</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track countdown milestones with task checkboxes, consult the conversational assistant, and export a print-ready plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="interactive-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
            Interactive Capabilities
          </span>
          <h2 className="text-3xl font-bold text-slate-900">
            Built for Serious Event Math, Not Just Mockups
          </h2>
          <p className="text-sm text-slate-600">
            Every button is wired to real state. Quantities recalculate totals, budgets notify on overages, and savings are genuinely computed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Budget Planner</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Editable line-item categories with live sum calculations. Calculates remaining buffer, alerts when exceeding total budget, and keeps finances healthy.
            </p>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1"
            >
              Open Budget Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Budget Rescue & Optimization</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Faced with a budget cut or sudden expense? Run Budget Rescue to automatically downscale optional items and suggest high-impact DIY substitutes.
            </p>
            <button
              onClick={() => onNavigate('rescue')}
              className="text-xs font-semibold text-pink-600 hover:text-pink-800 flex items-center gap-1"
            >
              Explore Budget Rescue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Return Gift Planner</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Calculates Total Cost = Quantity × Unit Price. Suggests eco-friendly plants, dry fruit potlis, and wooden games tailored by age group.
            </p>
            <button
              onClick={() => onNavigate('gifts')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
            >
              Open Return Gift Planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Shopping List</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Track status: Need to Buy, Shortlisted, Purchased. Live calculation of shopping cart totals against available shopping funds.
            </p>
            <button
              onClick={() => onNavigate('shopping')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Shopping List <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Wholesale Hub Discovery</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Directory of iconic Indian wholesale markets (Crawford Market, Chandni Chowk, Chickpet) with insider bargaining tips and bulk discounts.
            </p>
            <button
              onClick={() => onNavigate('shopping')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              Find Wholesale Hubs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Future Vendor Marketplace</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Foundation for verified local caterers, bakers, decorators, and wholesale dealers with quote requests and vendor registration.
            </p>
            <button
              onClick={() => onNavigate('marketplace')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              Explore Marketplace Beta <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Budget-Friendly Tips Showcase for Indian Celebrations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-950 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                Cost-Saving Wisdom
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                How EVENTORA Users Save 25%–40% on Celebrations
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                Traditional event planning in India often suffers from vague per-plate caterer markups, hidden venue electricity charges, and impulsive retail gift purchases. EVENTORA helps you structure costs before spending a single rupee.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Wholesale sourcing for party favors & fairy lights</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Interactive digital invitations saving paper & delivery</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Catering portion calculation to stop expensive food waste</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>DIY backdrop styling ideas with reusable fabrics & props</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-3">
              <div className="text-3xl font-black text-amber-300">₹12,500+</div>
              <p className="text-xs text-purple-100 font-medium">
                Average estimated savings per 50-guest celebration when following Eventora guidelines.
              </p>
              <button
                onClick={onPlanEvent}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-violet-900 font-bold text-xs shadow-md transition"
              >
                Plan Your Event Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">EVENTORA AI</span>
            </div>
            <p className="text-xs leading-relaxed">
              "Plan Smarter. Shop Better. Celebrate Together." The modern AI event planning platform for life’s most cherished celebrations.
            </p>
            <div className="text-[11px] text-slate-400">
              Currency: Indian Rupee (INR ₹) • Demo Architecture
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Core Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('plan')} className="hover:text-violet-700">
                  AI Plan Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('budget')} className="hover:text-violet-700">
                  Smart Budget Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shopping')} className="hover:text-violet-700">
                  Shopping & Product Search
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gifts')} className="hover:text-violet-700">
                  Return Gift Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rescue')} className="hover:text-violet-700">
                  Budget Rescue Assistant
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Event Types
            </h4>
            <ul className="space-y-2">
              <li>Birthday Parties (All Ages)</li>
              <li>Weddings & Engagements</li>
              <li>College & Campus Fests</li>
              <li>Baby Showers & Godh Bharai</li>
              <li>Festivals & Family Reunions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Platform Integrity
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              All prices and budgets displayed are benchmark market estimates. EVENTORA never fabricates fake confirmed vendor bookings or fictitious live inventories.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
              Interactive Demo Active. Ready for Firebase / PostgreSQL database configuration.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 py-6 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} EVENTORA AI. All rights reserved. Designed for joyful, stress-free celebrations.
        </div>
      </footer>
    </div>
  );
};
