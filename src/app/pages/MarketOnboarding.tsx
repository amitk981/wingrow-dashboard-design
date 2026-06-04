import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Store, Clock, Search, SlidersHorizontal, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ONBOARDINGS, USERS } from '../data/mockData';
import { Onboarding, OnboardingStatus } from '../types';

const TODAY = new Date('2026-05-18');

const STATUS_STYLE: Record<OnboardingStatus, string> = {
  'Pending':     'bg-amber-50 text-amber-700 border border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-600 border border-blue-200',
  'Approved':    'bg-[#d1fae5] text-[#047857] border border-[#6ee7b7]',
  'Rejected':    'bg-red-50 text-red-600 border border-red-200',
};

const DOC_STYLE: Record<string, string> = {
  'Agreement':         'bg-amber-100 text-amber-700',
  'Permission Letter': 'bg-rose-100 text-rose-700',
  'No Objection':      'bg-gray-100 text-gray-600',
  'None':              'bg-gray-50 text-gray-400',
};

function userName(id: string) { return USERS.find(u => u.id === id)?.name ?? id; }
function userInitials(id: string) { return USERS.find(u => u.id === id)?.initials ?? '?'; }
function userColor(id: string) {
  const c = ['bg-rose-500', 'bg-teal-500', 'bg-violet-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  return c[id.charCodeAt(id.length - 1) % c.length];
}
function Avatar({ id }: { id: string }) {
  return <div className={`w-8 h-8 ${userColor(id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{userInitials(id)}</div>;
}

export function MarketOnboarding() {
  const { currentUser, filters } = useAppContext();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const results = ONBOARDINGS.filter(o => {
      if (filters.dateFrom && o.createdAt < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && o.createdAt > new Date(filters.dateTo + 'T23:59:59')) return false;
      if (filters.marketType !== 'All' && o.marketType !== filters.marketType) return false;
      if (filters.userId !== 'All' && o.createdBy !== filters.userId) return false;
      if (currentUser.role !== 'Admin' && currentUser.subordinates.length === 0 && o.createdBy !== currentUser.id) return false;
      if (search && !o.marketName.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [filters, currentUser, search]);

  const totalMarkets = filtered.length;
  const pendingReview = filtered.filter(o => o.status === 'Pending' || o.status === 'In Progress').length;
  const activeMarkets = filtered.filter(o => o.status === 'Approved').length;

  const stats = [
    { label: 'Total Markets', value: totalMarkets, bg: 'bg-blue-50', icon: Store, color: 'text-blue-500', alert: false },
    { label: 'Pending Review', value: pendingReview, bg: 'bg-amber-50', icon: AlertTriangle, color: 'text-amber-500', alert: pendingReview > 0 },
    { label: 'Active Markets', value: activeMarkets, bg: 'bg-green-50', icon: CheckCircle, color: 'text-green-500', alert: false },
  ];

  const formatRent = (amount: number) => {
    if (amount >= 100000) return `₹ ${(amount / 1000).toFixed(0)}K`;
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-full bg-rose-50/40">
      {/* Header */}
      <div className="hidden md:flex px-6 py-4 bg-white border-b border-gray-100 items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Market Onboarding</h1>
        <Avatar id={currentUser.id} />
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col gap-4 border-gray-100`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                {s.alert && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-600">Action Required</span>}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 gap-3">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search markets..."
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap flex-shrink-0">
            <SlidersHorizontal size={15} className="text-gray-500" /> Filters
          </button>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-4">
          {filtered.map(o => {
            const manager = userName(o.managerId);
            return (
              <div key={o.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4">
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 bg-rose-50">
                    {o.id}
                  </span>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${STATUS_STYLE[o.status]}`}>
                    {o.status === 'Pending' ? 'IN REVIEW' : o.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {format(o.createdAt, "MMM d, yyyy, h:mm a")}
                </p>
                <h3 className="text-[20px] font-extrabold text-gray-900 mb-2 leading-tight">{o.marketName}</h3>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-4">
                  PIN: {o.pinCode} • {o.marketAddress}
                </p>

                <div className="bg-slate-50/50 border border-slate-100 rounded-[16px] p-4 mb-4 space-y-3">
                  <div className="flex justify-between">
                    <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</p><p className="text-[12px] font-bold text-gray-800">{o.category}</p></div>
                    <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ownership</p><p className="text-[12px] font-bold text-gray-800">{o.ownershipType}</p></div>
                  </div>
                  <div className="w-full h-px bg-slate-100" />
                  <div className="flex justify-between">
                    <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Manager</p><p className="text-[12px] font-bold text-gray-800">{manager}</p></div>
                    <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Outlets</p><p className="text-[12px] font-bold text-gray-800">{o.numberOfOutlets}</p></div>
                  </div>
                  <div className="w-full h-px bg-slate-100" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Day / Time</p>
                    <p className="text-[12px] font-bold text-gray-800">{o.operatingDays} • {o.operatingTime}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between px-1">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rent / Week</p>
                    <p className="text-[10px] text-gray-400">{o.bondingMethod}</p>
                  </div>
                  <p className="text-[22px] font-extrabold text-gray-900">
                    {formatRent(o.rentPerOutletPerWeek)}
                    <span className="text-[11px] font-medium text-gray-400 ml-2">
                      (Avg. ₹{o.numberOfOutlets ? Math.round(o.rentPerOutletPerWeek / o.numberOfOutlets).toLocaleString('en-IN') : 0}/wk)
                    </span>
                  </p>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-14 bg-white rounded-[24px] border border-gray-100 shadow-sm">
              <Store size={36} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No markets found.</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    'Market ID', 'Pin Code', 'Market Name & Address', 'Category', 'Households',
                    'Ownership Type', 'Docs', 'Day / Time', 'Number of Outlets',
                    'Manager', 'Booking Method', 'Rent Details (Per Week)', 'Status', 'Primary Actions'
                  ].map(h => (
                    <th key={h} className={`px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${['Status', 'Primary Actions'].includes(h) ? 'text-center' : 'text-left'}`}>
                      {h === 'Rent Details (Per Week)' ? (
                        <div className="flex items-center gap-1.5">
                          {h}
                          <Info size={14} className="text-blue-500" />
                        </div>
                      ) : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(o => {
                  const manager = userName(o.managerId);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      {/* Market ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 bg-rose-50">{o.id}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{format(o.createdAt, 'MMM d, yyyy, h:mm a')}</p>
                      </td>
                      {/* Pin Code */}
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{o.pinCode}</td>
                      {/* Market Name & Address */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-sm font-medium text-gray-800">{o.marketName}</p>
                        <p className="text-[11px] text-gray-400 leading-tight mt-0.5 line-clamp-2">{o.marketAddress}</p>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap">{o.category}</span>
                      </td>
                      {/* Households */}
                      <td className="px-4 py-3 text-xs text-gray-600 text-center">{o.households || '–'}</td>
                      {/* Ownership Type */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap">{o.ownershipType}</span>
                      </td>
                      {/* Docs */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${DOC_STYLE[o.docType]}`}>{o.docType}</span>
                      </td>
                      {/* Day / Time */}
                      <td className="px-4 py-3 min-w-[120px]">
                        <p className="text-xs text-gray-700">{o.operatingDays}</p>
                        <p className="text-[11px] text-gray-400">{o.operatingTime}</p>
                      </td>
                      {/* Number of Outlets */}
                      <td className="px-4 py-3 text-xs text-gray-600 text-center">{o.numberOfOutlets}</td>
                      {/* Manager */}
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{manager}</td>
                      {/* Booking Method */}
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{o.bondingMethod.toUpperCase()}</td>
                      {/* Rent Details */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-bold text-gray-800">{formatRent(o.rentPerOutletPerWeek)}</p>
                        <p className="text-[11px] text-[#94a3b8] mt-0.5">
                          Avg. ₹ {o.numberOfOutlets ? Math.round(o.rentPerOutletPerWeek / o.numberOfOutlets).toLocaleString('en-IN') : 0} / Wk / Outlet
                        </p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center justify-center gap-1.5 text-center mx-auto">
                          <span className={`inline-block w-[110px] text-[10px] font-bold py-1.5 rounded-full whitespace-nowrap tracking-wider ${STATUS_STYLE[o.status]}`}>
                            {o.status === 'Pending' ? 'IN REVIEW' : o.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[#94a3b8] whitespace-nowrap font-medium">
                            {format(o.updatedAt, 'MMM d, yyyy, h:mm a')}
                          </span>
                        </div>
                      </td>
                      {/* Primary Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="px-5 py-2 text-[10px] font-bold text-[#94a3b8] border border-[#e2e8f0] rounded-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                            Approve
                          </button>
                          <button className="px-5 py-2 text-[10px] font-bold text-[#94a3b8] border border-[#e2e8f0] rounded-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-14 text-gray-300">
                <Store size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm text-gray-400">No markets found.</p>
              </div>
            )}
          </div>

          {/* Pagination stub */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">‹</button>
              <span className="text-xs bg-rose-500 text-white px-2.5 py-1 rounded-lg font-bold">1</span>
              <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
