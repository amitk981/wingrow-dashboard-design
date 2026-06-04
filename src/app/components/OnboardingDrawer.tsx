import React, { useState, useRef } from 'react';
import { X, Check, ChevronRight, ArrowRight, ArrowLeft, Plus, Trash2, Info, Bold, Italic, Underline, List, ListOrdered, Link, RemoveFormatting, Maximize2, Minimize2 } from 'lucide-react';
import { MarketLayoutDesigner, STALL_CATEGORIES } from './MarketLayoutDesigner';
import { Finalization } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AdditionalCost { id: string; label: string; amount: string; }

interface OnboardingData {
  grid: Record<string, any>;
  bookingMethod: 'Fixed Rent' | 'Subscription';
  rentAmount: string;
  rentUnit: 'Per Stall' | 'Per Sqft';
  stallRents: Record<string, string>;
  offersText: string;
  additionalCosts: AdditionalCost[];
}

interface OnboardingDrawerProps {
  finalization: Finalization;
  onClose: () => void;
  onSubmit?: (data: OnboardingData) => void;
}

// ─── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, line1: 'LAYOUT',      line2: '',       short: 'Layout' },
  { id: 2, line1: 'OUTLET',      line2: 'CONFIGURATIONS', short: 'Outlet Config' },
  { id: 3, line1: 'OFFERS &',    line2: 'RATES',  short: 'Offers & Rates' },
  { id: 4, line1: 'ADDITIONAL',  line2: 'COSTS',  short: 'Costs' },
];

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ current, onStep }: { current: number; onStep: (n: number) => void }) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-100">
      {/* Progress track — red fills up to active step, gray for rest */}
      <div className="flex h-[3px]">
        {STEPS.map(s => (
          <div key={s.id} className={`flex-1 transition-colors duration-300 ${s.id <= current ? 'bg-rose-500' : 'bg-gray-100'}`} />
        ))}
      </div>

      {/* Step items */}
      <div className="flex">
        {STEPS.map(s => {
          const done = current > s.id;
          const active = current === s.id;
          return (
            <button
              key={s.id}
              onClick={() => done && onStep(s.id)}
              disabled={!done && !active}
              className={`flex-1 flex flex-col items-center pt-4 pb-3 gap-2 transition-colors ${done ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {/* Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                active || done ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? <Check size={15} strokeWidth={2.5} /> : <span className="text-sm font-bold">{s.id}</span>}
              </div>

              {/* Label */}
              <div className="text-center leading-snug">
                <p className={`text-[9px] font-bold tracking-widest uppercase ${active ? 'text-rose-500' : 'text-gray-400'}`}>{s.line1}</p>
                {s.line2 && <p className={`text-[9px] font-bold tracking-widest uppercase ${active ? 'text-rose-500' : 'text-gray-400'}`}>{s.line2}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Market info card ──────────────────────────────────────────────────────────

function InfoCard({ f }: { f: Finalization }) {
  const fields = [
    { label: 'LOCATION NAME',    value: f.marketName },
    { label: 'PIN CODE',         value: f.pinCode },
    { label: 'CATEGORY',         value: f.category },
    { label: 'ADDRESS',          value: f.marketAddress },
    { label: 'HOUSEHOLDS',       value: f.households ? `${f.households} +` : '—' },
    { label: 'OWNERSHIP TYPE',   value: f.ownershipType },
    { label: 'EXPECTED OUTLETS', value: `${f.numberOfOutlets} Stalls` },
    { label: 'FINALIZED RENT',   value: f.finalizedRent },
    { label: 'DOC TYPE',         value: f.docType },
    { label: 'OPERATING DAYS',   value: f.operatingDays },
    { label: 'TIMING',           value: f.operatingTime },
    { label: 'MARKET TYPE',      value: f.marketType },
  ];

  return (
    <div className="mx-4 mt-4 mb-0 border border-gray-200 rounded-2xl overflow-hidden flex-shrink-0">
      <div className="grid grid-cols-2 sm:grid-cols-3">
        {fields.map((fld, i) => (
          <div key={i} className={`px-3 py-2.5 ${
            i % 3 !== 2 ? 'sm:border-r border-gray-100' : ''
          } ${i % 2 !== 1 ? 'border-r sm:border-r-0 border-gray-100' : ''} ${
            i < fields.length - 3 ? 'border-b border-gray-100' : ''
          } ${i < fields.length - (fields.length % 2 === 0 ? 2 : 1) ? 'sm:border-b' : 'sm:border-b-0'}`}>
            <p className="text-[9px] text-gray-400 font-semibold tracking-wider mb-0.5">{fld.label}</p>
            <p className="text-xs font-semibold text-gray-800 truncate">{fld.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Layout ────────────────────────────────────────────────────────────

function StepLayout({ data, onChange, isFullScreen, onToggleFullScreen }: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MarketLayoutDesigner
        initialGrid={data.grid}
        onChange={grid => onChange({ grid })}
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
      />
    </div>
  );
}

// ─── Step 2: Outlet Config ─────────────────────────────────────────────────────

function StepOutletConfig({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  // Extract stalls from grid and compute stall numbers in row-major order
  const stalls = React.useMemo(() => {
    const entries: { key: string; r: number; c: number; catId: string }[] = [];
    Object.entries(data.grid).forEach(([key, el]) => {
      if (el?.type === 'stall' && el.catId) {
        const [r, c] = key.split('-').map(Number);
        entries.push({ key, r, c, catId: el.catId });
      }
    });
    entries.sort((a, b) => a.r !== b.r ? a.r - b.r : a.c - b.c);
    return entries.map((e, i) => ({ ...e, stallNo: i + 1 }));
  }, [data.grid]);

  const getCat = (id: string) => STALL_CATEGORIES.find(c => c.id === id);

  const updateStallRent = (key: string, value: string) => {
    onChange({ stallRents: { ...data.stallRents, [key]: value } });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Section header */}
      <div className="pl-3 border-l-4 border-rose-500">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Outlet Configurations</p>
      </div>

      {/* Booking Method card */}
      <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          Booking Method <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={data.bookingMethod}
            onChange={e => onChange({ bookingMethod: e.target.value as any })}
            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:border-rose-400 transition-colors pr-10">
            <option value="Fixed Rent">Fixed Rent</option>
            <option value="Subscription">Subscription</option>
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Rent Details section header */}
      <div className="pl-3 border-l-4 border-rose-500">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Rent Details</p>
          <span className="text-[10px] font-semibold text-gray-400">{stalls.length} stalls</span>
        </div>
      </div>

      {/* Per-stall rent list */}
      {stalls.length > 0 ? (
        <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[44px_1fr_120px] items-center px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">#</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Outlet Type</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Rent (₹/wk)</span>
          </div>

          {/* Stall rows */}
          <div className="divide-y divide-gray-100">
            {stalls.map(stall => {
              const cat = getCat(stall.catId);
              return (
                <div key={stall.key} className="grid grid-cols-[44px_1fr_120px] items-center px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                  {/* Stall number */}
                  <span className="text-xs font-bold text-gray-700">{stall.stallNo}</span>

                  {/* Outlet type with color dot */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat?.color ?? '#9e9e9e' }}
                    />
                    <span className="text-xs font-semibold text-gray-700">{cat?.label ?? 'Unknown'}</span>
                  </div>

                  {/* Rent input */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:border-rose-400 transition-colors">
                    <span className="px-2 py-2 text-[10px] text-gray-400 border-r border-gray-200 bg-white font-semibold">₹</span>
                    <input
                      type="number"
                      value={data.stallRents[stall.key] ?? ''}
                      onChange={e => updateStallRent(stall.key, e.target.value)}
                      placeholder="0"
                      className="flex-1 px-2 py-2 text-xs focus:outline-none w-0 bg-gray-50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center">
          <p className="text-xs text-gray-400">No stalls painted yet. Go back to the Layout step to add stalls.</p>
        </div>
      )}

      {/* Configuration Tip */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info size={13} className="text-rose-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Configuration Tip</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Each stall's rent can be set individually. Leave a field blank to use the default market rate.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function RichTextEditor({ onChange }: { onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-white flex-wrap">
        <select
          onChange={e => exec('formatBlock', e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600 mr-2">
          <option value="p">Normal</option>
          <option value="h2">Heading</option>
        </select>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold'); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors">
          <Bold size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic'); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors">
          <Italic size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('underline'); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors">
          <Underline size={13} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors">
          <ListOrdered size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors">
          <List size={13} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('createLink', prompt('URL:') ?? ''); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors">
          <Link size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors">
          <RemoveFormatting size={13} />
        </button>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
        className="min-h-[180px] px-4 py-3 text-sm text-gray-700 focus:outline-none leading-relaxed"
      />
    </div>
  );
}

// ─── Step 3: Offers & Rates ────────────────────────────────────────────────────

function StepOffers({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="p-4 space-y-4">
      {/* Section header */}
      <div className="pl-3 border-l-4 border-rose-500">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Offers & Rates</p>
      </div>

      {/* Editor card */}
      <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          Offer & Rate Details <span className="text-rose-500">*</span>
        </label>
        <RichTextEditor onChange={v => onChange({ offersText: v })} />
        <p className="text-[11px] text-gray-400">
          Include promotional windows, bulk pricing, or special terms.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Additional Costs ──────────────────────────────────────────────────

function StepAdditionalCosts({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  const addCost = () => onChange({ additionalCosts: [...data.additionalCosts, { id: Date.now().toString(), label: '', amount: '' }] });
  const removeCost = (id: string) => onChange({ additionalCosts: data.additionalCosts.filter(c => c.id !== id) });
  const updateCost = (id: string, field: 'label' | 'amount', value: string) =>
    onChange({ additionalCosts: data.additionalCosts.map(c => c.id === id ? { ...c, [field]: value } : c) });

  const baseRent = parseFloat(data.rentAmount) || 0;
  const extra = data.additionalCosts.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const total = baseRent + extra;

  return (
    <div className="p-4 space-y-4">
      {/* Section header */}
      <div className="pl-3 border-l-4 border-rose-500">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">Additional Costs</p>
      </div>

      {/* Costs card */}
      <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3">
        {data.additionalCosts.map((cost, i) => (
          <div key={cost.id} className="flex items-center gap-2">
            <input type="text" value={cost.label} onChange={e => updateCost(cost.id, 'label', e.target.value)}
              placeholder={`Cost ${i + 1} (e.g. Security)`}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 transition-colors bg-gray-50" />
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-28 bg-gray-50 focus-within:border-rose-400 transition-colors">
              <span className="px-2 py-2.5 text-xs text-gray-400 border-r border-gray-200 bg-white font-semibold">₹</span>
              <input type="number" value={cost.amount} onChange={e => updateCost(cost.id, 'amount', e.target.value)}
                placeholder="0"
                className="flex-1 px-2 py-2.5 text-sm focus:outline-none w-0 bg-gray-50" />
            </div>
            <button onClick={() => removeCost(cost.id)}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {/* Add another cost — dashed button */}
        <button onClick={addCost}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-600 hover:border-rose-400 hover:text-rose-500 transition-colors">
          <Plus size={15} />
          <span>Add another cost</span>
        </button>
      </div>

      {/* Total card */}
      <div className="border border-gray-200 rounded-2xl p-4 bg-white flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total (Rent + Additional Costs)</p>
          <p className="text-xs text-gray-400 mt-0.5">System calculated</p>
        </div>
        <div className="bg-gray-100 rounded-xl px-4 py-2.5">
          <p className="text-sm font-bold text-gray-800 whitespace-nowrap">₹ {total.toLocaleString('en-IN')} / month</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Drawer ───────────────────────────────────────────────────────────────

const DEFAULT_DATA: OnboardingData = {
  grid: {}, bookingMethod: 'Fixed Rent', rentAmount: '', rentUnit: 'Per Stall', stallRents: {}, offersText: '', additionalCosts: [],
};

export function OnboardingDrawer({ finalization, onClose, onSubmit }: OnboardingDrawerProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({ ...DEFAULT_DATA });
  const [saving, setSaving] = useState(false);
  const [isLayoutFullScreen, setIsLayoutFullScreen] = useState(false);

  const toggleLayoutFullScreen = () => setIsLayoutFullScreen(v => !v);

  // Exit fullscreen when leaving step 1
  const handleSetStep = (s: number) => {
    if (s !== 1) setIsLayoutFullScreen(false);
    setStep(s);
  };

  const update = (partial: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...partial }));

  const canProceed = () => {
    if (step === 1) return Object.values(data.grid).some((el: any) => el?.type === 'stall');
    if (step === 2) return Object.values(data.stallRents).some(v => !!v);
    return true;
  };

  const handleNext = () => {
    if (step < 4) handleSetStep(step + 1);
    else { setSaving(true); setTimeout(() => { onSubmit?.(data); onClose(); }, 800); }
  };

  const nextStep = STEPS.find(s => s.id === step + 1);
  const nextLabel = step === 4 ? 'Finish & Save' : `Continue to ${nextStep?.short ?? ''}`;
  const stallCount = Object.values(data.grid).filter((el: any) => el?.type === 'stall').length;
  const isLayoutStep = step === 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer — full screen on mobile, right side panel on desktop */}
      <div className="fixed z-50 bg-white shadow-2xl flex flex-col inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[min(520px,95vw)]">

        {/* ── Header ── */}
        {!(isLayoutFullScreen && step === 1) && (
          <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-base font-bold text-gray-900">Market Onboarding</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-300 text-gray-600 tracking-widest">
                  DRAFT
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Auto ID: generated after save &nbsp;·&nbsp; Last saved: 2 mins ago
              </p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 mt-0.5">
              <X size={17} />
            </button>
          </div>
        )}


        {/* ── Step bar ── */}
        {!(isLayoutFullScreen && step === 1) && (
          <StepBar current={step} onStep={handleSetStep} />
        )}

        {/* ── Step content ── */}
        <div className={`flex-1 min-h-0 ${step === 1 ? 'flex flex-col' : 'overflow-y-auto'}`}>
          {step === 1 && <StepLayout data={data} onChange={update} isFullScreen={isLayoutFullScreen} onToggleFullScreen={toggleLayoutFullScreen} />}
          {step === 2 && <StepOutletConfig data={data} onChange={update} />}
          {step === 3 && <StepOffers data={data} onChange={update} />}
          {step === 4 && <StepAdditionalCosts data={data} onChange={update} />}
        </div>

        {/* ── Footer ── */}
        {!(isLayoutFullScreen && step === 1) && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-4">
            <div className="flex items-center gap-2">
              {/* Back (steps 2-4) or Cancel (step 1) */}
              {step > 1 ? (
                <button onClick={() => handleSetStep(step - 1)}
                  className="flex flex-1 items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button onClick={onClose}
                  className="flex flex-1 items-center justify-center py-3 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Cancel
                </button>
              )}

              {/* Save Draft */}
              <button
                className="flex flex-1 items-center justify-center py-3 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                Save Draft
              </button>

              {/* Continue / Finish */}
              <button onClick={handleNext} disabled={saving}
                className="flex-[1.8] flex items-center justify-center gap-1.5 bg-[#ff1463] hover:bg-[#e60d55] disabled:bg-[#ff1463]/50 text-white rounded-2xl py-3 px-3 transition-colors min-w-0">
                <span className="text-[13px] font-extrabold whitespace-nowrap overflow-hidden text-ellipsis">
                  {saving ? 'Saving…' : nextLabel}
                </span>
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
                  : <ArrowRight size={15} className="flex-shrink-0" strokeWidth={2.5} />
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
