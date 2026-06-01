import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { differenceInDays, format } from 'date-fns';
import {
  FileText, MapPin, CheckSquare, Store, Clock, ArrowRight,
  CheckCircle, Users, Building2,
  ShoppingBag, Layers, Check, X, Receipt,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PROPOSALS, SCOUT_TRIPS, FINALIZATIONS, ONBOARDINGS, APPROVALS, USERS } from '../data/mockData';
import { FilterBar } from '../components/FilterBar';
import { Approval, AppModule } from '../types';

const TODAY = new Date('2026-05-18');
const OVERDUE_DAYS = 5;

function isOverdue(a: Approval) {
  return a.status === 'Pending' && differenceInDays(TODAY, a.requestedAt) > OVERDUE_DAYS;
}

function userName(id: string) { return USERS.find(u => u.id === id)?.name ?? id; }
function userInitials(id: string) { return USERS.find(u => u.id === id)?.initials ?? '??'; }
function userRole(id: string) { return USERS.find(u => u.id === id)?.role ?? ''; }
function userColor(id: string): string {
  const colors = ['bg-rose-500', 'bg-teal-500', 'bg-violet-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
  return colors[id.charCodeAt(id.length - 1) % colors.length];
}

function Avatar({ id, size = 'sm' }: { id: string; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-9 h-9 text-xs' : 'w-7 h-7 text-[10px]';
  return (
    <div className={`${sz} ${userColor(id)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {userInitials(id)}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({
  icon: Icon, iconBg, iconColor, label, value, onClick,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${iconBg} border border-gray-100/60 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]' : ''
      }`}
    >
      <div className={`w-7 h-7 bg-white/70 rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon size={14} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Pending Approval Row ──────────────────────────────────────────────────────
function ApprovalRow({ ap }: { ap: Approval }) {
  const [resolved, setResolved] = useState<'approved' | 'rejected' | null>(null);
  const days = differenceInDays(TODAY, ap.requestedAt);
  const overdue = days > OVERDUE_DAYS;

  const marketColors: Record<string, string> = {
    'Farmer Market': 'bg-amber-100 text-amber-700',
    'Sakhi Market':  'bg-pink-100 text-pink-700',
  };

  if (resolved) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${resolved === 'approved' ? 'bg-green-100' : 'bg-gray-100'}`}>
          <CheckCircle size={13} className={resolved === 'approved' ? 'text-green-500' : 'text-gray-400'} />
        </div>
        <p className="text-xs text-gray-400 flex-1">
          <span className="font-medium text-gray-600">{ap.entityId}</span>
          {' '}{resolved === 'approved' ? 'approved' : 'rejected'}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-xl border bg-white ${
      overdue ? 'border-orange-400 border-[0.5px]' : 'border-gray-100'
    }`}>
      <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2.5">
        <Avatar id={ap.requestedBy} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {ap.entityId}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${marketColors[ap.marketType]}`}>
              {ap.marketType}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-800 truncate mt-0.5">{ap.entityTitle}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {userName(ap.requestedBy)} · <span className={overdue ? 'text-orange-500 font-medium' : ''}>{days}d ago</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 pr-3 flex-shrink-0">
        <button
          onClick={() => setResolved('approved')}
          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => setResolved('rejected')}
          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

// ── Module Section ────────────────────────────────────────────────────────────
function ModuleSection({
  title, icon: Icon, accentBg, accentIcon,
  kpis, pendingApprovals,
}: {
  title: string;
  icon: React.ElementType;
  accentBg: string;
  accentIcon: string;
  kpis: { icon: React.ElementType; iconBg: string; iconColor: string; label: string; value: number | string }[];
  pendingApprovals: Approval[];
}) {
  const pendingCount = pendingApprovals.length;
  const overdueCount = pendingApprovals.filter(isOverdue).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-gray-100">
        <div className={`w-8 h-8 ${accentBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} className={accentIcon} />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm truncate">{title}</h3>
        {pendingCount > 0 && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-auto ${
            overdueCount > 0 ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-700'
          }`}>
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="p-3 space-y-3">
        <div className={`grid gap-2 ${kpis.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
          {kpis.map((k, i) => (
            <KPICard key={i} {...k} />
          ))}
        </div>

        {pendingApprovals.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 px-1 pt-1">
              <Clock size={10} />
              Awaiting your approval · {pendingCount} item{pendingCount > 1 ? 's' : ''}
              {overdueCount > 0 && <span className="text-orange-500 font-semibold">· {overdueCount} overdue</span>}
            </p>
            {pendingApprovals.map(ap => (
              <ApprovalRow key={ap.id} ap={ap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team Overview ─────────────────────────────────────────────────────────────
// BD flow: Manager assigns proposals to BD Execs → Execs do scout trips →
// trips marked "Push to Finalization" come back to Manager → Manager finalizes →
// MO team onboards.
function TeamActivity({
  subordinateIds,
  selectedUserId,
  onSelectMember,
}: {
  subordinateIds: string[];
  selectedUserId: string;
  onSelectMember: (uid: string) => void;
}) {
  const teamStats = subordinateIds.map(uid => {
    // Proposals assigned TO this exec by the manager
    const assigned      = PROPOSALS.filter(p => p.assignedOfficerId === uid);
    const activeProposals = assigned.filter(p => p.status === 'In Review');
    const closedProposals = assigned.filter(p => p.status === 'Approved');

    // Scout trips conducted by this exec
    const trips         = SCOUT_TRIPS.filter(t => t.initiatorId === uid);
    const tripsInReview = trips.filter(t => t.status === 'Trip In Review');
    const tripsApproved = trips.filter(t => t.status === 'Trip Approved');
    const tripsReady    = trips.filter(t => t.status === 'Push to Finalization');

    // Pending approvals this exec has submitted (waiting on manager)
    const awaitingApproval = APPROVALS.filter(a => a.requestedBy === uid && a.status === 'Pending');

    return {
      uid,
      assignedTotal:  assigned.length,
      active:         activeProposals.length,
      closed:         closedProposals.length,
      tripsTotal:     trips.length,
      tripsInReview:  tripsInReview.length,
      tripsApproved:  tripsApproved.length,
      tripsReady:     tripsReady.length,
      awaitingApproval: awaitingApproval.length,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <Users size={14} className="text-violet-500" />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">Team Overview</h3>
        <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {subordinateIds.length} members
        </span>
      </div>

      {/* Pipeline stage header */}
      <div className="grid grid-cols-4 border-b border-gray-50 bg-gray-50/60">
        {[
          { label: 'Proposals',  sub: 'Assigned' },
          { label: 'Trips',      sub: 'Undertaken' },
          { label: 'Location',   sub: 'Finalised' },
          { label: 'Market',     sub: 'Onboarded' },
        ].map((col, i) => (
          <div key={i} className={`px-3 py-2 text-center ${i < 3 ? 'border-r border-gray-100' : ''}`}>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{col.label}</p>
            <p className="text-[9px] text-gray-400">{col.sub}</p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-gray-50">
        {teamStats.map(ts => {
          const isSelected = selectedUserId === ts.uid;
          return (
            <button
              key={ts.uid}
              onClick={() => onSelectMember(isSelected ? 'All' : ts.uid)}
              className={`w-full text-left transition-all ${
                isSelected ? 'bg-violet-50 border-l-[3px] border-l-violet-400' : 'hover:bg-gray-50/80'
              }`}
            >
              {/* Member identity row */}
              <div className="flex items-center gap-2.5 px-4 pt-3 pb-1.5">
                <div className="relative flex-shrink-0">
                  <Avatar id={ts.uid} size="md" />
                  {isSelected && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 rounded-full flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-violet-700' : 'text-gray-800'}`}>
                    {userName(ts.uid)}
                  </p>
                  <p className="text-[10px] text-gray-400">{userRole(ts.uid)}</p>
                </div>

              </div>

              {/* Pipeline metrics grid */}
              <div className="grid grid-cols-4 pb-3">
                {/* Proposals column */}
                <div className="px-4 text-center border-r border-gray-100">
                  <p className={`text-lg font-bold ${ts.active > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                    {ts.active}
                  </p>
                  <p className="text-[9px] text-gray-400">total</p>
                </div>

                {/* Trips column */}
                <div className="px-4 text-center border-r border-gray-100">
                  <p className={`text-lg font-bold ${ts.tripsTotal > 0 ? 'text-teal-600' : 'text-gray-300'}`}>
                    {ts.tripsTotal}
                  </p>
                  <p className="text-[9px] text-gray-400">total</p>
                </div>

                {/* Location finalized */}
                <div className="px-4 text-center border-r border-gray-100">
                  <p className={`text-lg font-bold ${ts.tripsReady > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {ts.tripsReady}
                  </p>
                  <p className="text-[9px] text-gray-400">total</p>
                  {ts.tripsReady > 0 && (
                    <p className="text-[9px] text-emerald-400 mt-0.5">needs action</p>
                  )}
                </div>

                {/* Awaiting approval */}
                <div className="px-4 text-center">
                  <p className={`text-lg font-bold ${ts.awaitingApproval > 0 ? 'text-amber-500' : 'text-gray-300'}`}>
                    {ts.awaitingApproval}
                  </p>
                  <p className="text-[9px] text-gray-400">total</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { currentUser, filters, setFilters } = useAppContext();
  const navigate = useNavigate();

  const has = (m: AppModule) => currentUser.permissions.includes(m);

  const selectedUser = filters.userId !== 'All'
    ? USERS.find(u => u.id === filters.userId) ?? null
    : null;

  // Filter pipeline data by date, market type, and selected member
  const filterItems = <T extends { createdAt: Date; marketType: string }>(
    items: T[], ownerKey: 'initiatorId' | 'createdBy'
  ) => items.filter(item => {
    if (filters.dateFrom && item.createdAt < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && item.createdAt > new Date(filters.dateTo + 'T23:59:59')) return false;
    if (filters.marketType !== 'All' && item.marketType !== filters.marketType) return false;
    const owner = (item as any)[ownerKey];
    if (filters.userId !== 'All' && owner !== filters.userId) return false;
    if (currentUser.role !== 'Admin' && currentUser.subordinates.length === 0 && owner !== currentUser.id) return false;
    return true;
  });

  const fp = useMemo(() => filterItems(PROPOSALS, 'initiatorId'), [filters, currentUser]);
  const ft = useMemo(() => filterItems(SCOUT_TRIPS, 'initiatorId'), [filters, currentUser]);
  const ff = useMemo(() => filterItems(FINALIZATIONS, 'createdBy'), [filters, currentUser]);
  const fo = useMemo(() => filterItems(ONBOARDINGS, 'createdBy'), [filters, currentUser]);

  // Approvals for the manager to action — also filtered by selected member
  const myApprovals = (module: AppModule) =>
    APPROVALS.filter(a =>
      a.module === module &&
      a.status === 'Pending' &&
      a.assignedTo === currentUser.id &&
      (filters.userId === 'All' || a.requestedBy === filters.userId)
    );

  const pendingProposals  = myApprovals('Proposal Initiation');
  const pendingTrips      = myApprovals('Location Hunting');
  const pendingFinals     = myApprovals('Location Finalization');
  const pendingOnboarding = myApprovals('Market Onboarding');

  // KPIs derived from filtered pipeline data — always member- and date-aware
  const proposalKPIs = {
    total:    fp.length,
    inReview: fp.filter(p => p.status === 'In Review').length,
    approved: fp.filter(p => p.status === 'Approved').length,
    rejected: fp.filter(p => p.status === 'Rejected').length,
    stalls:   fp.filter(p => p.status === 'Approved').reduce((s, p) => s + p.expectedStalls, 0),
  };
  const tripKPIs = {
    total:    ft.length,
    inReview: ft.filter(t => t.status === 'Trip In Review').length,
    approved: ft.filter(t => t.status === 'Trip Approved').length,
    push:     ft.filter(t => t.status === 'Push to Finalization').length,
  };
  const finalKPIs = {
    total:        ff.length,
    inReview:     ff.filter(f => f.status === 'In Review').length,
    approved:     ff.filter(f => f.status === 'Approved').length,
    toOnboarding: ff.filter(f => f.status === 'Sent to Onboarding').length,
  };
  const onboardKPIs = {
    total:    fo.length,
    inProgress: fo.filter(o => o.status === 'In Progress').length,
    active:   fo.filter(o => o.status === 'Approved').length,
  };

  const dateLabel = format(TODAY, 'EEE, d MMM yyyy');

  const handleSelectMember = (uid: string) => {
    setFilters({ ...filters, userId: uid });
  };

  return (
    <div className="min-h-full bg-rose-50/40">
      {/* Desktop top bar */}
      <div className="hidden md:flex px-6 py-3.5 bg-white border-b border-gray-100 items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-800">Dashboard</h1>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 max-w-5xl mx-auto w-full">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0d2a4a] rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 75% 50%, rgba(244,63,94,0.15) 0%, transparent 55%)' }} />
          <div className="relative px-4 sm:px-6 py-5">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/25 font-semibold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Live
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">
              Good afternoon, {currentUser.name.split(' ')[0]} 👋
            </h2>
            <p className="text-gray-400 text-xs mb-4">
              {currentUser.role} · {currentUser.organization}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Navigation</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: MapPin, label: "Location\nHunting", color: "#14b8a6", bg: "bg-teal-50", path: null },
              { icon: CheckSquare, label: "Location\nFinalisation", color: "#f59e0b", bg: "bg-amber-50", path: '/location-finalization' },
              // { icon: Receipt, label: "Farmer\nBilling", color: "#e11d48", bg: "bg-rose-50", path: '/farmer-billing' },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => item.path && navigate(item.path)}
                disabled={!item.path}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${item.path ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer hover:shadow-sm' : 'bg-gray-50/50 cursor-not-allowed opacity-60'}`} 
              >
                <div
                  className={`flex items-center justify-center rounded-xl w-10 h-10 ${item.bg}`}
                >
                  <item.icon size={20} color={item.color} />
                </div>
                <span className="text-xs text-center text-gray-600 font-medium leading-tight whitespace-pre-line">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Team Overview — clickable rows set the member filter */}
        {currentUser.subordinates.length > 0 && (
          <TeamActivity
            subordinateIds={currentUser.subordinates}
            selectedUserId={filters.userId}
            onSelectMember={handleSelectMember}
          />
        )}

        {/* Filters */}
        <FilterBar />

        {/* ── Member focus context banner ── */}
        {selectedUser && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 ${userColor(selectedUser.id)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {userInitials(selectedUser.id)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-violet-800">{selectedUser.name}</p>
                <span className="text-[10px] text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">{selectedUser.role}</span>
              </div>
            </div>
            <button
              onClick={() => setFilters({ ...filters, userId: 'All' })}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-violet-200 text-violet-400 hover:text-violet-700 hover:bg-violet-100 transition-colors"
              title="Clear member filter"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* ── Module sections — KPIs from filtered data ── */}
        {has('Proposal Initiation') && (
          <ModuleSection
            title="Proposal Initiation"
            icon={FileText}
            accentBg="bg-rose-50"
            accentIcon="text-rose-500"
            pendingApprovals={pendingProposals}
            kpis={[
              { icon: Layers,      iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   label: 'Total',        value: proposalKPIs.total },
              { icon: Clock,       iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  label: 'In Review',    value: proposalKPIs.inReview },
              { icon: CheckCircle, iconBg: 'bg-green-50',  iconColor: 'text-green-500',  label: 'Approved',     value: proposalKPIs.approved },
            ]}
          />
        )}

        {has('Location Hunting') && (
          <ModuleSection
            title="Location Hunting"
            icon={MapPin}
            accentBg="bg-teal-50"
            accentIcon="text-teal-500"
            pendingApprovals={pendingTrips}
            kpis={[
              { icon: MapPin,      iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   label: 'Total Trips',   value: tripKPIs.total },
              { icon: Clock,       iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  label: 'In Review',     value: tripKPIs.inReview },
              { icon: CheckCircle, iconBg: 'bg-green-50',  iconColor: 'text-green-500',  label: 'Approved',      value: tripKPIs.approved },
              { icon: ArrowRight,  iconBg: 'bg-violet-50', iconColor: 'text-violet-500', label: 'Push to Final', value: tripKPIs.push },
            ]}
          />
        )}

        {has('Location Finalization') && (
          <ModuleSection
            title="Location Finalization"
            icon={CheckSquare}
            accentBg="bg-emerald-50"
            accentIcon="text-emerald-500"
            pendingApprovals={pendingFinals}
            kpis={[
              { icon: Building2,   iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   label: 'Total Markets',  value: finalKPIs.total },
              { icon: Clock,       iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  label: 'In Review',      value: finalKPIs.inReview },
              { icon: CheckCircle, iconBg: 'bg-green-50',  iconColor: 'text-green-500',  label: 'Approved',       value: finalKPIs.approved },
              { icon: ArrowRight,  iconBg: 'bg-teal-50',   iconColor: 'text-teal-500',   label: 'To Onboarding',  value: finalKPIs.toOnboarding },
            ]}
          />
        )}

        {has('Market Onboarding') && (
          <ModuleSection
            title="Market Onboarding"
            icon={Store}
            accentBg="bg-purple-50"
            accentIcon="text-purple-500"
            pendingApprovals={pendingOnboarding}
            kpis={[
              { icon: Store,       iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   label: 'Total Markets',  value: onboardKPIs.total },
              { icon: Clock,       iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  label: 'In Progress',    value: onboardKPIs.inProgress },
              { icon: CheckCircle, iconBg: 'bg-green-50',  iconColor: 'text-green-500',  label: 'Active Markets', value: onboardKPIs.active },
            ]}
          />
        )}



        <div className="text-center text-gray-300 text-[10px] py-2 border-t border-gray-100">
          © 2026 Vealogo Market Operations
        </div>
      </div>
    </div>
  );
}
