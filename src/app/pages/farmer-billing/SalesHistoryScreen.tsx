import { useState } from "react";
import {
  ArrowLeft, Search, CheckCircle2, AlertTriangle,
  Clock, Scale, Hash, RefreshCw, Share2, ChevronRight,
  ShoppingCart, TrendingUp, SendHorizonal
} from "lucide-react";
import { BillingCtx, HISTORY_BILLS, formatRupee } from "./types";
import {
  PRIMARY, PRIMARY_TINT,
  SECONDARY, SECONDARY_TINT,
  SUCCESS, SUCCESS_STRONG, SUCCESS_TINT,
  WARNING, WARNING_STRONG, WARNING_TINT,
  DANGER, DANGER_STRONG, DANGER_TINT,
  INFO, INFO_TINT,
  SURFACE_MUTED, BORDER,
  CARD_SHADOW,
} from "./tokens";

interface Props { ctx: BillingCtx }

type FilterType = "ALL" | "sent" | "failed" | "pending";

const CELL_BG     = SURFACE_MUTED;
const CELL_BORDER = BORDER;
const BILL_ID_BG  = SECONDARY_TINT;
const BILL_ID_COLOR = SECONDARY;

const receiptStyle = (s: string) => ({
  bg:    s === "sent"  ? SUCCESS_TINT  : s === "failed" ? DANGER_TINT  : WARNING_TINT,
  color: s === "sent"  ? SUCCESS_STRONG : s === "failed" ? DANGER_STRONG : WARNING_STRONG,
  label: s === "sent"  ? "SENT"         : s === "failed" ? "FAILED"       : "PENDING",
});

// ─── Day Summary Header ────────────────────────────────────────────────────────
function DaySummary({
  label,
  bills,
}: {
  label: string;
  bills: typeof HISTORY_BILLS;
}) {
  const total = bills.reduce((s, b) => s + b.grandTotal, 0);
  const sentCount = bills.filter((b) => b.receiptStatus === "sent").length;
  const failCount = bills.filter((b) => b.receiptStatus === "failed").length;

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center justify-between"
      style={{ background: CELL_BG }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, background: "white" }}
        >
          <TrendingUp size={15} color={PRIMARY} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-400">
            {bills.length} bill{bills.length !== 1 ? "s" : ""}
            {failCount > 0 && (
              <span style={{ color: DANGER }}> · {failCount} failed</span>
            )}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-base" style={{ color: PRIMARY }}>{formatRupee(total)}</p>
        <p className="text-xs text-gray-400">
          {sentCount}/{bills.length} receipts sent
        </p>
      </div>
    </div>
  );
}

// ─── Bill Card ─────────────────────────────────────────────────────────────────
function BillCard({
  bill,
  onPress,
}: {
  bill: (typeof HISTORY_BILLS)[0];
  onPress: () => void;
}) {
  const s = receiptStyle(bill.receiptStatus);

  return (
    <button
      onClick={onPress}
      className="bg-white rounded-2xl p-5 w-full text-left"
      style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
    >
      {/* Row 1: ID + status */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: BILL_ID_BG, color: BILL_ID_COLOR }}
        >
          {bill.billNo}
        </span>
        <div className="flex items-center gap-1.5">
          {bill.hasException && <AlertTriangle size={13} color={WARNING} />}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: s.bg, color: s.color, fontSize: 9 }}
          >
            {s.label}
          </span>
        </div>
      </div>

      {/* Row 2: timestamp */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 mb-1">
        <Clock size={10} />
        <span>{bill.timestamp}</span>
      </div>

      {/* Row 3: market name (bold title) */}
      <p className="font-bold text-gray-900 leading-tight mb-3">{bill.marketName}</p>

      {/* Inner metadata cells */}
      <div className="rounded-xl p-3 grid grid-cols-3 gap-2 mb-3" style={{ background: CELL_BG }}>
        {[
          { label: "STALL", value: bill.stallNo },
          { label: "ITEMS", value: String(bill.itemCount) },
          {
            label: "CUSTOMER",
            value: bill.customerMobile
              ? `••••${bill.customerMobile.slice(-4)}`
              : "—",
          },
        ].map((cell) => (
          <div key={cell.label}>
            <p className="uppercase mb-0.5" style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.06em" }}>
              {cell.label}
            </p>
            <p className="font-bold text-gray-900 text-sm">{cell.value}</p>
          </div>
        ))}
      </div>

      {/* Row 4: Total + chevron */}
      <div className="flex items-center justify-between">
        <div>
          <p className="uppercase" style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.06em" }}>GRAND TOTAL</p>
          <p className="text-xl font-bold mt-0.5" style={{ color: PRIMARY }}>{formatRupee(bill.grandTotal)}</p>
        </div>
        <ChevronRight size={18} color={BORDER} />
      </div>
    </button>
  );
}

// ─── Sales History Screen ──────────────────────────────────────────────────────
export function SalesHistoryScreen({ ctx }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filtered = HISTORY_BILLS.filter((b) => {
    const matchSearch =
      b.billNo.toLowerCase().includes(search.toLowerCase()) ||
      b.marketName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerMobile.includes(search);
    const matchFilter = filter === "ALL" || b.receiptStatus === filter;
    return matchSearch && matchFilter;
  });

  const todayBills = filtered.filter((b) => b.timestamp.startsWith("Today"));
  const yesterdayBills = filtered.filter((b) => b.timestamp.startsWith("Yesterday"));

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "sent", label: "Sent" },
    { key: "failed", label: "Failed" },
    { key: "pending", label: "Pending" },
  ];

  const goToBill = (id: string) => {
    ctx.setViewingBillId(id);
    ctx.goTo("bill-detail");
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("home")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Sales History</h2>
          <p className="text-xs text-gray-400">{HISTORY_BILLS.length} bills · Today & Yesterday</p>
        </div>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 bg-white rounded-xl px-4 py-3"
        style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
      >
        <Search size={17} color="#9CA3AF" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bill ID, market or mobile..."
          className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ background: CELL_BG, color: PRIMARY }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: filter === f.key ? PRIMARY : CELL_BG,
              color: filter === f.key ? "#fff" : PRIMARY,
              border: `1.5px solid ${filter === f.key ? PRIMARY : CELL_BORDER}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: CARD_SHADOW }}>
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-3"
            style={{ width: 56, height: 56, background: CELL_BG }}
          >
            <ShoppingCart size={26} color={BORDER} />
          </div>
          <p className="text-gray-500 text-sm font-semibold mb-1">No bills found</p>
          <p className="text-gray-400 text-xs">Try changing the search or filter</p>
        </div>
      )}

      {/* ── Today ───────────────────────────────────────────────────────── */}
      {todayBills.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <DaySummary label="Today" bills={todayBills} />
          {todayBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} onPress={() => goToBill(bill.id)} />
          ))}
        </div>
      )}

      {/* ── Yesterday ───────────────────────────────────────────────────── */}
      {yesterdayBills.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <DaySummary label="Yesterday" bills={yesterdayBills} />
          {yesterdayBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} onPress={() => goToBill(bill.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bill Detail Screen ────────────────────────────────────────────────────────
export function BillDetailScreen({ ctx }: Props) {
  const bill = HISTORY_BILLS.find((b) => b.id === ctx.viewingBillId);
  const [resentOk, setResentOk] = useState(false);

  if (!bill) return null;

  const handleResend = () => {
    setResentOk(true);
    setTimeout(() => setResentOk(false), 3000);
  };

  const s = receiptStyle(bill.receiptStatus);
  const hasMC = bill.items.some((i) => i.manualCorrection);
  const hasLowConf = bill.items.some((i) => i.aiConfidence !== undefined && i.aiConfidence < 80);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { if (ctx.viewingBillId) ctx.goTo("sales-history"); }}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Bill Detail</h2>
          <p className="text-xs text-gray-400">{bill.billNo}</p>
        </div>
      </div>

      {/* Bill header card */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}>
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: BILL_ID_BG, color: BILL_ID_COLOR }}
          >
            {bill.billNo}
          </span>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: s.bg, color: s.color, fontSize: 9 }}
          >
            {bill.receiptStatus === "sent" ? "RECEIPT SENT" : bill.receiptStatus === "failed" ? "SEND FAILED" : "PENDING"}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 mb-0.5">{bill.timestamp}</p>
        <p className="font-bold text-gray-900 text-xl leading-tight mb-1">{bill.marketName}</p>
        <p className="text-sm text-gray-500 mb-4">Stall {bill.stallNo} · Ramesh Patil</p>

        <div className="rounded-xl p-3 grid grid-cols-2 gap-3" style={{ background: CELL_BG }}>
          <div>
            <p className="uppercase mb-0.5" style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.06em" }}>CUSTOMER MOBILE</p>
            <p className="font-bold text-gray-900 text-sm">+91 {bill.customerMobile}</p>
          </div>
          <div>
            <p className="uppercase mb-0.5" style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.06em" }}>GRAND TOTAL</p>
            <p className="font-bold text-xl" style={{ color: PRIMARY }}>{formatRupee(bill.grandTotal)}</p>
          </div>
        </div>
      </div>

      {/* Flags */}
      {(hasMC || hasLowConf) && (
        <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: WARNING_TINT }}>
          <AlertTriangle size={14} color={WARNING} className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: WARNING_STRONG }}>
            {hasMC && "Manual corrections flagged for supervisor review."}
            {hasMC && hasLowConf && " "}
            {hasLowConf && "Some items had low AI confidence."}
          </p>
        </div>
      )}

      {/* Line Items */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px dashed ${CELL_BORDER}` }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: 10 }}>
            LINE ITEMS ({bill.itemCount})
          </p>
        </div>
        {bill.items.map((item, idx) => (
          <div
            key={idx}
            className="p-4"
            style={{ borderBottom: idx < bill.items.length - 1 ? `1px dashed ${CELL_BORDER}` : "none" }}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={
                    item.billingType === "weight"
                      ? { background: INFO_TINT, color: INFO }
                      : { background: SUCCESS_TINT, color: SUCCESS }
                  }
                >
                  {item.billingType === "weight" ? <><Scale size={9} /> Wt</> : <><Hash size={9} /> Cnt</>}
                </span>
                <p className="font-bold text-gray-900">{item.name}</p>
                {item.manualCorrection && <AlertTriangle size={12} color={WARNING} />}
              </div>
              <p className="font-bold" style={{ color: PRIMARY }}>{formatRupee(item.lineTotal)}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {item.billingType === "weight" ? (
                <>
                  {[
                    { label: "WEIGHT", value: `${item.weight} kg` },
                    { label: "RATE", value: `₹${item.rate}/kg` },
                    {
                      label: "CONFIDENCE",
                      value: item.aiConfidence !== undefined ? `${item.aiConfidence}%` : "Manual",
                      color: item.aiConfidence !== undefined
                        ? (item.aiConfidence >= 80 ? SUCCESS : WARNING)
                        : "#9CA3AF",
                    },
                  ].map((cell) => (
                    <div key={cell.label} className="rounded-lg p-2" style={{ background: CELL_BG }}>
                      <p className="uppercase mb-0.5" style={{ fontSize: 8, color: "#9CA3AF", letterSpacing: "0.06em" }}>{cell.label}</p>
                      <p className="text-sm font-bold" style={{ color: cell.color || "#111827" }}>{cell.value}</p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: "QTY", value: `${item.quantity} ${item.unit}` },
                    { label: "RATE", value: `₹${item.rate}/${item.unit}` },
                    { label: "METHOD", value: "Manual" },
                  ].map((cell) => (
                    <div key={cell.label} className="rounded-lg p-2" style={{ background: CELL_BG }}>
                      <p className="uppercase mb-0.5" style={{ fontSize: 8, color: "#9CA3AF", letterSpacing: "0.06em" }}>{cell.label}</p>
                      <p className="text-sm font-bold text-gray-800">{cell.value}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: CELL_BG, borderTop: `1px dashed ${CELL_BORDER}` }}>
          <p className="font-bold text-gray-900">Grand Total</p>
          <p className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupee(bill.grandTotal)}</p>
        </div>
      </div>

      {/* Receipt actions */}
      {bill.receiptStatus !== "sent" && (
        <button
          onClick={handleResend}
          className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{ background: resentOk ? SUCCESS_TINT : PRIMARY, color: resentOk ? SUCCESS : "white" }}
        >
          {resentOk ? <><CheckCircle2 size={17} /> Resent!</> : <><RefreshCw size={17} /> Resend Receipt</>}
        </button>
      )}
      {bill.receiptStatus === "sent" && (
        <button
          onClick={handleResend}
          className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{ background: resentOk ? SUCCESS_TINT : CELL_BG, color: resentOk ? SUCCESS : "#334155" }}
        >
          {resentOk ? <><CheckCircle2 size={17} /> Resent!</> : <><Share2 size={17} /> Share / Resend Receipt</>}
        </button>
      )}
    </div>
  );
}