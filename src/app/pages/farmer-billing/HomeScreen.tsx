import {
  ShoppingCart, Clock, TrendingUp, Users, ChevronRight,
  Plus, History, MapPin, RefreshCw, Zap, AlertTriangle,
} from "lucide-react";
import { BillingCtx, HISTORY_BILLS, formatRupee } from "./types";
import {
  PRIMARY, PRIMARY_HOVER, PRIMARY_TINT, SECONDARY, SECONDARY_TINT,
  SUCCESS, SUCCESS_TINT, SUCCESS_STRONG,
  WARNING_TINT, WARNING,
  SURFACE_MUTED, BORDER,
  CARD_SHADOW, ACCENT_SHADOW, PAGE_BG,
  TEXT, TEXT_DEFAULT, TEXT_MUTED, TEXT_SOFT,
} from "./tokens";

interface Props { ctx: BillingCtx }

const CELL_BG    = SURFACE_MUTED;   // #F1F5F9
const CELL_BORDER = BORDER;          // #E2E8F0
const BILL_ID_BG  = SECONDARY_TINT; // #E0E7FF
const BILL_ID_COLOR = SECONDARY;    // #4F46E5

const receiptStatusStyle = (s: string) => ({
  bg:    s === "sent"    ? SUCCESS_TINT : s === "failed" ? "#FFF1F2" : "#FFFBEB",
  color: s === "sent"    ? "#047857"    : s === "failed" ? "#BE123C" : "#B45309",
  label: s === "sent"    ? "SENT"       : s === "failed" ? "FAILED"  : "PENDING",
});

export function HomeScreen({ ctx }: Props) {
  const todayBills = HISTORY_BILLS.filter((b) => b.timestamp.startsWith("Today"));
  const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const todayProducts = todayBills.reduce((s, b) => s + b.itemCount, 0);
  const sentCount = todayBills.filter((b) => b.receiptStatus === "sent").length;
  const hasExceptions = todayBills.some((b) => b.hasException);

  const hasMarket = !!ctx.selectedMarket;

  const handleStartBill = () => {
    if (hasMarket) {
      ctx.clearCart();
      ctx.goTo("new-bill");
    } else {
      ctx.goTo("market-select");
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">

      {/* ── Greeting + Revenue Hero ───────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 text-white overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)` }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-6 -right-6 rounded-full opacity-10"
          style={{ width: 120, height: 120, background: "white" }}
        />
        <div
          className="absolute -bottom-8 -right-2 rounded-full opacity-5"
          style={{ width: 80, height: 80, background: "white" }}
        />

        {/* Top row */}
        <div className="flex items-start justify-between mb-4 relative">
          <div>
            <p className="text-sm opacity-80 mb-0.5">Good Morning 👋</p>
            <p className="text-xl font-bold">Ramesh Patil</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs opacity-80 bg-white bg-opacity-15 rounded-full px-2.5 py-1">
            <Clock size={11} />
            <span>Wed, Apr 22</span>
          </div>
        </div>

        {/* Revenue hero */}
        <div className="relative">
          <p className="text-xs opacity-70 uppercase tracking-widest mb-0.5" style={{ fontSize: 9 }}>
            TODAY'S REVENUE
          </p>
          <p className="text-4xl font-bold mb-3" style={{ letterSpacing: "-0.02em" }}>
            {formatRupee(todayRevenue)}
          </p>

          {/* Quick stats strip */}
          <div className="flex items-center gap-3">
            {[
              { value: String(todayBills.length), label: "Bills" },
              { value: String(todayProducts), label: "Products" },
              { value: `${sentCount}/${todayBills.length}`, label: "Receipts" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-4 bg-white opacity-20" />}
                <div>
                  <p className="font-bold text-sm leading-tight">{stat.value}</p>
                  <p className="text-xs opacity-65" style={{ fontSize: 9 }}>{stat.label}</p>
                </div>
              </div>
            ))}
            {hasExceptions && (
              <div className="ml-auto flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-2 py-0.5">
                <AlertTriangle size={11} color="white" />
                <span className="text-xs opacity-90">Review needed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Active Market Block ───────────────────────────────────────────── */}
      {hasMarket ? (
        <div
          className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 40, height: 40, background: CELL_BG }}
          >
            <MapPin size={18} color={PRIMARY} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontSize: 9, color: "#9CA3AF" }}>
                ACTIVE MARKET
              </p>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: SUCCESS_TINT, color: SUCCESS_STRONG, fontSize: 8 }}
              >
                OPEN
              </span>
            </div>
            <p className="font-bold text-gray-900 leading-tight truncate">{ctx.selectedMarket!.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Stall {ctx.selectedMarket!.stallNo} · {ctx.selectedMarket!.timing}
            </p>
          </div>
          <button
            onClick={() => ctx.goTo("market-select")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0"
            style={{ background: CELL_BG, color: PRIMARY }}
          >
            <RefreshCw size={11} />
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={() => ctx.goTo("market-select")}
          className="rounded-2xl px-4 py-3.5 flex items-center gap-3 w-full text-left border-2 border-dashed"
          style={{ borderColor: "#FCA5A5", background: "#FFF5F8" }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 40, height: 40, background: CELL_BG }}
          >
            <MapPin size={18} color={PRIMARY} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 leading-tight">No market selected</p>
            <p className="text-xs text-gray-400 mt-0.5">Tap to choose your selling market for today</p>
          </div>
          <ChevronRight size={16} color={PRIMARY} />
        </button>
      )}

      {/* ── Today's Stats ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2" style={{ fontSize: 10 }}>
          PERFORMANCE SNAPSHOT
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              icon: ShoppingCart,
              color: PRIMARY,
              bg: PRIMARY_TINT,
              label: "Bills",
              value: String(todayBills.length),
              sub: "Created today",
            },
            {
              icon: TrendingUp,
              color: SUCCESS,
              bg: SUCCESS_TINT,
              label: "Products",
              value: String(todayProducts),
              sub: "Units sold",
            },
            {
              icon: Users,
              color: SECONDARY,
              bg: SECONDARY_TINT,
              label: "Customers",
              value: String(sentCount),
              sub: "With receipt",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3.5 flex flex-col"
              style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
            >
              <div
                className="flex items-center justify-center rounded-xl mb-2.5"
                style={{ width: 36, height: 36, background: s.bg }}
              >
                <s.icon size={17} color={s.color} />
              </div>
              <p className="font-bold text-gray-900 text-xl leading-none mb-0.5">{s.value}</p>
              <p className="text-xs font-semibold text-gray-700">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontSize: 9 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Start New Bill CTA ────────────────────────────────────────────── */}
      <button
        onClick={handleStartBill}
        className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)`,
          boxShadow: ACCENT_SHADOW,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 34, height: 34, background: "rgba(255,255,255,0.22)" }}
        >
          <Plus size={19} color="white" />
        </div>
        <div className="text-left">
          <p className="font-bold text-base leading-tight">Start New Bill</p>
          {hasMarket ? (
            <p className="text-xs opacity-70 leading-tight">{ctx.selectedMarket!.name}</p>
          ) : (
            <p className="text-xs opacity-70 leading-tight">Select market first</p>
          )}
        </div>
        <div className="ml-auto opacity-60">
          <Zap size={16} color="white" />
        </div>
      </button>

      {/* ── Recent Bills ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase" style={{ fontSize: 10 }}>
              RECENT BILLS
            </p>
            {todayRevenue > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="font-semibold" style={{ color: PRIMARY }}>{formatRupee(todayRevenue)}</span> total today
              </p>
            )}
          </div>
          <button
            onClick={() => ctx.goTo("sales-history")}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: PRIMARY_TINT, color: PRIMARY }}
          >
            <History size={12} />
            View All
          </button>
        </div>

        {todayBills.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-6 text-center"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-2"
              style={{ width: 48, height: 48, background: CELL_BG }}
            >
              <ShoppingCart size={22} color={PRIMARY} />
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-0.5">No bills yet today</p>
            <p className="text-gray-400 text-xs">Your completed bills will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayBills.slice(0, 3).map((bill) => {
              const s = receiptStatusStyle(bill.receiptStatus);
              return (
                <button
                  key={bill.id}
                  onClick={() => { ctx.setViewingBillId(bill.id); ctx.goTo("bill-detail"); }}
                  className="bg-white rounded-2xl p-4 flex items-center gap-3 w-full text-left"
                  style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: 42, height: 42, background: CELL_BG }}
                  >
                    <ShoppingCart size={18} color={PRIMARY} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: BILL_ID_BG, color: BILL_ID_COLOR }}
                      >
                        {bill.billNo}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.color, fontSize: 9 }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{bill.timestamp} · {bill.itemCount} items</p>
                      <p className="font-bold text-base" style={{ color: PRIMARY }}>{formatRupee(bill.grandTotal)}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} color={BORDER} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}