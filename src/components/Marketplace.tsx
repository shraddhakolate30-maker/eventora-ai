import React, { useState } from 'react';
import {
  Store,
  Sparkles,
  Users,
  CheckCircle2,
  Send,
  Building,
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const Marketplace: React.FC = () => {
  const [vendorType, setVendorType] = useState('Decorator & Florist');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [phone, setPhone] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Customer RFQ simulator
  const [rfqCategory, setRfqCategory] = useState('Catering & Food');
  const [rfqDetails, setRfqDetails] = useState('');
  const [rfqBudget, setRfqBudget] = useState('25000');
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  const categories = [
    { title: 'Catering & Live Counters', count: '120+ Inquiries Monthly', description: 'Traditional feasts, live chaat stalls, mocktail bars, and gourmet buffets.' },
    { title: 'Decorators & Stage Stylists', count: '95+ Verified Listings', description: 'Balloon garlands, fresh florals, fairy light canopies, and theme sets.' },
    { title: 'Custom Bakers & Cake Artists', count: '60+ Artisanal Kitchens', description: 'Fondant milestone cakes, dessert tables, cupcakes, and tea snacks.' },
    { title: 'Wholesale Party Supplies', count: '45+ Hub Wholesalers', description: 'Bulk areca plates, lighting rolls, gift packaging, and props.' },
    { title: 'Candid Photographers & Videographers', count: '80+ Portfolios', description: 'Drone shoots, pre-wedding reels, instant prints, and family portraits.' },
    { title: 'Anchors, DJs & Sound Console', count: '50+ Verified Hosts', description: 'Bilingual emcees, karaoke setups, party speakers, and ambient mood lights.' },
  ];

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) return;
    setRegisteredSuccess(true);
  };

  const handleSendRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqDetails.trim()) return;
    setRfqSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-purple-200">
            <Store className="w-3.5 h-3.5 text-pink-400" />
            <span>EVENTORA Verified Marketplace Foundation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span className="text-pink-300 font-bold">Phase 1 Beta</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            The Celebration Vendor Ecosystem
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-normal">
            Connecting budget-conscious event hosts with vetted local decorators, wholesale suppliers,
            bakers, and caterers across major Indian cities.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-purple-200 space-y-2 shrink-0">
          <div className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Platform Integrity Notice
          </div>
          <p className="max-w-[240px] text-[11px] leading-snug">
            Vendor registration is active for early merchant onboarding. Direct online payments and
            escrow booking will launch in Phase 2.
          </p>
        </div>
      </div>

      {/* Categories Showcase */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Featured Service Categories</h2>
          <p className="text-xs text-slate-500">
            Browse planned vendor categories for event procurement and wholesale bidding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-violet-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                    {cat.count}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Coming Soon</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{cat.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-violet-700 font-semibold">
                <span>Request Quotes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Vendor Onboarding Form & Customer Request for Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Onboarding */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-violet-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Vendor & Seller Registration</h3>
              <p className="text-xs text-slate-500">
                Are you a decorator, wholesale dealer, or caterer? Join our supplier directory.
              </p>
            </div>
          </div>

          {registeredSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-950">Application Submitted!</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Thank you for registering <strong>{businessName}</strong>. Our vendor relations team
                will reach out via WhatsApp / phone ({phone}) within 48 hours for document verification.
              </p>
              <button
                onClick={() => setRegisteredSuccess(false)}
                className="mt-2 text-xs font-semibold text-emerald-700 underline"
              >
                Register another business
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Blooms Floral Studio, Delight Caterers"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Category</label>
                  <select
                    value={vendorType}
                    onChange={(e) => setVendorType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="Decorator & Florist">Decorator & Florist</option>
                    <option value="Caterer / Chef">Caterer / Chef</option>
                    <option value="Cake Artist">Custom Baker</option>
                    <option value="Wholesale Supplier">Wholesale Supplier</option>
                    <option value="Photographer">Photographer</option>
                    <option value="DJ / Sound Console">DJ & Audio</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition"
              >
                Submit Merchant Registration (Free Beta)
              </button>
            </form>
          )}
        </div>

        {/* Customer RFQ Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Request for Quote (RFQ)</h3>
              <p className="text-xs text-slate-500">
                Post your custom requirement to receive verified bids from available sellers.
              </p>
            </div>
          </div>

          {rfqSubmitted ? (
            <div className="p-6 rounded-2xl bg-pink-50 border border-pink-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-pink-600 mx-auto" />
              <h4 className="font-bold text-sm text-pink-950">Inquiry Broadcasted!</h4>
              <p className="text-xs text-pink-800 leading-relaxed">
                Your request for <strong>{rfqCategory}</strong> with a target budget of ₹
                {parseInt(rfqBudget || '0').toLocaleString('en-IN')} has been simulated. In Phase 2,
                verified partners will respond directly to your dashboard.
              </p>
              <button
                onClick={() => {
                  setRfqSubmitted(false);
                  setRfqDetails('');
                }}
                className="mt-2 text-xs font-semibold text-pink-700 underline"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendRFQ} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Requirement Category</label>
                  <select
                    value={rfqCategory}
                    onChange={(e) => setRfqCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="Catering & Food">Catering & Food</option>
                    <option value="Floral & Stage Decor">Floral & Stage Decor</option>
                    <option value="Designer Cake">Custom Cake</option>
                    <option value="Return Gifts Bulk">Return Gifts in Bulk</option>
                    <option value="Photography">Photography</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={rfqBudget}
                    onChange={(e) => setRfqBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Details & Special Requirements *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your event date, required quantities, vegetarian requirements, or theme specifics..."
                  value={rfqDetails}
                  onChange={(e) => setRfqDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition"
              >
                Send Request for Quote
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
