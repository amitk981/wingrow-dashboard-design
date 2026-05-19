import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { differenceInDays, format } from 'date-fns';
import {
  Plus, AlertTriangle, Clock, FileText, CheckCircle, XCircle,
  Layers, Search, SlidersHorizontal, Phone, X,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PROPOSALS, APPROVALS, USERS } from '../data/mockData';
import { Proposal, MarketType, ProposalStatus, Approval } from '../types';

const TODAY = new Date('2026-05-18');
const OVERDUE_DAYS = 5;

const STATUS_STYLE: Record<ProposalStatus, string> = {
  Draft:        'bg-gray-100 text-gray-600 border border-gray-200',
  'In Review':  'bg-blue-50 text-blue-600 border border-blue-200',
  Approved:     'bg-green-50 text-green-600 border border-green-200',
  Rejected:     'bg-red-50 text-red-600 border border-red-200',
};

const MARKET_STYLE: Record<MarketType, string> = {
  'Farmer Market': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Sakhi Market':  'bg-pink-50 text-pink-700 border border-pink-200',
};

const PRIORITY_STYLE: Record<string, string> = {
  Normal: 'bg-orange-100 text-orange-600',
  High:   'bg-red-100 text-red-600',
  Urgent: 'bg-red-200 text-red-700',
};

function userName(id: string) { return USERS.find(u => u.id === id)?.name ?? id; }
function userInitials(id: string) { return USERS.find(u => u.id === id)?.initials ?? '?'; }
function userColor(id: string) {
  const colors = ['bg-rose-500','bg-teal-500','bg-violet-500','bg-amber-500','bg-blue-500','bg-emerald-500','bg-orange-500'];
  return colors[id.charCodeAt(id.length - 1) % colors.length];
}

function Avatar({ id }: { id: string }) {
  return (
    <div className={`w-8 h-8 ${userColor(id)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {userInitials(id)}
    </div>
  );
}

export function ProposalInitiation() {
  const { currentUser, filters } = useAppContext();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(highlightId);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!highlightId) return;
    setActiveHighlight(highlightId);
    const scrollTimer = setTimeout(() => {
      document.getElementById(`row-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    const clearTimer = setTimeout(() => setActiveHighlight(null), 3500);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
  }, [highlightId]);

  const canApprove = currentUser.subordinates.length > 0 || currentUser.role === 'Admin';

  const filtered = useMemo(() => {
    return PROPOSALS.filter(p => {
      if (filters.dateFrom && p.createdAt < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && p.createdAt > new Date(filters.dateTo + 'T23:59:59')) return false;
      if (filters.marketType !== 'All' && p.marketType !== filters.marketType) return false;
      if (filters.userId !== 'All' && p.initiatorId !== filters.userId) return false;
      if (currentUser.role !== 'Admin' && currentUser.subordinates.length === 0 && p.initiatorId !== currentUser.id) return false;
      if (search && !p.marketAreaName.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filters, currentUser, search]);

  const pendingApprovals = APPROVALS.filter(
    a => a.module === 'Proposal Initiation' && a.status === 'Pending' && a.assignedTo === currentUser.id
  );
  const overdueApprovals = pendingApprovals.filter(a => differenceInDays(TODAY, a.requestedAt) > OVERDUE_DAYS);

  const stats = [
    { label: 'Total Proposals',      value: filtered.length,                                    icon: FileText,      bg: 'bg-blue-50',   color: 'text-blue-500',  alert: false },
    { label: 'Pending Review',        value: pendingApprovals.length,                             icon: Clock,         bg: 'bg-amber-50',  color: 'text-amber-500', alert: pendingApprovals.length > 0, overdue: overdueApprovals.length > 0 },
    { label: 'Approved Proposals',    value: filtered.filter(p => p.status === 'Approved').length, icon: CheckCircle,  bg: 'bg-green-50',  color: 'text-green-500', alert: false },
    { label: 'Expected No of Stalls', value: filtered.filter(p => p.status === 'Approved').reduce((s, p) => s + p.expectedStalls, 0), icon: Layers, bg: 'bg-violet-50', color: 'text-violet-500', alert: false },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="hidden md:flex px-6 py-4 bg-white border-b border-gray-100 items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Proposal Initiation</h1>
        <div className="flex items-center gap-2">
          <Avatar id={currentUser.id} />
        </div>
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">
        {/* Overdue banner */}
        {overdueApprovals.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <p className="text-red-700 font-semibold text-sm">
                {overdueApprovals.length} approval{overdueApprovals.length > 1 ? 's' : ''} pending for more than {OVERDUE_DAYS} days — action required!
              </p>
            </div>
            {overdueApprovals.map(a => {
              const days = differenceInDays(TODAY, a.requestedAt);
              return (
                <div key={a.id} className="flex items-center justify-between bg-white border border-red-200 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar id={a.requestedBy} />
                    <div>
                      <p className="text-sm font-semibold text-red-700">{a.entityTitle}</p>
                      <p className="text-xs text-red-400">
                        {a.entityId} · By {userName(a.requestedBy)} · {days} days waiting · {a.marketType}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
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

        {/* Search + Actions bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search areas or ID"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <button
            onClick={() => { setEditing(null); setShowDialog(true); }}
            className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-rose-600 transition-colors shadow-sm font-medium"
          >
            <Plus size={14} /> New Proposal
          </button>
        </div>

        {/* Inline filter row */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Market Type</span>
              <select
                value={filters.marketType}
                onChange={e => {}}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
              >
                <option value="All">All</option>
                <option value="Farmer Market">Farmer Market</option>
                <option value="Sakhi Market">Sakhi Market</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Status</span>
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
                <option>All</option>
                <option>In Review</option>
                <option>Approved</option>
                <option>Draft</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">From</span>
              <input type="date" className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
              <span className="text-xs text-gray-500">To</span>
              <input type="date" className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Date & ID</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Initiator</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Market Area Name</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Reference</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Reference Contact No</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Assigned Officer</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Market Type</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Docs</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  {canApprove && <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const pending = APPROVALS.find(a => a.entityId === p.id && a.status === 'Pending' && a.assignedTo === currentUser.id);
                  const days = pending ? differenceInDays(TODAY, pending.requestedAt) : 0;
                  const rowOverdue = pending && days > OVERDUE_DAYS;

                  return (
                    <tr
                      key={p.id}
                      id={`row-${p.id}`}
                      className={`transition-colors duration-500 ${
                        activeHighlight === p.id
                          ? 'bg-amber-50 ring-2 ring-inset ring-amber-300'
                          : rowOverdue ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Date & ID */}
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ${rowOverdue ? 'border-red-400 text-red-600 bg-red-50' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                          {p.id}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1 whitespace-nowrap">
                          {format(p.createdAt, 'MMM dd, yyyy, hh:mm aa')}
                        </p>
                      </td>
                      {/* Initiator */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar id={p.initiatorId} />
                          <span className="text-xs text-gray-700 whitespace-nowrap">{userName(p.initiatorId)}</span>
                        </div>
                      </td>
                      {/* Market Area */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{p.marketAreaName}</p>
                        <p className="text-[11px] text-gray-400">Pin: {p.pinCode}</p>
                      </td>
                      {/* Reference */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-800">{p.referenceName}</p>
                        <p className="text-[11px] text-gray-400">{p.referenceOrg}</p>
                      </td>
                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} className="text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-700 whitespace-nowrap">{p.referencePhone}</span>
                        </div>
                      </td>
                      {/* Assigned Officer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar id={p.assignedOfficerId} />
                          <span className="text-xs text-gray-700 whitespace-nowrap">{userName(p.assignedOfficerId)}</span>
                        </div>
                      </td>
                      {/* Market Type */}
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${MARKET_STYLE[p.marketType]}`}>
                          {p.marketType}
                        </span>
                      </td>
                      {/* Priority */}
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase ${PRIORITY_STYLE[p.priority]}`}>
                          {p.priority}
                        </span>
                      </td>
                      {/* Docs */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <FileText size={13} className="text-gray-400" />
                          <span className="text-xs text-gray-600">{p.docsCount}</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <div>
                          <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ${STATUS_STYLE[p.status]}`}>
                            {p.status === 'In Review' ? 'IN REVW' : p.status.toUpperCase()}
                          </span>
                          {pending && (
                            <p className={`text-[10px] mt-1 whitespace-nowrap ${days > OVERDUE_DAYS ? 'text-red-500' : 'text-gray-400'}`}>
                              {format(pending.requestedAt, 'MMM dd, yyyy')}
                              {days > OVERDUE_DAYS && ' ⚠️'}
                            </p>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      {canApprove && (
                        <td className="px-4 py-3">
                          {pending ? (
                            <div className="flex gap-1.5">
                              <button className="text-[11px] bg-green-500 text-white px-2.5 py-1 rounded-lg hover:bg-green-600 font-semibold">APPROVE</button>
                              <button className="text-[11px] bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 font-semibold">REJECT</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditing(p); setShowDialog(true); }}
                              className="text-[11px] text-gray-400 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-300">
                <FileText size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm text-gray-400">No proposals found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDialog && <ProposalDialog proposal={editing} onClose={() => setShowDialog(false)} />}
    </div>
  );
}

// ── Dialog ────────────────────────────────────────────────────────────────────

function ProposalDialog({ proposal, onClose }: { proposal: Proposal | null; onClose: () => void }) {
  const [form, setForm] = useState({
    marketAreaName: proposal?.marketAreaName ?? '',
    marketType:     proposal?.marketType     ?? 'Farmer Market' as MarketType,
    pinCode:        proposal?.pinCode        ?? '',
    district:       proposal?.district       ?? '',
    referenceName:  proposal?.referenceName  ?? '',
    referenceOrg:   proposal?.referenceOrg   ?? '',
    referencePhone: proposal?.referencePhone ?? '',
    expectedStalls: proposal?.expectedStalls ?? 0,
    description:    proposal?.description    ?? '',
    status:         proposal?.status         ?? 'Draft' as ProposalStatus,
  });
  const isEdit = Boolean(proposal);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-800">{isEdit ? 'Edit Proposal' : 'New Proposal'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Update proposal details' : 'Submit a new market proposal'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Market Area Name *</label>
            <input value={form.marketAreaName} onChange={e => setForm({ ...form, marketAreaName: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="e.g. Ambegaon budharuk" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Market Type *</label>
            <select value={form.marketType} onChange={e => setForm({ ...form, marketType: e.target.value as MarketType })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white">
              <option value="Farmer Market">Farmer Market</option>
              <option value="Sakhi Market">Sakhi Market</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Select the type of market for this proposal</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Pin Code</label>
              <input value={form.pinCode} onChange={e => setForm({ ...form, pinCode: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="411028" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">District</label>
              <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="Pune" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Reference Name</label>
              <input value={form.referenceName} onChange={e => setForm({ ...form, referenceName: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="Corporator / Manager" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Organisation</label>
              <input value={form.referenceOrg} onChange={e => setForm({ ...form, referenceOrg: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="Corporator" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact No</label>
              <input value={form.referencePhone} onChange={e => setForm({ ...form, referencePhone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Expected Stalls</label>
              <input type="number" min={0} value={form.expectedStalls} onChange={e => setForm({ ...form, expectedStalls: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none" placeholder="Describe the proposal..." />
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProposalStatus })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white">
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium">{isEdit ? 'Update' : 'Submit Proposal'}</button>
        </div>
      </div>
    </div>
  );
}
