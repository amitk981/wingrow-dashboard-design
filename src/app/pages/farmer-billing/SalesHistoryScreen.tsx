import { useState } from "react";
import {
  ArrowLeft, Search, CheckCircle2, AlertTriangle,
  Clock, Scale, Hash, RefreshCw, Share2, ChevronRight, ShoppingCart
} from "lucide-react";
import { BillingCtx, HISTORY_BILLS, PRIMARY, formatRupee } from "./types";

interface Props { ctx: BillingCtx }

type FilterType = "ALL" | "sent" | "failed" | "pending";

// ─── Bill History Screen ───────────────────────────────────────────────────────
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

  const receiptStatusColor = (s: string) =>
    s === "sent" ? "#10B981" : s === "failed" ? "#EF4444" : "#F59E0B";
  const receiptStatusBg = (s: string) =>
    s === "sent" ? "#D1FAE5" : s === "failed" ? "#FEE2E2" : "#FEF3C7";
  const receiptStatusLabel = (s: string) =>
    s === "sent" ? "RECEIPT SENT" : s === "failed" ? "SEND FAILED" : "PENDING";

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "ALL", label: "ALL" },
    { key: "sent", label: "SENT" },
    { key: "failed", label: "FAILED" },
    { key: "pending", label: "PENDING" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("home")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: "#FDE8EF" }}
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
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
      >
        <Search size={17} color="#9CA3AF" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bill ID or mobile..."
          className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 text-xs">✕</button>
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
              background: filter === f.key ? PRIMARY : "#fff",
              color: filter === f.key ? "#fff" : "#6B7280",
              border: `1px solid ${filter === f.key ? PRIMARY : "#E5E7EB"}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bill List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <ShoppingCart size={40} color="#D1D5DB" className="mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No bills found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((bill) => (
            <button
              key={bill.id}
              onClick={() => { ctx.setViewingBillId(bill.id); ctx.goTo("bill-detail"); }}
              className="bg-white rounded-2xl p-4 w-full text-left"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#FDE8EF", color: PRIMARY }}
                >
                  {bill.billNo}
                </span>
                <div className="flex items-center gap-2">
                  {bill.hasException && (
                    <AlertTriangle size={14} color="#F59E0B" />
                  )}
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: receiptStatusBg(bill.receiptStatus),
                      color: receiptStatusColor(bill.receiptStatus),
                      fontSize: 9,
                    }}
                  >
                    {receiptStatusLabel(bill.receiptStatus)}
                  </span>
                </div>
              </div>

              {/* Bill details */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
                    <Clock size={11} />
                    <span>{bill.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {bill.itemCount} item{bill.itemCount !== 1 ? "s" : ""} · +91 {bill.customerMobile}
                  </p>
                  <p className="text-xs text-gray-400">{bill.marketName} · Stall {bill.stallNo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupee(bill.grandTotal)}</p>
                  <ChevronRight size={16} color="#D1D5DB" />
                </div>
              </div>
            </button>
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

  const receiptStatusColor = bill.receiptStatus === "sent" ? "#10B981" : bill.receiptStatus === "failed" ? "#EF4444" : "#F59E0B";
  const receiptStatusBg = bill.receiptStatus === "sent" ? "#D1FAE5" : bill.receiptStatus === "failed" ? "#FEE2E2" : "#FEF3C7";

  const hasMC = bill.items.some((i) => i.manualCorrection);
  const hasLowConf = bill.items.some((i) => i.aiConfidence !== undefined && i.aiConfidence < 80);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            // If we came from home (recent bills), go back to home
            // If we came from history, go back to history
            if (ctx.viewingBillId) ctx.goTo("sales-history");
          }}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: "#FDE8EF" }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Bill Detail</h2>
          <p className="text-xs text-gray-400">{bill.billNo}</p>
        </div>
      </div>

      {/* Bill Header */}
      <div
        className="rounded-2xl p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #c4274f 100%)` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs opacity-70 uppercase tracking-widest mb-0.5" style={{ fontSize: 9 }}>{bill.timestamp}</p>
            <p className="font-bold text-base">{bill.marketName}</p>
            <p className="text-xs opacity-80">Stall {bill.stallNo} · Ramesh Patil</p>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: receiptStatusBg, color: receiptStatusColor, fontSize: 9 }}
          >
            {bill.receiptStatus === "sent" ? "RECEIPT SENT" : bill.receiptStatus === "failed" ? "SEND FAILED" : "PENDING"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-70">Customer Mobile</p>
            <p className="font-semibold">+91 {bill.customerMobile}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Grand Total</p>
            <p className="text-2xl font-bold">{formatRupee(bill.grandTotal)}</p>
          </div>
        </div>
      </div>

      {/* Exception / Flag Notices */}
      {hasMC && (
        <div
          className="rounded-xl p-3 flex items-start gap-2"
          style={{ background: "#FEF3C7" }}
        >
          <AlertTriangle size={14} color="#F59E0B" className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: "#92400E" }}>
            This bill contains manual corrections and is flagged for supervisor review.
          </p>
        </div>
      )}

      {hasLowConf && (
        <div
          className="rounded-xl p-3 flex items-start gap-2"
          style={{ background: "#FEF3C7" }}
        >
          <AlertTriangle size={14} color="#F59E0B" className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: "#92400E" }}>
            Some items had low AI confidence and should be reviewed.
          </p>
        </div>
      )}

      {/* Line Items */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: 10 }}>
            LINE ITEMS ({bill.itemCount})
          </p>
        </div>
        {bill.items.map((item, idx) => (
          <div
            key={idx}
            className="p-4"
            style={{ borderBottom: idx < bill.items.length - 1 ? "1px solid #F9FAFB" : "none" }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={
                    item.billingType === "weight"
                      ? { background: "#DBEAFE", color: "#3B82F6" }
                      : { background: "#F0FDF4", color: "#10B981" }
                  }
                >
                  {item.billingType === "weight" ? <><Scale size={9} /> Wt</> : <><Hash size={9} /> Cnt</>}
                </span>
                <p className="font-bold text-gray-900">{item.name}</p>
                {item.manualCorrection && (
                  <AlertTriangle size={12} color="#F59E0B" />
                )}
              </div>
              <p className="font-bold" style={{ color: PRIMARY }}>{formatRupee(item.lineTotal)}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {item.billingType === "weight" ? (
                <>
                  <div>
                    <p className="text-gray-400 uppercase" style={{ fontSize: 8, letterSpacing: "0.06em", marginBottom: 1 }}>WEIGHT</p>
                    <p className="text-sm font-semibold text-gray-800">{item.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase" style={{ fontSize: 8, letterSpacing: "0.06em", marginBottom: 1 }}>RATE</p>
                    <p className="text-sm font-semibold text-gray-800">₹{item.rate}/kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase" style={{ fontSize: 8, letterSpacing: "0.06em", marginBottom: 1 }}>CONFIDENCE</p>
                    <p className="text-sm font-semibold" style={{ color: item.aiConfidence !== undefined ? (item.aiConfidence >= 80 ? "#10B981" : "#F59E0B") : "#9CA3AF" }}>
                      {item.aiConfidence !== undefined ? `${item.aiConfidence}%` : "Manual"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-gray-400 uppercase" style={{ fontSize: 8, letterSpacing: "0.06em", marginBottom: 1 }}>QTY</p>
                    <p className="text-sm font-semibold text-gray-800">{item.quantity} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase" style={{ fontSize: 8, letterSpacing: "0.06em", marginBottom: 1 }}>RATE</p>
                    <p className="text-sm font-semibold text-gray-800">₹{item.rate}/{item.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase" style={{ fontSize: 8, letterSpacing: "0.06em", marginBottom: 1 }}>METHOD</p>
                    <p className="text-sm font-semibold text-gray-600">Manual</p>
                  </div>
                </>
              )}
            </div>
            {item.manualCorrection && (
              <div
                className="mt-2 px-2 py-1 rounded-lg flex items-center gap-1"
                style={{ background: "#FEF3C7" }}
              >
                <AlertTriangle size={11} color="#F59E0B" />
                <p className="text-xs" style={{ color: "#92400E" }}>Weight manually corrected · Pending supervisor review</p>
              </div>
            )}
          </div>
        ))}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "#F9FAFB" }}
        >
          <p className="font-bold text-gray-900">Grand Total</p>
          <p className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupee(bill.grandTotal)}</p>
        </div>
      </div>

      {/* Receipt Status & Actions */}
      {bill.receiptStatus !== "sent" && (
        <button
          onClick={handleResend}
          className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{ background: resentOk ? "#D1FAE5" : PRIMARY, color: resentOk ? "#10B981" : "white" }}
        >
          {resentOk ? (
            <><CheckCircle2 size={17} /> Receipt Resent Successfully</>
          ) : (
            <><RefreshCw size={17} /> Resend Receipt</>
          )}
        </button>
      )}

      {bill.receiptStatus === "sent" && (
        <button
          onClick={handleResend}
          className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 border"
          style={{ borderColor: "#D1FAE5", background: resentOk ? "#D1FAE5" : "#F0FDF4", color: "#10B981" }}
        >
          {resentOk ? <><CheckCircle2 size={17} /> Resent!</> : <><Share2 size={17} /> Share / Resend Receipt</>}
        </button>
      )}
    </div>
  );
}