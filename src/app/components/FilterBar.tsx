import React from 'react';
import { Filter, Users, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MarketType, DatePreset, FilterState } from '../types';

const TODAY = new Date('2026-05-18');

const MARKET_TYPES: (MarketType | 'All')[] = ['All', 'Farmer Market', 'Sakhi Market'];

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'all',       label: 'All Time' },
  { id: 'today',     label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last5',     label: 'Last 5 Days' },
  { id: 'last30',    label: 'Last 30 Days' },
  { id: '3months',   label: '3 Months' },
];

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

function presetToDates(preset: DatePreset): { dateFrom: string; dateTo: string } {
  const today = TODAY;
  const todayStr = fmt(today);
  const sub = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return fmt(d);
  };
  switch (preset) {
    case 'today':     return { dateFrom: todayStr, dateTo: todayStr };
    case 'yesterday': return { dateFrom: sub(1),   dateTo: sub(1) };
    case 'last5':     return { dateFrom: sub(4),   dateTo: todayStr };
    case 'last30':    return { dateFrom: sub(29),  dateTo: todayStr };
    case '3months':   return { dateFrom: sub(89),  dateTo: todayStr };
    default:          return { dateFrom: '',       dateTo: '' };
  }
}

export function FilterBar() {
  const { currentUser, filters, setFilters, users } = useAppContext();

  const isManager = currentUser.subordinates.length > 0;

  const filterableUsers = currentUser.role === 'Admin'
    ? users
    : users.filter(u => currentUser.subordinates.includes(u.id));

  const hasActiveFilters =
    filters.datePreset !== 'all' ||
    filters.marketType !== 'All' ||
    filters.userId !== 'All';

  const clearFilters = () => setFilters({
    datePreset: 'all',
    dateFrom: '',
    dateTo: '',
    marketType: 'All',
    userId: 'All',
  });

  const setPreset = (preset: DatePreset) => {
    const dates = presetToDates(preset);
    setFilters({ ...filters, datePreset: preset, ...dates });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2.5">
        <Filter size={12} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-gray-700">Filters</span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2 py-1 transition-colors"
          >
            <X size={9} /> Clear
          </button>
        )}
      </div>

      {/* Date presets */}
      <div className="-mx-1 px-1 pb-1 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {DATE_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all font-medium whitespace-nowrap ${
                filters.datePreset === p.id
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdowns row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Market Type */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500 whitespace-nowrap">Market</span>
          <select
            value={filters.marketType}
            onChange={e => setFilters({ ...filters, marketType: e.target.value as MarketType | 'All' })}
            className="text-[11px] sm:text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-300 bg-white"
          >
            {MARKET_TYPES.map(mt => <option key={mt} value={mt}>{mt}</option>)}
          </select>
        </div>

        {/* Team Member (managers only) */}
        {isManager && filterableUsers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-gray-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-500 whitespace-nowrap">Member</span>
            <select
              value={filters.userId}
              onChange={e => setFilters({ ...filters, userId: e.target.value })}
              className="text-[11px] sm:text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-300 bg-white max-w-[130px]"
            >
              <option value="All">All Members</option>
              {filterableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        {!isManager && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400 border border-gray-100 rounded-lg px-2 py-1.5 bg-gray-50">
            <Users size={10} />
            <span>{currentUser.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
