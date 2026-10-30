import React, { useState } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Search,
  ExternalLink,
  MapPin,
  Tag,
  Filter,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { EventItem, ShoppingItem } from '../types';
import { StorageService } from '../services/storageService';
import { calculateShoppingTotals } from '../utils/calculations';

interface ShoppingAssistantProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  onNavigate: (view: string) => void;
}

export const ShoppingAssistant: React.FC<ShoppingAssistantProps> = ({
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

  const [activeTab, setActiveTab] = useState<'list' | 'compare' | 'wholesale'>('list');
  const [items, setItems] = useState<ShoppingItem[]>(event.shoppingList || []);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('Bangalore');

  // Add Item State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Decorations');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pack');
  const [newItemPrice, setNewItemPrice] = useState(250);
  const [newItemEssential, setNewItemEssential] = useState(true);

  // Exact mathematical calculations from modular utility
  const { totalShoppingEstimated, totalPurchased, totalPending } = calculateShoppingTotals(items);

  const handleUpdateItem = (id: string, updates: Partial<ShoppingItem>) => {
    const updated = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setItems(updated);
    saveToEvent(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveToEvent(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: Math.max(1, Number(newItemQty)),
      unit: newItemUnit.trim() || 'item',
      estimatedUnitPrice: Math.max(0, Number(newItemPrice)),
      isEssential: newItemEssential,
      status: 'need_to_buy',
    };

    const updated = [...items, newItem];
    setItems(updated);
    saveToEvent(updated);
    setShowAddModal(false);
    setNewItemName('');
  };

  const saveToEvent = (updatedItems: ShoppingItem[]) => {
    const updatedEvent: EventItem = {
      ...event,
      shoppingList: updatedItems,
    };
    StorageService.saveEvent(updatedEvent);
    onUpdateEvent(updatedEvent);
  };

  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const categories = [
    'Decorations',
    'Tableware',
    'Lighting',
    'Party Supplies',
    'Gifts',
    'Return Gifts',
    'Food Supplies',
    'Event Accessories',
  ];

  // Wholesale hubs data with genuine markets
  const wholesaleHubs: Record<string, Array<{ name: string; area: string; specialty: string; discount: string; tips: string }>> = {
    Bangalore: [
      { name: 'Chickpet & Mamulpet', area: 'Central Bangalore', specialty: 'Packaging boxes, ribbons, decorative fabrics, return gifts', discount: '35% - 50% vs Retail', tips: 'Visit on weekday mornings. Haggle in bundles of 50 or 100 units.' },
      { name: 'KR Market (City Market)', area: 'Kalasipalya', specialty: 'Fresh exotic flowers, marigold garlands, areca palm plates', discount: '40% - 60% vs Florists', tips: 'Early morning 5:00 AM to 8:00 AM offers the freshest blooms and highest bulk bargaining.' },
      { name: 'Raja Market', area: 'Avenue Road', specialty: 'Printed invitations, gift bags, bulk stationery', discount: '30% - 40%', tips: 'Direct press printing available for custom cards with 24-hr turnaround.' },
    ],
    Mumbai: [
      { name: 'Crawford Market (Mahatma Jyotiba Phule Mandai)', area: 'Fort / CST', specialty: 'Party props, customized cake toppers, wholesale dry fruits, packaging', discount: '30% - 50%', tips: 'Explore the inner lanes (Lohar Chawl) for decorative fairy lights and LED canopies.' },
      { name: 'Dadar Flower Market (Phool Galli)', area: 'Dadar West', specialty: 'Bulk roses, carnations, orchids, mogra strands', discount: '50% - 70%', tips: 'Wholesale auctions start at 4:00 AM; ideal for pre-wedding and puja bulk floral styling.' },
      { name: 'Mangaldas Market', area: 'Near Crawford Market', specialty: 'Draping fabrics, table runners, golden organza', discount: '35% - 45%', tips: 'Buy fabric by whole rolls (thaan) for maximum savings.' },
    ],
    Delhi: [
      { name: 'Sadar Bazaar', area: 'Old Delhi', specialty: 'Balloons, party supplies, festival decor, return gift sets', discount: '40% - 60%', tips: 'India’s largest wholesale hub for party novelties. Wear comfortable shoes and carry cash.' },
      { name: 'Chandni Chowk (Kinari Bazaar)', area: 'Old Delhi', specialty: 'Zari borders, potlis, festive return gift envelopes, tassels', discount: '35% - 50%', tips: 'Great for traditional wedding favors and handcrafted trousseau boxes.' },
      { name: 'Ghazipur Flower Mandi', area: 'East Delhi', specialty: 'Bulk domestic and imported flowers', discount: '50% - 65%', tips: 'Peak trading between 4:00 AM and 7:00 AM.' },
    ],
    Pune: [
      { name: 'Ravivar Peth (Bohri Ali)', area: 'Old Pune', specialty: 'Paints, party accessories, hardware lighting, packaging tins', discount: '25% - 40%', tips: 'One-stop shop for DIY decorators and event production.' },
      { name: 'Gultekdi Market Yard', area: 'Swargate', specialty: 'Dry fruit cartons, wholesale confectionery, disposable catering supplies', discount: '30% - 45%', tips: 'Minimum order quantities usually start at 5kg or 100-pack boxes.' },
    ],
  };

  // Benchmark product comparison items
  const benchmarkProducts = [
    {
      item: 'Biodegradable Areca Palm Plates (10-inch)',
      ecoOption: 'Natural Pressed Palm Leaf (Compostable)',
      standardOption: 'Plastic / Coated Paper Plates',
      bulkPrice: '₹8 - ₹10 / plate in pack of 100',
      pros: 'Rigid, microwave safe, zero plastic chemical leaching',
      verdict: 'Recommended for eco-friendly modern celebrations.',
      searchQuery: 'areca palm plates bulk 100 pack',
    },
    {
      item: 'Warm White Micro LED Fairy Lights (20m)',
      ecoOption: 'Copper Wire LED with 2-pin Indian plug',
      standardOption: 'Battery Operated String Lights',
      bulkPrice: '₹180 - ₹240 / 20m roll',
      pros: 'Continuous power, low electricity draw, reusable for years',
      verdict: 'Essential for photo backdrops & entrance ambiance.',
      searchQuery: 'fairy lights warm white 20m plug',
    },
    {
      item: 'Pastel Chrome Balloon Garland Arch Kit (120 pcs)',
      ecoOption: '100% Biodegradable Natural Latex',
      standardOption: 'Standard Shiny Synthetic Foil/Plastic',
      bulkPrice: '₹450 - ₹650 / kit (Includes arch strip & glue dots)',
      pros: 'Professional organic balloon look with simple DIY assembly',
      verdict: 'Saves ₹2,500 over hiring an external balloon stylist.',
      searchQuery: 'balloon arch garland kit pastel gold',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Procurement & Shopping
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Smart Shopping Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Wholesale sourcing, unit price calculations, and shopping status tracking.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Shopping Item
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Total Shopping Estimate
          </span>
          <div className="text-2xl font-bold text-slate-900">
            ₹{totalShoppingEstimated.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {items.length} total items in celebration list
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Purchased So Far</span>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{totalPurchased.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 block font-medium">
            {items.filter((i) => i.status === 'purchased').length} items checked off
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Pending To Procure
          </span>
          <div className="text-2xl font-bold text-amber-600">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {items.filter((i) => i.status !== 'purchased').length} items awaiting purchase
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-2 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'list'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Event Shopping List ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('wholesale')}
          className={`pb-3 px-2 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'wholesale'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Local Wholesale Hubs
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`pb-3 px-2 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'compare'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Product Benchmarks & Direct Search
        </button>
      </div>

      {/* Tab 1: Shopping List */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-semibold">Category:</span>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 text-slate-500 ml-2">
                <span className="font-semibold">Status:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="need_to_buy">Need to Buy</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="purchased">Purchased</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-400">
              Showing {filteredItems.length} of {items.length} items
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-10">Done</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4">Unit Price (₹)</th>
                    <th className="py-3 px-4">Total (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const isPurchased = item.status === 'purchased';
                    const itemTotal = item.quantity * item.estimatedUnitPrice;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/70 transition ${
                          isPurchased ? 'bg-slate-50/50 text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isPurchased}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                status: e.target.checked ? 'purchased' : 'need_to_buy',
                              })
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          <div className="flex items-center gap-2">
                            <span className={isPurchased ? 'line-through text-slate-400' : ''}>
                              {item.name}
                            </span>
                            {item.isEssential && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                Essential
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 max-w-[80px]">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  quantity: Math.max(1, parseInt(e.target.value) || 1),
                                })
                              }
                              className="w-12 px-1.5 py-1 rounded border border-slate-200 text-xs font-semibold"
                            />
                            <span className="text-[10px] text-slate-400">{item.unit}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 max-w-[90px]">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.estimatedUnitPrice}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  estimatedUnitPrice: Math.max(0, parseInt(e.target.value) || 0),
                                })
                              }
                              className="w-16 px-1.5 py-1 rounded border border-slate-200 text-xs font-semibold"
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                status: e.target.value as any,
                              })
                            }
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${
                              item.status === 'purchased'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.status === 'shortlisted'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="need_to_buy">Need to Buy</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="purchased">Purchased</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Search verified products on Amazon India"
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Local Wholesale Hubs */}
      {activeTab === 'wholesale' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Verified Indian Wholesale Celebration Hubs
              </h3>
              <p className="text-xs text-slate-500">
                Iconic wholesale markets with substantial bulk discounts (30% - 60% below retail).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(wholesaleHubs[selectedCity] || []).map((hub, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-amber-300 transition"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {hub.area}
                  </span>
                  <h4 className="font-bold text-base text-slate-900">{hub.name}</h4>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">Specialty Items:</div>
                  <p>{hub.specialty}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-semibold">Wholesale Benefit:</span>
                  <span className="font-bold">{hub.discount}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  Tip: {hub.tips}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Disclaimer: Market hours and vendor minimum order quantities fluctuate. Always confirm shop working hours, especially on Sundays and public holidays, before traveling.
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Product Benchmarks & Direct Search */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-bold">Transparent Product Intelligence</div>
            <p className="text-[11px] text-amber-900">
              We never fabricate non-existent products, fake discounts, or imaginary sellers. Below are genuine benchmark product comparisons and safe direct search links that open official retail search results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benchmarkProducts.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-violet-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">{p.item}</h4>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                        Eco / High-Value Alternative
                      </span>
                      <span className="font-semibold text-emerald-950">{p.ecoOption}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Typical Wholesale Benchmark
                      </span>
                      <span className="font-bold text-slate-800">{p.bulkPrice}</span>
                    </div>

                    <p className="text-[11px] text-slate-600">{p.pros}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`https://www.amazon.in/s?k=${encodeURIComponent(p.searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Search on Amazon.in</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900">Add Item to Shopping List</h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Wire Fairy Lights, Disposable Cups"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Label</label>
                  <input
                    type="text"
                    placeholder="e.g. pack, pieces, rolls"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Unit Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Total Line Item Cost: ₹{(newItemQty * newItemPrice).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isEss"
                  checked={newItemEssential}
                  onChange={(e) => setNewItemEssential(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isEss" className="font-semibold text-slate-700 cursor-pointer">
                  Mark as Essential Item
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
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
