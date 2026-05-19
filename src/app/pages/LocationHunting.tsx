import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { differenceInDays, format } from 'date-fns';
import { Plus, AlertTriangle, Clock, MapPin, ChevronDown, ChevronRight, Search, SlidersHorizontal, X, Phone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SCOUT_TRIPS, PROPOSALS, APPROVALS, USERS } from '../data/mockData';
import { ScoutTrip, MarketType, TripStatus, Approval } from '../types';

const TODAY = new Date('2026-05-18');
const OVERDUE_DAYS = 5;

const STATUS_STYLE: Record<TripStatus, string> = {
  'Trip In Review':        'bg-blue-50 text-blue-600 border border-blue-200',
  'Trip Approved':         'bg-green-50 text-green-600 border border-green-200',
  'Push to Finalization':  'bg-violet-50 text-violet-600 border border-violet-200',
};

const MARKET_STYLE: Record<MarketType, string> = {
  'Farmer Market': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Sakhi Market':  'bg-pink-50 text-pink-700 border border-pink-200',
};

function userName(id: string) { return USERS.find(u => u.id === id)?.name ?? id; }
function userInitials(id: string) { return USERS.find(u => u.id === id)?.initials ?? '?'; }
function userColor(id: string) {
  const colors = ['bg-rose-500','bg-teal-500','bg-violet-500','bg-amber-500','bg-blue-500','bg-emerald-500','bg-orange-500'];
  return colors[id.charCodeAt(id.length - 1) % colors.length];
}
function Avatar({ id }: { id: string }) {
  return (
    <div className={`w-8 h-8 ${userColor(id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
      {userInitials(id)}
    </div>
  );
}

export function LocationHunting() {
  const { currentUser, filters } = useAppContext();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(highlightId);
  const [search, setSearch] = useState('');
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(
    new Set(highlightId ? ['WIN-2026-055', highlightId] : ['WIN-2026-055'])
  );

  useEffect(() => {
    if (!highlightId) return;
    setActiveHighlight(highlightId);
    setExpandedProposals(prev => { const n = new Set(prev); n.add(highlightId); return n; });
    const scrollTimer = setTimeout(() => {
      document.getElementById(`row-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    const clearTimer = setTimeout(() => setActiveHighlight(null), 3500);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
  }, [highlightId]);

  const canApprove = currentUser.subordinates.length > 0 || currentUser.role === 'Admin';

  // Filter proposals that have trips
  const proposals = useMemo(() => {
    return PROPOSALS.filter(p => {
      const hasTrips = SCOUT_TRIPS.some(t => t.proposalId === p.id);
      if (!hasTrips) return false;
      if (currentUser.role !== 'Admin' && currentUser.subordinates.length === 0 && p.initiatorId !== currentUser.id) return false;
      if (filters.userId !== 'All' && p.initiatorId !== filters.userId) return false;
      if (filters.marketType !== 'All' && p.marketType !== filters.marketType) return false;
      if (search && !p.marketAreaName.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filters, currentUser, search]);

  const tripsForProposal = (proposalId: string) =>
    SCOUT_TRIPS.filter(t => {
      if (t.proposalId !== proposalId) return false;
      if (filters.dateFrom && t.createdAt < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && t.createdAt > new Date(filters.dateTo + 'T23:59:59')) return false;
      return true;
    });

  const allTrips = SCOUT_TRIPS.filter(t => {
    if (currentUser.role !== 'Admin' && currentUser.subordinates.length === 0 && t.initiatorId !== currentUser.id) return false;
    return true;
  });

  const pendingApprovals = APPROVALS.filter(a => a.module === 'Location Hunting' && a.status === 'Pending' && a.assignedTo === currentUser.id);
  const overdueApprovals = pendingApprovals.filter(a => differenceInDays(TODAY, a.requestedAt) > OVERDUE_DAYS);

  const stats = [
    { label: 'Total Trips',          value: allTrips.length,                                          bg: 'bg-blue-50',   icon: MapPin,  color: 'text-blue-500',  alert: false },
    { label: 'Pending Review',        value: pendingApprovals.length,                                   bg: 'bg-amber-50',  icon: Clock,   color: 'text-amber-500', alert: pendingApprovals.length > 0, overdue: overdueApprovals.length > 0 },
    { label: 'Trip Approved',         value: allTrips.filter(t => t.status === 'Trip Approved').length,  bg: 'bg-green-50',  icon: MapPin,  color: 'text-green-500', alert: false },
    { label: 'Push to Finalization',  value: allTrips.filter(t => t.status === 'Push to Finalization').length, bg: 'bg-violet-50', icon: ChevronRight, color: 'text-violet-500', alert: false },
  ];

  const toggleProposal = (id: string) => {
    const next = new Set(expandedProposals);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedProposals(next);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="hidden md:flex px-6 py-4 bg-white border-b border-gray-100 items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Location Hunting</h1>
        <Avatar id={currentUser.id} />
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">
        {overdueApprovals.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <p className="text-red-700 font-semibold text-sm">
                {overdueApprovals.length} trip approval{overdueApprovals.length > 1 ? 's' : ''} pending &gt;{OVERDUE_DAYS} days!
              </p>
            </div>
            {overdueApprovals.map(a => {
              const days = differenceInDays(TODAY, a.requestedAt);
              return (
                <div key={a.id} className="flex items-center justify-between bg-white border border-red-200 rounded-xl px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-red-700">{a.entityTitle}</p>
                    <p className="text-xs text-red-400">{a.entityId} · {days} days waiting · {a.marketType}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 font-medium">Approve</button>
                    <button className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 font-medium">Reject</button>
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
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon size={18} className={s.color} />
                </div>
                {s.alert && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${s.overdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    Action Required
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.overdue ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search proposals or ID" className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 shadow-sm" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
            <SlidersHorizontal size={14} /> Filters
          </button>
          <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-teal-700 transition-colors shadow-sm font-medium">
            <Plus size={14} /> New Trip
          </button>
        </div>

        {/* Expandable rows by proposal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {proposals.map(proposal => {
              const trips = tripsForProposal(proposal.id);
              const isOpen = expandedProposals.has(proposal.id);
              const proposalPending = APPROVALS.filter(a => trips.some(t => t.id === a.entityId) && a.status === 'Pending' && a.assignedTo === currentUser.id);

              return (
                <div key={proposal.id} className="border-b border-gray-100 last:border-0">
                  {/* Proposal row (header) */}
                  <div
                    id={`row-${proposal.id}`}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-500 ${
                      activeHighlight === proposal.id
                        ? 'bg-amber-50 ring-2 ring-inset ring-amber-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleProposal(proposal.id)}
                  >
                    {isOpen ? <ChevronDown size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={15} className="text-gray-400 flex-shrink-0" />}
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 bg-blue-50">{proposal.id}</span>
                    <Avatar id={proposal.initiatorId} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{proposal.marketAreaName}</p>
                      <p className="text-[11px] text-gray-400">Pin: {proposal.pinCode}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div>
                        <p className="text-xs text-gray-600">{proposal.referenceName}</p>
                        <p className="text-[11px] text-gray-400">{proposal.referenceOrg}</p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${MARKET_STYLE[proposal.marketType]}`}>{proposal.marketType}</span>
                      <Avatar id={proposal.assignedOfficerId} />
                      <span className="text-xs text-gray-500 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">NORMAL</span>
                      <div className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" /><span className="text-xs text-gray-500">{trips.length}</span></div>
                    </div>
                  </div>

                  {/* Trips sub-table */}
                  {isOpen && trips.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {['Visit Date', 'Location Name', 'Parking', 'Address', 'Category', 'Competitors', 'Ownership', 'Households', 'Outlets', 'Completeness', 'Status', 'Action'].map(h => (
                              <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {trips.map(trip => {
                            const pending = APPROVALS.find(a => a.entityId === trip.id && a.status === 'Pending' && a.assignedTo === currentUser.id);
                            const days = pending ? differenceInDays(TODAY, pending.requestedAt) : 0;
                            const old = pending && days > OVERDUE_DAYS;
                            return (
                              <tr key={trip.id} className={`hover:bg-white transition-colors ${old ? 'bg-red-50/50' : ''}`}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {trip.visitDate ? (
                                    <div>
                                      <p className="font-medium text-gray-800">{format(trip.visitDate, 'dd MMM yyyy')}</p>
                                      <p className="text-[10px] text-gray-400">{format(trip.createdAt, 'hh:mm aa')}</p>
                                    </div>
                                  ) : <span className="text-gray-400">–</span>}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{trip.locationName}</td>
                                <td className="px-4 py-3">
                                  <span className={`font-semibold ${trip.parkingAvailable ? 'text-green-600' : 'text-red-500'}`}>
                                    {trip.parkingAvailable ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 max-w-[180px]">
                                  <p className="truncate text-gray-700">{trip.address}</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{trip.consumerCategory}</td>
                                <td className="px-4 py-3 max-w-[140px]">
                                  <p className="truncate text-gray-700">{trip.competitors}</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{trip.ownership}</td>
                                <td className="px-4 py-3 text-gray-700">{trip.households.toLocaleString()}</td>
                                <td className="px-4 py-3 text-gray-700">{trip.expectedOutlets}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${trip.completeness}%` }} />
                                    </div>
                                    <span className="text-gray-600">{trip.completeness}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-[11px] px-2 py-1 rounded-lg font-semibold ${STATUS_STYLE[trip.status]}`}>
                                    {trip.status === 'Trip In Review' ? 'IN REVIEW' : trip.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {canApprove && pending ? (
                                    <div className="flex gap-1.5">
                                      <button className="text-[11px] bg-green-500 text-white px-2.5 py-1 rounded-lg hover:bg-green-600 font-semibold whitespace-nowrap">APPROVE</button>
                                      <button className="text-[11px] bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 font-semibold whitespace-nowrap">REJECT</button>
                                    </div>
                                  ) : (
                                    <button className="text-[11px] bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 font-semibold flex items-center gap-1 whitespace-nowrap">
                                      <Plus size={10} /> New Trip
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {isOpen && trips.length === 0 && (
                    <div className="px-6 py-4 bg-gray-50 text-sm text-gray-400 border-t border-gray-100">
                      No scouting trips found for this proposal.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {proposals.length === 0 && (
            <div className="text-center py-16 text-gray-300">
              <MapPin size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm text-gray-400">No proposals with scout trips found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
