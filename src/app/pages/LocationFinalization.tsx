import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { differenceInDays, format } from 'date-fns';
import { Plus, AlertTriangle, Clock, CheckSquare, Search, SlidersHorizontal, X, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { FINALIZATIONS, APPROVALS, USERS } from '../data/mockData';
import { Finalization, MarketType, FinalizationStatus, Approval } from '../types';
import { OnboardingDrawer } from '../components/OnboardingDrawer';

const TODAY = new Date('2026-05-18');
const OVERDUE_DAYS = 5;

const STATUS_STYLE: Record<FinalizationStatus, string> = {
  'In Review':          'bg-blue-50 text-blue-600 border border-blue-200',
  'Approved':           'bg-green-50 text-green-600 border border-green-200',
  'Sent to Onboarding': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
};

const STATUS_ACTION: Record<FinalizationStatus, string> = {
  'In Review':          '',
  'Approved':           '',
  'Sent to Onboarding': 'bg-emerald-500 text-white',
};

const DOC_STYLE: Record<string, string> = {
  'Agreement':        'bg-amber-100 text-amber-700',
  'Permission Letter':'bg-blue-100 text-blue-700',
  'No Objection':     'bg-gray-100 text-gray-600',
  'None':             'bg-gray-50 text-gray-400',
};

function userName(id: string) { return USERS.find(u => u.id === id)?.name ?? id; }
function userInitials(id: string) { return USERS.find(u => u.id === id)?.initials ?? '?'; }
function userColor(id: string) {
  const c = ['bg-rose-500','bg-teal-500','bg-violet-500','bg-amber-500','bg-blue-500','bg-emerald-500'];
  return c[id.charCodeAt(id.length - 1) % c.length];
}
function Avatar({ id }: { id: string }) {
  return <div className={`w-8 h-8 ${userColor(id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{userInitials(id)}</div>;
}

export function LocationFinalization() {
  const { currentUser, filters } = useAppContext();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(highlightId);
  const [search, setSearch] = useState('');
  const [onboardingTarget, setOnboardingTarget] = useState<Finalization | null>(null);
  const [resolved, setResolved] = useState<Record<string, 'approved' | 'rejected'>>({});
  const canApprove = currentUser.subordinates.length > 0 || currentUser.role === 'Admin';

  const resolveApproval = (id: string, action: 'approved' | 'rejected') => {
    setResolved(prev => ({ ...prev, [id]: action }));
  };

  useEffect(() => {
    if (!highlightId) return;
    setActiveHighlight(highlightId);
    const scrollTimer = setTimeout(() => {
      document.getElementById(`row-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    const clearTimer = setTimeout(() => setActiveHighlight(null), 3500);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
  }, [highlightId]);

  const filtered = useMemo(() =>
    FINALIZATIONS.filter(f => {
      if (filters.dateFrom && f.createdAt < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && f.createdAt > new Date(filters.dateTo + 'T23:59:59')) return false;
      if (filters.marketType !== 'All' && f.marketType !== filters.marketType) return false;
      if (filters.userId !== 'All' && f.createdBy !== filters.userId) return false;
      if (currentUser.role !== 'Admin' && currentUser.subordinates.length === 0 && f.createdBy !== currentUser.id) return false;
      if (search && !f.marketName.toLowerCase().includes(search.toLowerCase()) && !f.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }), [filters, currentUser, search]);

  const pendingApprovals = APPROVALS.filter(a => a.module === 'Location Finalization' && a.status === 'Pending' && a.assignedTo === currentUser.id && !resolved[a.id]);
  const overdueApprovals = pendingApprovals.filter(a => differenceInDays(TODAY, a.requestedAt) > OVERDUE_DAYS);

  const stats = [
    { label: 'Total Markets',      value: filtered.length,                                             bg: 'bg-blue-50',    icon: CheckSquare, color: 'text-blue-500',    alert: false },
    { label: 'Pending Review',      value: pendingApprovals.length,                                     bg: 'bg-amber-50',   icon: Clock,       color: 'text-amber-500',   alert: pendingApprovals.length > 0, overdue: overdueApprovals.length > 0 },
    { label: 'Approved Markets',    value: filtered.filter(f => f.status === 'Approved').length,        bg: 'bg-green-50',   icon: CheckSquare, color: 'text-green-500',   alert: false },
    { label: 'Send to Onboarding',  value: filtered.filter(f => f.status === 'Sent to Onboarding').length, bg: 'bg-emerald-50', icon: CheckSquare, color: 'text-emerald-500', alert: false },
  ];

  return (
    <div className="min-h-full bg-rose-50/40">
      <div className="hidden md:flex px-6 py-4 bg-white border-b border-gray-100 items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Location Finalization</h1>
        <Avatar id={currentUser.id} />
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">
        {overdueApprovals.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <p className="text-red-700 font-semibold text-sm">{overdueApprovals.length} approval{overdueApprovals.length > 1 ? 's' : ''} overdue &gt;{OVERDUE_DAYS} days!</p>
            </div>
            {overdueApprovals.map(a => {
              const days = differenceInDays(TODAY, a.requestedAt);
              return (
                <div key={a.id} className="flex items-center justify-between bg-white border border-red-200 rounded-xl px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-red-700">{a.entityTitle}</p>
                    <p className="text-xs text-red-400">{a.entityId} · {days} days</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => resolveApproval(a.id, 'approved')} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 font-medium">Approve</button>
                    <button onClick={() => resolveApproval(a.id, 'rejected')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 font-medium">Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col gap-4 ${s.overdue ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                {s.alert && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${s.overdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>Action Required</span>}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.overdue ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Actions */}
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Market ID', 'Pin Code', 'Market Name & Address', 'Category', 'Households', 'Ownership', 'Docs', 'Day / Time', 'Outlets', 'Finalized Rent', 'Status', 'Primary Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(f => {
                  const pending = APPROVALS.find(a => a.entityId === f.id && a.status === 'Pending' && a.assignedTo === currentUser.id);
                  const days = pending ? differenceInDays(TODAY, pending.requestedAt) : 0;
                  const rowOverdue = pending && days > OVERDUE_DAYS;
                  return (
                    <tr
                      key={f.id}
                      id={`row-${f.id}`}
                      className={`transition-colors duration-500 ${
                        activeHighlight === f.id
                          ? 'bg-amber-50 ring-2 ring-inset ring-amber-300'
                          : rowOverdue ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${rowOverdue ? 'border-red-300 text-red-600 bg-red-50' : 'border-rose-200 text-rose-600 bg-rose-50'}`}>{f.id}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{format(f.createdAt, 'MMM d, yyyy')}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{f.pinCode}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-sm font-medium text-gray-800">{f.marketName}</p>
                        <p className="text-[11px] text-gray-400 leading-tight mt-0.5 line-clamp-2">{f.marketAddress}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap">{f.category}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 text-right">{f.households || '–'}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{f.ownershipType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${DOC_STYLE[f.docType]}`}>{f.docType}</span>
                      </td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <p className="text-xs text-gray-700">{f.operatingDays}</p>
                        <p className="text-[11px] text-gray-400">{f.operatingTime}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 text-right">{f.numberOfOutlets}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{f.finalizedRent}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                            {f.status === 'Sent to Onboarding' ? 'COMPLETED' : f.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {format(f.updatedAt, 'MMM d, yyyy, h:mm aa')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-[160px]">
                        {f.status === 'Approved' ? (
                          <button
                            onClick={() => setOnboardingTarget(f)}
                            className="w-full text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl transition-colors uppercase tracking-wide leading-snug"
                          >
                            PUSH TO<br />ONBOARDING
                          </button>
                        ) : f.status === 'Sent to Onboarding' ? (
                          <div className="w-full bg-slate-100 rounded-xl py-2.5 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-snug tracking-wide">PUSHED TO<br />ONBOARDING</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">–</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-14 text-gray-300">
                <CheckSquare size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm text-gray-400">No data found.</p>
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

      {/* Onboarding drawer */}
      {onboardingTarget && (
        <OnboardingDrawer
          finalization={onboardingTarget}
          onClose={() => setOnboardingTarget(null)}
          onSubmit={() => setOnboardingTarget(null)}
        />
      )}
    </div>
  );
}
