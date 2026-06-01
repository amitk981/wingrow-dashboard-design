import { useState } from "react";
import { ArrowLeft, Search, Scale, Hash, ChevronRight, Zap, Clock } from "lucide-react";
import { BillingCtx, SKUS, SKU, pricingLabel, Category } from "./types";
import {
  PRIMARY, PRIMARY_TINT,
  SUCCESS, SUCCESS_TINT,
  INFO, INFO_TINT,
  WARNING, WARNING_TINT,
  SURFACE_MUTED, BORDER,
  CARD_SHADOW,
} from "./tokens";

interface Props { ctx: BillingCtx }

const CATEGORIES: Category[] = ["Vegetables", "Fruits", "Herbs", "Others"];
const CELL_BG     = SURFACE_MUTED;
const CELL_BORDER = BORDER;

// Simulated frequently sold — in a real app from usage history
const QUICK_PICK_IDS = ["s1", "s3", "s2", "s9", "s5"];

export function ProductSelectScreen({ ctx }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const quickPicks = SKUS.filter((s) => QUICK_PICK_IDS.includes(s.id));

  const filtered = SKUS.filter((s) => {
    const matchSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleSelect = (sku: SKU) => {
    ctx.setSelectedSKU(sku);
    if (sku.billingType === "weight") {
      ctx.goTo("weight-capture");
    } else {
      ctx.goTo("count-quantity");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("new-bill")}
          className="flex items-center justify-center rounded-2xl shrink-0"
          style={{ width: 42, height: 42, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-xl leading-tight">Select Product</h2>
          <p className="text-xs text-gray-400 mt-0.5">{SKUS.length} products available</p>
        </div>
      </div>

      {/* ── Quick Pick strip ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 22, height: 22, background: PRIMARY_TINT }}
          >
            <Clock size={12} color={PRIMARY} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ fontSize: 10, color: PRIMARY }}>
            Quick Pick — Often Sold
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {quickPicks.map((sku) => (
            <button
              key={sku.id}
              onClick={() => handleSelect(sku)}
              className="shrink-0 flex flex-col items-center bg-white rounded-2xl text-center"
              style={{
                boxShadow: CARD_SHADOW,
                border: `1.5px solid ${CELL_BORDER}`,
                width: 96,
                padding: "14px 8px 12px",
                gap: 8,
              }}
            >
              {/* Big emoji */}
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: 52, height: 52, background: CELL_BG, fontSize: 28 }}
              >
                {sku.emoji}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{sku.name}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: PRIMARY }}>
                  ₹{sku.rate}
                  <span className="font-normal text-gray-400" style={{ fontSize: 10 }}>{pricingLabel(sku)}</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5"
        style={{ boxShadow: CARD_SHADOW, border: `1.5px solid ${CELL_BORDER}` }}
      >
        <Search size={17} color="#E8A0B4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
          style={{ "::placeholder": { color: "#E8A0B4" } } as React.CSSProperties}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: CELL_BG, color: PRIMARY }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Category Filter ────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {(["All", ...CATEGORIES] as (Category | "All")[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors"
            style={{
              background: activeCategory === cat ? PRIMARY : CELL_BG,
              color: activeCategory === cat ? "#fff" : PRIMARY,
              border: `1.5px solid ${activeCategory === cat ? PRIMARY : CELL_BORDER}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── SKU List ──────────────────────────────────────────────────────── */}
      {search && filtered.length > 0 && (
        <p className="text-xs text-gray-400 -mb-2">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<strong>{search}</strong>"
        </p>
      )}

      <div className="flex flex-col gap-2.5 pb-6">
        {filtered.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-10 text-center"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-gray-700 font-bold mb-1">No products found</p>
            <p className="text-gray-400 text-sm">Try a different name or clear the filter</p>
          </div>
        ) : (
          filtered.map((sku) => (
            <button
              key={sku.id}
              onClick={() => handleSelect(sku)}
              className="bg-white rounded-2xl flex items-center gap-4 w-full text-left"
              style={{
                boxShadow: CARD_SHADOW,
                padding: "14px 16px",
                border: `1px solid ${CELL_BORDER}`,
              }}
            >
              {/* Emoji container */}
              <div
                className="flex items-center justify-center rounded-2xl shrink-0"
                style={{ width: 54, height: 54, background: CELL_BG, fontSize: 26 }}
              >
                {sku.emoji}
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + AI badge */}
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-bold text-gray-900 text-base leading-tight">{sku.name}</p>
                  {sku.imageSupported && (
                    <span
                      className="flex items-center gap-0.5 font-bold rounded-full px-1.5 py-0.5"
                      style={{ background: WARNING_TINT, color: WARNING, fontSize: 9 }}
                    >
                      <Zap size={9} /> AI
                    </span>
                  )}
                </div>
                {/* Type + category */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full"
                    style={
                      sku.billingType === "weight"
                        ? { background: INFO_TINT, color: INFO, fontSize: 11 }
                        : { background: SUCCESS_TINT, color: SUCCESS, fontSize: 11 }
                    }
                  >
                    {sku.billingType === "weight" ? <><Scale size={10} /> Weight</> : <><Hash size={10} /> Count</>}
                  </span>
                  <span
                    className="font-medium px-2 py-0.5 rounded-full"
                    style={{ background: CELL_BG, color: PRIMARY, fontSize: 11 }}
                  >
                    {sku.category}
                  </span>
                </div>
              </div>

              {/* Rate + chevron */}
              <div className="text-right shrink-0">
                <p className="font-bold text-xl leading-tight" style={{ color: PRIMARY }}>₹{sku.rate}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pricingLabel(sku)}</p>
              </div>
              <ChevronRight size={16} color={BORDER} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}