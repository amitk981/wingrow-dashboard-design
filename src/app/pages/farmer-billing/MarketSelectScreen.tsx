import { useState } from "react";
import { ArrowLeft, MapPin, Clock, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { BillingCtx, MARKETS, Market } from "./types";
import {
  PRIMARY, PRIMARY_TINT,
  SECONDARY, SECONDARY_TINT,
  SUCCESS, SUCCESS_STRONG, SUCCESS_TINT,
  SURFACE_MUTED, BORDER, CARD_SHADOW,
} from "./tokens";

interface Props { ctx: BillingCtx }

const CELL_BG     = SURFACE_MUTED;
const CELL_BORDER = BORDER;

function MarketCard({
  market,
  isCurrentlySelected,
  onSelect,
}: {
  market: Market;
  isCurrentlySelected: boolean;
  onSelect: () => void;
}) {
  // Market ID pill (simulated)
  const marketCode = `MKT-${market.id.toString().padStart(3, "0")}`;

  return (
    <button
      onClick={market.isActive ? onSelect : undefined}
      className="w-full bg-white rounded-2xl p-5 text-left"
      style={{
        boxShadow: isCurrentlySelected
          ? `0 0 0 2px ${PRIMARY}, ${CARD_SHADOW}`
          : CARD_SHADOW,
        border: `1.5px solid ${isCurrentlySelected ? PRIMARY : CELL_BORDER}`,
        opacity: market.isActive ? 1 : 0.6,
        cursor: market.isActive ? "pointer" : "not-allowed",
      }}
    >
      {/* Top row: ID pill + status badges */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: SECONDARY_TINT, color: SECONDARY }}
        >
          {marketCode}
        </span>
        <div className="flex items-center gap-1.5">
          {isCurrentlySelected && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: PRIMARY_TINT, color: PRIMARY, fontSize: 9 }}
            >
              CURRENT
            </span>
          )}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={
              market.isActive
                ? { background: SUCCESS_TINT, color: SUCCESS_STRONG }
                : { background: PRIMARY_TINT, color: PRIMARY }
            }
          >
            {market.isActive ? "OPEN" : "TOMORROW"}
          </span>
        </div>
      </div>

      {/* Timing */}
      <p className="text-xs text-gray-400 mt-1 mb-0.5 flex items-center gap-1">
        <Clock size={10} color="#9CA3AF" />
        {market.timing}
      </p>

      {/* Market name */}
      <p className="font-bold text-gray-900 text-xl leading-tight mb-1">{market.name}</p>

      {/* Location */}
      <p className="text-sm text-gray-500 flex items-center gap-1">
        <MapPin size={12} color="#9CA3AF" />
        {market.location}
      </p>

      {/* Inner metadata cells */}
      <div
        className="mt-4 rounded-xl p-3 grid grid-cols-2 gap-3"
        style={{ background: CELL_BG }}
      >
        {[
          { label: "STALL NO", value: market.stallNo },
          { label: "PRODUCE FOCUS", value: market.produceFocus },
        ].map((cell) => (
          <div key={cell.label}>
            <p className="uppercase mb-0.5" style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.07em" }}>
              {cell.label}
            </p>
            <p className="font-bold text-gray-900 text-sm">{cell.value}</p>
          </div>
        ))}
      </div>

      {/* Select arrow */}
      {market.isActive && (
        <div className="flex justify-end mt-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: CELL_BG, color: PRIMARY }}
          >
            {isCurrentlySelected ? "Selected" : "Select Market"}
            <ChevronRight size={13} />
          </div>
        </div>
      )}
    </button>
  );
}

export function MarketSelectScreen({ ctx }: Props) {
  const isChanging = !!ctx.selectedMarket;

  const handleSelect = (market: Market) => {
    ctx.setSelectedMarket(market);
    ctx.clearCart();
    ctx.goTo("new-bill");
  };

  const handleBack = () => {
    if (isChanging) {
      ctx.goTo("new-bill");
    } else {
      ctx.goTo("home");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">
            {isChanging ? "Change Market" : "Select Market"}
          </h2>
          <p className="text-xs text-gray-400">
            {isChanging
              ? "Selecting a new market will clear your current cart"
              : "Choose your active selling context"}
          </p>
        </div>
      </div>

      {/* Warning when changing with an active cart */}
      {isChanging && ctx.cart.length > 0 && (
        <div
          className="rounded-xl p-3 flex items-start gap-2.5"
          style={{ background: "#FFFBEB" }}
        >
          <span className="text-base shrink-0">⚠️</span>
          <p className="text-xs" style={{ color: "#B45309" }}>
            You have <strong>{ctx.cart.length} item{ctx.cart.length > 1 ? "s" : ""}</strong> in your cart.
            Switching markets will clear the cart since prices differ per market.
          </p>
        </div>
      )}

      {/* Market list */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2" style={{ fontSize: 10 }}>
          YOUR ASSIGNED MARKETS
        </p>
        <div className="flex flex-col gap-3">
          {MARKETS.map((m) => (
            <MarketCard
              key={m.id}
              market={m}
              isCurrentlySelected={ctx.selectedMarket?.id === m.id}
              onSelect={() => handleSelect(m)}
            />
          ))}
        </div>
      </div>

      {/* Info notice */}
      <div
        className="rounded-xl p-3 flex items-start gap-2.5"
        style={{ background: CELL_BG }}
      >
        <CheckCircle2 size={16} color={PRIMARY} className="mt-0.5 shrink-0" />
        <p className="text-xs text-gray-500">
          Your selected market stays active across all bills until you explicitly change it here.
          Prices are auto-fetched from the market's configured price master.
        </p>
      </div>
    </div>
  );
}