import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Building2, FileText, Info, ChevronDown, ZoomIn, ZoomOut, SeparatorHorizontal, Footprints, DoorOpen, SquareParking, Ban, Wrench } from 'lucide-react';
import { Onboarding } from '../types';
import { USERS } from '../data/mockData';
import { STALL_CATEGORIES } from './MarketLayoutDesigner';
import { format } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'scouting' | 'timeline';

interface MarketOnboardingDetailsProps {
  onboarding: Onboarding;
  onClose: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function userName(id: string) { return USERS.find(u => u.id === id)?.name ?? id; }

function getCat(id?: string) { return STALL_CATEGORIES.find(x => x.id === id); }

function hexToRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const INFRA_ITEMS = [
  { id: 'road',    label: 'Road',       color: '#616161', bg: '#e0e0e0', Icon: SeparatorHorizontal },
  { id: 'pathway', label: 'Pathway',    color: '#9e9e9e', bg: '#f5f5f5', Icon: Footprints },
  { id: 'entry',   label: 'Entry/Exit', color: '#2e7d32', bg: '#e8f5e9', Icon: DoorOpen },
  { id: 'parking', label: 'Parking',    color: '#1565c0', bg: '#e8eaf6', Icon: SquareParking },
  { id: 'blocked', label: 'Blocked',    color: '#424242', bg: '#eeeeee', Icon: Ban },
  { id: 'misc',    label: 'Misc',       color: '#e64a19', bg: '#fbe9e7', Icon: Wrench },
];

function getInfra(id: string) { return INFRA_ITEMS.find(x => x.id === id); }

const STATUS_STYLE: Record<string, string> = {
  'Pending':     'bg-amber-100 text-amber-700 border border-amber-300',
  'In Progress': 'bg-blue-100 text-blue-700 border border-blue-300',
  'Approved':    'bg-emerald-100 text-emerald-700 border border-emerald-300',
  'Rejected':    'bg-red-100 text-red-700 border border-red-300',
};

const DOC_STYLE: Record<string, string> = {
  'Agreement':         'bg-amber-50 text-amber-700 border border-amber-200',
  'Permission Letter': 'bg-rose-50 text-rose-700 border border-rose-200',
  'No Objection':      'bg-gray-50 text-gray-600 border border-gray-200',
  'None':              'bg-gray-50 text-gray-400 border border-gray-100',
};

// ─── Stall SVG (read-only mini version) ─────────────────────────────────────────

function StallSvg({ color, facing, no, size }: { color: string; facing: 'N'|'E'|'S'|'W'; no: number; size: number }) {
  const p = 1, w = size - p * 2, h = size - p * 2;
  const cx = p + w / 2, cy = p + h / 2;
  const cd = Math.max(3, Math.round(Math.min(w, h) * 0.25));
  const counterRect = (() => {
    switch (facing) {
      case 'N': return { x: p, y: p, width: w, height: cd };
      case 'S': return { x: p, y: p + h - cd, width: w, height: cd };
      case 'E': return { x: p + w - cd, y: p, width: cd, height: h };
      case 'W': return { x: p, y: p, width: cd, height: h };
    }
  })();

  const aw = Math.max(2, Math.round(w * 0.12));
  const al = Math.max(3, Math.round(h * 0.20));
  const arrowPoints = (() => {
    switch (facing) {
      case 'N': return `${cx},${p+1} ${cx-aw},${p+1+al} ${cx+aw},${p+1+al}`;
      case 'S': return `${cx},${p+h-1} ${cx-aw},${p+h-1-al} ${cx+aw},${p+h-1-al}`;
      case 'E': return `${p+w-1},${cy} ${p+w-1-al},${cy-aw} ${p+w-1-al},${cy+aw}`;
      case 'W': return `${p+1},${cy} ${p+1+al},${cy-aw} ${p+1+al},${cy+aw}`;
    }
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect x={p} y={p} width={w} height={h} rx={2} fill={color} opacity={0.88} />
      <rect x={counterRect.x} y={counterRect.y} width={counterRect.width} height={counterRect.height}
        rx={2} fill={hexToRgba('#000', 0.25)} />
      <polygon points={arrowPoints} fill="white" opacity={0.95} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.max(7, Math.round(size * 0.3))} fill="white" fontWeight="800"
        fontFamily="system-ui,-apple-system,sans-serif"
        stroke="rgba(0,0,0,0.35)" strokeWidth={Math.max(0.5, Math.round(size * 0.04))} strokeLinejoin="round" paintOrder="stroke">
        {no}
      </text>
    </svg>
  );
}

// ─── Infrastructure Cell (read-only) ────────────────────────────────────────────

function InfraSvg({ type, size }: { type: string; size: number }) {
  const infra = getInfra(type);
  const color = infra?.color ?? '#9e9e9e', bg = infra?.bg ?? '#f5f5f5';
  const IconComp = infra?.Icon;
  const iconSize = Math.max(8, Math.round(size * 0.45));
  return (
    <div style={{ width: size, height: size, backgroundColor: bg, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {IconComp && <IconComp size={iconSize} color={color} strokeWidth={2} />}
    </div>
  );
}

// ─── Read-Only Layout Grid ──────────────────────────────────────────────────────

function LayoutGridPreview({ onboarding }: { onboarding: Onboarding }) {
  const grid = onboarding.layoutGrid ?? {};
  const rows = onboarding.layoutRows ?? 8;
  const cols = onboarding.layoutCols ?? 10;
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  // Compute cell size based on container width
  const [cellSize, setCellSize] = useState(28);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth - 16; // account for padding
      const computed = Math.floor(w / cols);
      setCellSize(Math.max(20, Math.min(computed, 40)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols]);

  const actualSize = Math.round(cellSize * zoom);

  // Compute stall numbers in row-major order
  const stallNumbers = useMemo(() => {
    const nums: Record<string, number> = {};
    let n = 1;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const k = `${r}-${c}`;
        if (grid[k]?.type === 'stall') nums[k] = n++;
      }
    return nums;
  }, [grid, rows, cols]);

  // Stall category counts
  const stallCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(grid).forEach((el: any) => {
      if (el?.type === 'stall' && el.catId) counts[el.catId] = (counts[el.catId] ?? 0) + 1;
    });
    return counts;
  }, [grid]);

  const totalStalls = Object.values(stallCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {/* Grid header with zoom controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Market Layout</span>
          <span className="text-[10px] font-semibold text-gray-400">
            {totalStalls} stalls · {cols}×{rows}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 bg-white transition-all"
            title="Zoom out">
            <ZoomOut size={12} />
          </button>
          <button onClick={() => setZoom(1)}
            className="text-[10px] font-bold text-gray-500 px-2 py-1 rounded-lg border border-gray-200 bg-white min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => setZoom(z => Math.min(2, +(z + 0.15).toFixed(2)))}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 bg-white transition-all"
            title="Zoom in">
            <ZoomIn size={12} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-xl bg-gray-50/60 overflow-auto"
        style={{ maxHeight: 280 }}
      >
        <div style={{ padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: actualSize * cols + 16 }}>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: cols }, (_, c) => {
                const k = `${r}-${c}`;
                const el = grid[k] as any;
                const stallNo = el?.type === 'stall' ? (stallNumbers[k] ?? 0) : 0;
                const cat = el?.type === 'stall' ? getCat(el.catId) : undefined;
                return (
                  <div key={c}
                    style={{ width: actualSize, height: actualSize, flexShrink: 0 }}
                    className="border border-gray-200/60"
                  >
                    {el && (
                      el.type === 'stall' && cat
                        ? <StallSvg color={cat.color} facing={el.facing} no={stallNo} size={actualSize} />
                        : el.type !== 'stall'
                        ? <InfraSvg type={el.type} size={actualSize} />
                        : null
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend: stall categories placed */}
      {totalStalls > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mr-0.5">Placed:</span>
          {STALL_CATEGORIES.filter(c => stallCounts[c.id] > 0).map(cat => (
            <span key={cat.id} className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cat.light, color: cat.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.label} {stallCounts[cat.id]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rent Details Section ───────────────────────────────────────────────────────

function RentDetailsSection({ onboarding }: { onboarding: Onboarding }) {
  const grid = onboarding.layoutGrid ?? {};
  const stallRents = onboarding.stallRents ?? {};
  const rows = onboarding.layoutRows ?? 8;
  const cols = onboarding.layoutCols ?? 10;

  // Extract stalls in row-major order
  const stalls = useMemo(() => {
    const entries: { key: string; r: number; c: number; catId: string; stallNo: number }[] = [];
    let n = 1;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const k = `${r}-${c}`;
        const el = grid[k] as any;
        if (el?.type === 'stall' && el.catId) {
          entries.push({ key: k, r, c, catId: el.catId, stallNo: n });
          n++;
        }
      }
    return entries;
  }, [grid, rows, cols]);

  // Category-wise summary
  const categorySummary = useMemo(() => {
    const map: Record<string, { count: number; totalRent: number; label: string; color: string; light: string }> = {};
    stalls.forEach(s => {
      const cat = getCat(s.catId);
      if (!cat) return;
      if (!map[s.catId]) map[s.catId] = { count: 0, totalRent: 0, label: cat.label, color: cat.color, light: cat.light };
      map[s.catId].count++;
      map[s.catId].totalRent += stallRents[s.key] ?? 0;
    });
    return Object.values(map).sort((a, b) => b.totalRent - a.totalRent);
  }, [stalls, stallRents]);

  const totalRent = useMemo(() => stalls.reduce((sum, s) => sum + (stallRents[s.key] ?? 0), 0), [stalls, stallRents]);
  const avgRent = stalls.length > 0 ? Math.round(totalRent / stalls.length) : 0;
  const [showAllStalls, setShowAllStalls] = useState(false);
  const displayStalls = showAllStalls ? stalls : stalls.slice(0, 8);

  if (stalls.length === 0) {
    // Fallback to simple rent display when no layout data
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rent Details</p>
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-gray-800">Total Rent</p>
                <div className="group relative">
                  <Info size={12} className="text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Total rent for all outlets per week
                  </div>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                ₹{onboarding.rentPerOutletPerWeek.toLocaleString('en-IN')}
                <span className="text-xs font-medium text-gray-400 ml-1">/ WEEK</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-700">
                ₹{onboarding.numberOfOutlets ? Math.round(onboarding.rentPerOutletPerWeek / onboarding.numberOfOutlets).toLocaleString('en-IN') : 0}
              </p>
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Per Outlet / Week</p>
              <p className="text-[9px] text-gray-400 mt-0.5">BASE: ₹{onboarding.numberOfOutlets ? Math.round(onboarding.rentPerOutletPerWeek / onboarding.numberOfOutlets).toLocaleString('en-IN') : 0} / WEEKLY</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rent Details</p>

      {/* Total + Summary Card */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
        {/* Total row */}
        <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-rose-50 to-white">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-800">Total Rent</p>
              <Info size={12} className="text-gray-400" />
            </div>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">
              ₹{totalRent.toLocaleString('en-IN')}
              <span className="text-[10px] font-medium text-gray-400 ml-1">/ WEEK</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">₹{avgRent.toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Avg. Per Stall / Wk</p>
          </div>
        </div>

        {/* Category-wise breakdown */}
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">By Category</p>
          <div className="space-y-1.5">
            {categorySummary.map(cat => (
              <div key={cat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] font-semibold text-gray-700">{cat.label}</span>
                  <span className="text-[10px] text-gray-400">× {cat.count}</span>
                </div>
                <span className="text-[11px] font-bold text-gray-800">
                  ₹{cat.totalRent.toLocaleString('en-IN')}/wk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-stall breakdown */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Stall-wise Rent</p>
          <p className="text-[9px] font-semibold text-gray-400">{stalls.length} stalls</p>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[36px_1fr_80px] items-center px-4 py-2 bg-gray-50/50 border-b border-gray-100">
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">#</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Outlet Type</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-right">Rent (₹/wk)</span>
        </div>

        {/* Stall rows */}
        <div className="divide-y divide-gray-50">
          {displayStalls.map(stall => {
            const cat = getCat(stall.catId);
            const rent = stallRents[stall.key] ?? 0;
            return (
              <div key={stall.key} className="grid grid-cols-[36px_1fr_80px] items-center px-4 py-2">
                <span className="text-[11px] font-bold text-gray-600">{stall.stallNo}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color ?? '#9e9e9e' }} />
                  <span className="text-[11px] font-semibold text-gray-700">{cat?.label ?? 'Unknown'}</span>
                </div>
                <span className="text-[11px] font-bold text-gray-800 text-right">₹{rent.toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>

        {/* Show more/less */}
        {stalls.length > 8 && (
          <button
            onClick={() => setShowAllStalls(v => !v)}
            className="w-full py-2.5 border-t border-gray-100 text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 transition-colors flex items-center justify-center gap-1"
          >
            {showAllStalls ? 'Show Less' : `Show All ${stalls.length} Stalls`}
            <ChevronDown size={12} className={`transition-transform ${showAllStalls ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Drawer ────────────────────────────────────────────────────────────────

export function MarketOnboardingDetails({ onboarding, onClose }: MarketOnboardingDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const o = onboarding;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'scouting', label: 'Scouting' },
    { id: 'timeline', label: 'Timeline' },
  ];

  const statusLabel = o.status === 'Pending' ? 'IN REVIEW' : o.status === 'Approved' ? 'SENT TO ONBOARDING' : o.status.toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed z-50 bg-white shadow-2xl flex flex-col inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[min(520px,95vw)] animate-slideIn">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-base font-bold text-gray-900">Market Details</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">{o.id}</span>
              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${STATUS_STYLE[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {statusLabel}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0">
            <X size={17} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors relative ${
                activeTab === tab.id
                  ? 'text-rose-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-5 space-y-5">

              {/* ── Market Info ── */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Market Info</p>

                {/* Market Name */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Market Name</p>
                  <p className="text-sm font-semibold text-gray-900">{o.marketName}</p>
                </div>

                {/* Type + Booking Method row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Market Type</p>
                    <p className="text-xs font-bold text-gray-800 uppercase">{o.marketType === 'Farmer Market' ? 'DEDICATED COMPLEX' : o.marketType.toUpperCase()}</p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Booking Method</p>
                    <p className="text-xs font-bold text-gray-800 uppercase">{o.bondingMethod.toUpperCase()}</p>
                  </div>
                </div>

                {/* Org + Planned Launch */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Organization</p>
                    <p className="text-xs font-bold text-gray-800">Wingrow</p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Planned Launch</p>
                    <p className="text-xs font-bold text-gray-800">{format(o.createdAt, 'dd MMM yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* ── Schedule ── */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Schedule</p>

                <div className="border border-gray-200 rounded-xl p-3 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={13} className="text-gray-400" />
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Operational Days</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{o.operatingDays}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Time</p>
                    <p className="text-xs font-bold text-gray-800">{o.operatingTime.split('–')[0]?.trim() || '00:00'}</p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Time</p>
                    <p className="text-xs font-bold text-gray-800">{o.operatingTime.split('–')[1]?.trim() || '00:00'}</p>
                  </div>
                </div>
              </div>

              {/* ── Stall Layout (grid) ── */}
              {o.layoutGrid && Object.keys(o.layoutGrid).length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stall Layout</p>
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <LayoutGridPreview onboarding={o} />
                  </div>
                </div>
              )}

              {/* ── Rent Details ── */}
              <RentDetailsSection onboarding={o} />

              {/* ── Agreement Documents ── */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Agreement Documents</p>
                <div className="border border-gray-200 rounded-xl p-3 bg-white">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg inline-block ${DOC_STYLE[o.docType]}`}>
                    {o.docType.toUpperCase()}
                  </span>
                  {o.docType !== 'None' && (
                    <p className="text-[10px] text-rose-500 font-medium mt-1.5">20 days remaining</p>
                  )}
                </div>
              </div>

              {/* ── Offer Remarks ── */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offer Remarks</p>
                <div className="border border-gray-200 rounded-xl p-3 bg-white">
                  <p className="text-sm text-gray-700">Demo</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scouting' && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <MapPin size={36} className="text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-400">Scouting Data</p>
              <p className="text-xs text-gray-300 mt-1">No scouting trips linked to this market yet.</p>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="p-5 space-y-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Activity Timeline</p>
              <div className="relative pl-5 space-y-4">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

                <div className="relative flex gap-3">
                  <div className="absolute left-[-13px] top-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Market Onboarded</p>
                    <p className="text-[10px] text-gray-400">{format(o.updatedAt, 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>

                <div className="relative flex gap-3">
                  <div className="absolute left-[-13px] top-1 w-3 h-3 rounded-full bg-blue-400 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Layout Configured</p>
                    <p className="text-[10px] text-gray-400">{format(o.createdAt, 'MMM d, yyyy · h:mm a')}</p>
                    {o.layoutGrid && (
                      <p className="text-[10px] text-gray-400">
                        {Object.values(o.layoutGrid).filter((el: any) => el?.type === 'stall').length} stalls placed
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative flex gap-3">
                  <div className="absolute left-[-13px] top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Sent to Onboarding by {userName(o.createdBy)}</p>
                    <p className="text-[10px] text-gray-400">{format(o.createdAt, 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>

                <div className="relative flex gap-3">
                  <div className="absolute left-[-13px] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Location Finalized</p>
                    <p className="text-[10px] text-gray-400">Initial creation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
