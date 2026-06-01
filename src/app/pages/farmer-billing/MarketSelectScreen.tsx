import { MapPin, Clock, Store, ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { BillingCtx, MARKETS, Market, PRIMARY } from "./types";

interface Props { ctx: BillingCtx }

function MarketCard({
  market,
  isCurrentlySelected,
  onSelect,
}: {
  market: Market;
  isCurrentlySelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={market.isActive ? onSelect : undefined}
      className="w-full bg-white rounded-2xl p-4 flex items-start gap-4 text-left"
      style={{
        boxShadow: isCurrentlySelected
          ? `0 0 0 2px ${PRIMARY}, 0 2px 10px rgba(232,49,102,0.15)`
          : "0 1px 6px rgba(0,0,0,0.07)",
        opacity: market.isActive ? 1 : 0.55,
        cursor: market.isActive ? "pointer" : "not-allowed",
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl shrink-0"
        style={{ width: 48, height: 48, background: market.isActive ? "#FDE8EF" : "#F3F4F6" }}
      >
        <Store size={22} color={market.isActive ? PRIMARY : "#9CA3AF"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-gray-900 text-base leading-tight">{market.name}</p>
          {market.isActive ? (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
              style={{ background: "#10B981", fontSize: 9 }}
            >
              OPEN
            </span>
          ) : (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "#F3F4F6", color: "#6B7280", fontSize: 9 }}
            >
              TOMORROW
            </span>
          )}
          {isCurrentlySelected && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "#FDE8EF", color: PRIMARY, fontSize: 9 }}
            >
              CURRENT
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
          <MapPin size={11} />
          <span className="truncate">{market.location}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={11} color="#9CA3AF" />
            <span>{market.timing}</span>
          </div>
          <span>·</span>
          <span>Stall <strong style={{ color: market.isActive ? PRIMARY : "#6B7280" }}>{market.stallNo}</strong></span>
        </div>
        <div className="mt-1.5">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#F3F4F6", color: "#374151" }}
          >
            {market.produceFocus}
          </span>
        </div>
      </div>
      {market.isActive && <ChevronRight size={18} color="#D1D5DB" className="mt-1 shrink-0" />}
    </button>
  );
}

export function MarketSelectScreen({ ctx }: Props) {
  // If a market was already selected the farmer is here to *change* it — back goes to new-bill.
  // If no market was selected (first time), back goes to home.
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
          style={{ width: 38, height: 38, background: "#FDE8EF" }}
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
          style={{ background: "#FEF3C7" }}
        >
          <span className="text-base shrink-0">⚠️</span>
          <p className="text-xs" style={{ color: "#92400E" }}>
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
        style={{ background: "#FDE8EF" }}
      >
        <CheckCircle2 size={16} color={PRIMARY} className="mt-0.5 shrink-0" />
        <p className="text-xs" style={{ color: PRIMARY }}>
          Your selected market stays active across all bills until you explicitly change it here.
          Prices are auto-fetched from the market's configured price master.
        </p>
      </div>
    </div>
  );
}
