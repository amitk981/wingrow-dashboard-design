import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { RotateCw, Trash2, Eraser, RefreshCw, Grid, ChevronDown, SeparatorHorizontal, Footprints, DoorOpen, SquareParking, Ban, Wrench } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Facing = 'N' | 'E' | 'S' | 'W';
type InfraType = 'road' | 'pathway' | 'entry' | 'parking' | 'blocked' | 'misc';
type ElemType = 'stall' | InfraType;

interface PlacedElement {
  type: ElemType;
  catId?: string;
  facing: Facing;
}

type GridMap = Record<string, PlacedElement>;

interface ActiveTool { type: ElemType; catId?: string; }

// ─── Data ──────────────────────────────────────────────────────────────────────

export const STALL_CATEGORIES = [
  { id: 'flowers',   label: 'Flowers',      color: '#e53935', light: '#ffebee' },
  { id: 'leafy',     label: 'Leafy',        color: '#00897b', light: '#e0f2f1' },
  { id: 'flwr-kobi', label: 'Flower Kobi',  color: '#388e3c', light: '#e8f5e9' },
  { id: 'fruits',    label: 'Fruits',       color: '#ef6c00', light: '#fff3e0' },
  { id: 'snacks',    label: 'Snacks',       color: '#b71c1c', light: '#ffcdd2' },
  { id: 'tarkari',   label: 'Tarkari',      color: '#2e7d32', light: '#c8e6c9' },
  { id: 'onion-pot', label: 'Onion Potato', color: '#78909c', light: '#eceff1' },
  { id: 'spices',    label: 'Spices',       color: '#ad1457', light: '#fce4ec' },
  { id: 'dryfruits', label: 'Dry Fruits',   color: '#689f38', light: '#f1f8e9' },
  { id: 'general',   label: 'General',      color: '#c62828', light: '#ffebee' },
  { id: 'antique',   label: 'Antique',      color: '#6a1b9a', light: '#f3e5f5' },
  { id: 'pineapple', label: 'Pineapple',    color: '#9e9d24', light: '#f9fbe7' },
  { id: 'seasonal',  label: 'Seasonal',     color: '#7b1fa2', light: '#ede7f6' },
  { id: 'gajar-wat', label: 'Gajar Watana', color: '#e91e63', light: '#fce4ec' },
  { id: 'dairy',     label: 'Dairy',        color: '#0288d1', light: '#e1f5fe' },
  { id: 'mukhvas',   label: 'Mukhvas',      color: '#f9a825', light: '#fffde7' },
  { id: 'exotics',   label: 'Exotics',      color: '#1565c0', light: '#e3f2fd' },
  { id: 'bakery',    label: 'Bakery',       color: '#4e342e', light: '#efebe9' },
  { id: 'other',     label: 'Other',        color: '#546e7a', light: '#eceff1' },
];

const INFRA_ITEMS = [
  { id: 'road',    label: 'Road',       color: '#616161', bg: '#e0e0e0', Icon: SeparatorHorizontal },
  { id: 'pathway', label: 'Pathway',    color: '#9e9e9e', bg: '#f5f5f5', Icon: Footprints },
  { id: 'entry',   label: 'Entry/Exit', color: '#2e7d32', bg: '#e8f5e9', Icon: DoorOpen },
  { id: 'parking', label: 'Parking',    color: '#1565c0', bg: '#e8eaf6', Icon: SquareParking },
  { id: 'blocked', label: 'Blocked',    color: '#424242', bg: '#eeeeee', Icon: Ban },
  { id: 'misc',    label: 'Misc',       color: '#e64a19', bg: '#fbe9e7', Icon: Wrench },
];

const GRID_PRESETS = [
  { label: 'S', cols: 10, rows: 8 },
  { label: 'M', cols: 16, rows: 12 },
  { label: 'L', cols: 22, rows: 16 },
];

const FACING_CYCLE: Facing[] = ['N', 'E', 'S', 'W'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cellKey(r: number, c: number) { return `${r}-${c}`; }
function getCat(id?: string) { return STALL_CATEGORIES.find(x => x.id === id); }
function getInfra(id: string) { return INFRA_ITEMS.find(x => x.id === id); }
function nextFacing(f: Facing): Facing { return FACING_CYCLE[(FACING_CYCLE.indexOf(f) + 1) % 4]; }
function hexToRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Stall SVG ─────────────────────────────────────────────────────────────────

function StallSvg({ color, facing, no, size }: { color: string; facing: Facing; no: number; size: number }) {
  const p = 2, w = size - p * 2, h = size - p * 2;
  const awningH = Math.round(h * 0.28);
  const archLen = Math.round((facing === 'N' || facing === 'S' ? w : h) * 0.50);
  const archD = Math.round((facing === 'N' || facing === 'S' ? h : w) * 0.20);
  const cx = p + w / 2, cy = p + h / 2;
  const archRect = (() => {
    switch (facing) {
      case 'N': return { x: cx - archLen / 2, y: p,             width: archLen, height: archD };
      case 'S': return { x: cx - archLen / 2, y: p + h - archD, width: archLen, height: archD };
      case 'E': return { x: p + w - archD,    y: cy - archLen / 2, width: archD, height: archLen };
      case 'W': return { x: p,                y: cy - archLen / 2, width: archD, height: archLen };
    }
  })();
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect x={p} y={p} width={w} height={h} rx={3} fill={color} opacity={0.88} />
      <rect x={p} y={p} width={w} height={awningH} rx={3} fill={hexToRgba('#000', 0.22)} />
      <rect x={archRect.x} y={archRect.y} width={archRect.width} height={archRect.height}
        rx={Math.min(archRect.width, archRect.height) / 2} fill="white" opacity={0.78} />
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.max(8, Math.round(size * 0.22))} fill="white" fontWeight="700"
        fontFamily="system-ui,-apple-system,sans-serif">{no}</text>
    </svg>
  );
}

// ─── Infrastructure Cell ────────────────────────────────────────────────────────

function InfraSvg({ type, size }: { type: string; size: number }) {
  const infra = getInfra(type);
  const color = infra?.color ?? '#9e9e9e', bg = infra?.bg ?? '#f5f5f5';
  const IconComp = infra?.Icon;
  const iconSize = Math.max(10, Math.round(size * 0.45));
  return (
    <div style={{ width: size, height: size, backgroundColor: bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {IconComp && <IconComp size={iconSize} color={color} strokeWidth={2} />}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface MarketLayoutDesignerProps {
  initialGrid?: GridMap;
  onChange?: (grid: GridMap) => void;
}

type PaletteMode = 'stall' | 'infra' | 'erase';

export function MarketLayoutDesigner({ initialGrid = {}, onChange }: MarketLayoutDesignerProps) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [grid, setGrid] = useState<GridMap>(initialGrid);
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [erasing, setErasing] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isPainting, setIsPainting] = useState(false);
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('stall');
  const [dragSrc, setDragSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const { cols, rows } = GRID_PRESETS[presetIdx];
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(42);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const computed = Math.floor(Math.min(w / cols, h / rows));
      setCellSize(Math.max(20, computed));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols, rows]);

  const stallNumbers = useMemo(() => {
    const nums: Record<string, number> = {};
    let n = 1;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const k = cellKey(r, c);
        if (grid[k]?.type === 'stall') nums[k] = n++;
      }
    return nums;
  }, [grid, rows, cols]);

  const stallCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(grid).forEach(el => {
      if (el.type === 'stall' && el.catId) counts[el.catId] = (counts[el.catId] ?? 0) + 1;
    });
    return counts;
  }, [grid]);

  const totalStalls = useMemo(() => Object.values(stallCounts).reduce((a, b) => a + b, 0), [stallCounts]);

  const updateGrid = useCallback((next: GridMap) => {
    setGrid(next); onChange?.(next);
  }, [onChange]);

  const paintCell = useCallback((r: number, c: number) => {
    const k = cellKey(r, c);
    if (erasing) {
      const next = { ...grid }; delete next[k];
      updateGrid(next); setSelectedKey(null); return;
    }
    if (!activeTool) return;
    updateGrid({ ...grid, [k]: { type: activeTool.type, catId: activeTool.catId, facing: 'S' } });
    setSelectedKey(null);
  }, [activeTool, erasing, grid, updateGrid]);

  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    const k = cellKey(r, c);
    if (!activeTool && !erasing) {
      if (grid[k]) {
        // Start drag-to-move
        setDragSrc(k);
        setDragOver(k);
        setSelectedKey(null);
      } else {
        setSelectedKey(prev => prev === k ? null : k);
      }
      return;
    }
    setIsPainting(true);
    paintCell(r, c);
  };

  const handleCellMouseEnter = useCallback((r: number, c: number) => {
    const k = cellKey(r, c);
    if (dragSrc) { setDragOver(k); return; }
    if (isPainting) paintCell(r, c);
  }, [dragSrc, isPainting, paintCell]);

  const handleMouseUp = useCallback(() => {
    if (dragSrc && dragOver && dragOver !== dragSrc) {
      const el = grid[dragSrc];
      if (el) {
        const next = { ...grid };
        delete next[dragSrc];
        next[dragOver] = el;
        updateGrid(next);
      }
    } else if (dragSrc && dragOver === dragSrc) {
      // Didn't move — treat as a select tap
      setSelectedKey(dragSrc);
    }
    setDragSrc(null);
    setDragOver(null);
    setIsPainting(false);
  }, [dragSrc, dragOver, grid, updateGrid]);

  const rotateSelected = () => {
    if (!selectedKey || !grid[selectedKey]) return;
    updateGrid({ ...grid, [selectedKey]: { ...grid[selectedKey], facing: nextFacing(grid[selectedKey].facing) } });
  };

  const deleteSelected = () => {
    if (!selectedKey) return;
    const next = { ...grid }; delete next[selectedKey];
    updateGrid(next); setSelectedKey(null);
  };

  const selectStallTool = (catId: string) => {
    setErasing(false);
    setActiveTool(prev => prev?.catId === catId ? null : { type: 'stall', catId });
    setSelectedKey(null);
  };

  const selectInfraTool = (id: string) => {
    setErasing(false);
    setActiveTool(prev => prev?.type === id ? null : { type: id as ElemType });
    setSelectedKey(null);
  };

  const toggleErase = () => {
    setActiveTool(null); setErasing(v => !v); setSelectedKey(null);
    setPaletteMode('erase');
  };

  const switchMode = (mode: PaletteMode) => {
    setPaletteMode(mode);
    if (mode === 'erase') {
      setErasing(true); setActiveTool(null);
    } else {
      setErasing(false); setActiveTool(null);
    }
    setSelectedKey(null);
  };

  const activeToolLabel = erasing
    ? 'Erase mode'
    : activeTool?.type === 'stall'
    ? getCat(activeTool.catId)?.label ?? 'Stall'
    : activeTool
    ? getInfra(activeTool.type)?.label ?? activeTool.type
    : 'Select a tool';

  const activeToolColor = activeTool?.type === 'stall'
    ? getCat(activeTool.catId)?.color
    : activeTool
    ? getInfra(activeTool.type)?.color
    : undefined;

  return (
    <div className="flex flex-col h-full bg-white select-none text-sm">

      {/* ── Top toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 flex-shrink-0 bg-gray-50">
        {/* Size preset */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5">
          {GRID_PRESETS.map((p, i) => (
            <button key={i} onClick={() => { setPresetIdx(i); updateGrid({}); setSelectedKey(null); }}
              className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                presetIdx === i ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Grid toggle */}
        <button onClick={() => setShowGrid(v => !v)}
          className={`p-1.5 rounded-lg border transition-all ${showGrid ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`}
          title="Toggle grid">
          <Grid size={13} />
        </button>

        {/* Clear */}
        <button onClick={() => { updateGrid({}); setSelectedKey(null); }}
          className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 bg-white transition-all">
          <RefreshCw size={10} /> Clear
        </button>

        {/* Active tool pill */}
        {(activeTool || erasing) ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ml-1 transition-all"
            style={erasing
              ? { backgroundColor: '#fff1f2', borderColor: '#fca5a5' }
              : { backgroundColor: activeToolColor ? hexToRgba(activeToolColor, 0.1) : '#f0fdf4', borderColor: activeToolColor ?? '#86efac' }}>
            {erasing
              ? <Eraser size={11} className="text-red-400" />
              : <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: activeToolColor ?? '#666' }} />}
            <span className="text-[11px] font-semibold" style={{ color: erasing ? '#ef4444' : activeToolColor ?? '#333' }}>
              {activeToolLabel}
            </span>
            <button onClick={() => { setActiveTool(null); setErasing(false); }}
              className="text-gray-400 hover:text-gray-600 ml-0.5 leading-none text-xs">×</button>
          </div>
        ) : null}

        <div className="ml-auto text-[11px] text-gray-400 hidden sm:block">
          <span className="font-bold text-gray-700">{totalStalls}</span> stalls · {cols}×{rows}
        </div>
      </div>

      {/* ── Mode tabs (mobile-first palette strip) ── */}
      <div className="flex-shrink-0 border-b border-gray-100">
        {/* Mode selector */}
        <div className="flex border-b border-gray-100">
          {(['stall', 'infra', 'erase'] as PaletteMode[]).map(mode => (
            <button key={mode} onClick={() => switchMode(mode)}
              className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all ${
                paletteMode === mode
                  ? mode === 'erase' ? 'text-red-500 border-b-2 border-red-400' : 'text-rose-600 border-b-2 border-rose-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              {mode === 'stall' ? 'Stalls' : mode === 'infra' ? 'Infrastructure' : 'Erase'}
            </button>
          ))}
        </div>

        {/* Palette strip */}
        {paletteMode === 'stall' && (
          <div className="flex overflow-x-auto gap-1.5 px-3 py-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {STALL_CATEGORIES.map(cat => {
              const isActive = activeTool?.type === 'stall' && activeTool.catId === cat.id;
              const count = stallCounts[cat.id];
              return (
                <button key={cat.id} onClick={() => selectStallTool(cat.id)}
                  className="flex-shrink-0 w-16 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all border"
                  style={isActive
                    ? { backgroundColor: cat.light, borderColor: cat.color, outline: `2px solid ${cat.color}`, outlineOffset: '-1px' }
                    : { backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                  <span className="w-6 h-6 rounded flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ backgroundColor: cat.color }}>S</span>
                  <span className="text-[9px] font-medium w-full text-center truncate px-1" style={{ color: isActive ? cat.color : '#6b7280' }}>
                    {cat.label}
                  </span>
                  {count > 0 && (
                    <span className="text-[9px] font-bold px-1 rounded-full"
                      style={{ backgroundColor: cat.light, color: cat.color }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {paletteMode === 'infra' && (
          <div className="flex overflow-x-auto gap-1.5 px-3 py-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {INFRA_ITEMS.map(infra => {
              const isActive = activeTool?.type === infra.id;
              return (
                <button key={infra.id} onClick={() => selectInfraTool(infra.id)}
                  className="flex-shrink-0 w-16 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all border"
                  style={isActive
                    ? { backgroundColor: infra.bg, borderColor: infra.color, outline: `2px solid ${infra.color}`, outlineOffset: '-1px' }
                    : { backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                  <span className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: infra.bg }}>
                    <infra.Icon size={14} color={infra.color} strokeWidth={2} />
                  </span>
                  <span className="text-[9px] font-medium w-full text-center truncate px-1" style={{ color: isActive ? infra.color : '#6b7280' }}>
                    {infra.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {paletteMode === 'erase' && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Eraser size={16} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500">Erase mode active</p>
              <p className="text-[10px] text-gray-400">Tap or drag over cells to remove them</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Canvas — fills remaining space exactly, no scroll ── */}
      <div
        ref={canvasContainerRef}
        className={`flex-1 overflow-hidden bg-gray-50/60 flex items-center justify-center ${
          dragSrc ? 'cursor-grabbing' : erasing ? 'cursor-cell' : activeTool ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onContextMenu={e => e.preventDefault()}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ userSelect: 'none' }}>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: cols }, (_, c) => {
                const k = cellKey(r, c);
                const el = grid[k];
                const isSelected = selectedKey === k;
                const stallNo = el?.type === 'stall' ? (stallNumbers[k] ?? 0) : 0;
                const cat = el?.type === 'stall' ? getCat(el.catId) : undefined;
                return (
                  <div key={c}
                    onMouseDown={e => handleCellMouseDown(r, c, e)}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    onContextMenu={e => {
                      e.preventDefault();
                      const next = { ...grid }; delete next[k];
                      updateGrid(next);
                      if (selectedKey === k) setSelectedKey(null);
                    }}
                    style={{ width: cellSize, height: cellSize, position: 'relative', flexShrink: 0 }}
                    className={`${showGrid ? 'border border-gray-200' : ''} ${
                      isSelected ? 'ring-2 ring-inset ring-blue-400 z-10' : ''
                    } ${dragOver === k && dragSrc && dragSrc !== k ? 'ring-2 ring-inset ring-emerald-400 bg-emerald-50/60 z-10' : ''
                    } ${!el && activeTool ? 'hover:bg-rose-50/70' : ''} ${!el && erasing ? 'hover:bg-red-50' : ''}`}
                  >
                    {el && (
                      <div style={{ opacity: dragSrc === k && dragOver !== k ? 0.3 : 1, transition: 'opacity 0.1s' }}>
                        {el.type === 'stall' && cat
                          ? <StallSvg color={cat.color} facing={el.facing} no={stallNo} size={cellSize} />
                          : el.type !== 'stall'
                          ? <InfraSvg type={el.type} size={cellSize} />
                          : null}
                      </div>
                    )}

                    {isSelected && el && (
                      <div
                        className="absolute z-20 flex items-center bg-gray-900 rounded-lg shadow-xl overflow-hidden"
                        style={{ top: -28, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
                        onMouseDown={e => e.stopPropagation()}
                      >
                        {el.type === 'stall' && (
                          <button onClick={rotateSelected}
                            className="flex items-center gap-1 text-white hover:text-blue-300 px-2 py-1 border-r border-gray-700 transition-colors">
                            <RotateCw size={10} />
                            <span className="text-[9px]">{el.facing}</span>
                          </button>
                        )}
                        <button onClick={deleteSelected}
                          className="text-white hover:text-red-300 px-2 py-1 transition-colors">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer summary ── */}
      {totalStalls > 0 && (
        <div className="border-t border-gray-100 bg-white px-3 py-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mr-0.5">Placed:</span>
            {STALL_CATEGORIES.filter(c => stallCounts[c.id] > 0).map(cat => (
              <span key={cat.id} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cat.light, color: cat.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.label} {stallCounts[cat.id]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
