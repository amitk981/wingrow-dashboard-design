import { ShoppingCart, Clock, TrendingUp, Users, ChevronRight, Plus, History, MapPin, RefreshCw } from "lucide-react";
import { BillingCtx, HISTORY_BILLS, PRIMARY, formatRupee } from "./types";

interface Props { ctx: BillingCtx }

export function HomeScreen({ ctx }: Props) {
  const todayBills = HISTORY_BILLS.filter((b) => b.timestamp.startsWith("Today"));
  const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const todayProducts = todayBills.reduce((s, b) => s + b.itemCount, 0);

  const receiptStatusColor = (s: string) =>
    s === "sent" ? "#10B981" : s === "failed" ? "#EF4444" : "#F59E0B";
  const receiptStatusBg = (s: string) =>
    s === "sent" ? "#D1FAE5" : s === "failed" ? "#FEE2E2" : "#FEF3C7";

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
      {/* Greeting */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #c4274f 100%)` }}
      >
        <p className="text-sm opacity-80 mb-1">Good Morning 👋</p>
        <p className="text-xl font-bold mb-3">Ramesh Patil</p>
        <div className="flex items-center gap-1.5 text-xs opacity-90">
          <Clock size={13} />
          <span>Wed, Apr 22, 2026 · Active since 6:00 AM</span>
        </div>
      </div>

      {/* Active Market Block */}
      {hasMarket ? (
        /* ── Market already selected ── */
        <div
          className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 40, height: 40, background: "#FDE8EF" }}
          >
            <MapPin size={18} color={PRIMARY} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontSize: 9, color: PRIMARY }}>
                ACTIVE MARKET
              </p>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: "#10B981", fontSize: 8 }}
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
            style={{ background: "#F3F4F6", color: "#6B7280" }}
          >
            <RefreshCw size={11} />
            Change
          </button>
        </div>
      ) : (
        /* ── No market selected yet ── */
        <button
          onClick={() => ctx.goTo("market-select")}
          className="rounded-2xl px-4 py-3.5 flex items-center gap-3 w-full text-left border-2 border-dashed"
          style={{ borderColor: "#FCA5A5", background: "#FFF5F7" }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 40, height: 40, background: "#FDE8EF" }}
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

      {/* Today's Stats */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2" style={{ fontSize: 10 }}>
          TODAY'S SUMMARY
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ShoppingCart, color: PRIMARY, bg: "#FDE8EF", label: "Bills Created", value: String(todayBills.length) },
            { icon: TrendingUp, color: "#10B981", bg: "#D1FAE5", label: "Revenue", value: formatRupee(todayRevenue) },
            { icon: Users, color: "#3B82F6", bg: "#DBEAFE", label: "Customers", value: String(todayBills.length) },
            { icon: ShoppingCart, color: "#8B5CF6", bg: "#EDE9FE", label: "Products Sold", value: String(todayProducts) },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl mb-3"
                style={{ width: 40, height: 40, background: s.bg }}
              >
                <s.icon size={19} color={s.color} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1" style={{ fontSize: 9 }}>
                {s.label}
              </p>
              <p className="font-bold text-gray-900 text-xl">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Start New Bill CTA */}
      <button
        onClick={handleStartBill}
        className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #c4274f 100%)`,
          boxShadow: `0 4px 16px rgba(0,0,0,0.15)`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 32, height: 32, background: "rgba(255,255,255,0.25)" }}
        >
          <Plus size={18} color="white" />
        </div>
        <div className="text-left">
          <p className="font-bold text-base leading-tight">Start New Bill</p>
          {hasMarket && (
            <p className="text-xs opacity-75 leading-tight">{ctx.selectedMarket!.name}</p>
          )}
        </div>
      </button>

      {/* Recent Bills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase" style={{ fontSize: 10 }}>
            RECENT BILLS
          </p>
          <button
            onClick={() => ctx.goTo("sales-history")}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#FDE8EF", color: PRIMARY }}
          >
            <History size={12} />
            View All
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {todayBills.slice(0, 3).map((bill) => (
            <button
              key={bill.id}
              onClick={() => { ctx.setViewingBillId(bill.id); ctx.goTo("bill-detail"); }}
              className="bg-white rounded-2xl p-3.5 flex items-center gap-3 w-full text-left"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 42, height: 42, background: "#FDE8EF" }}
              >
                <ShoppingCart size={18} color={PRIMARY} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">{bill.billNo}</p>
                  <p className="font-bold text-sm" style={{ color: PRIMARY }}>
                    {formatRupee(bill.grandTotal)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-400">{bill.timestamp} · {bill.itemCount} items</p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: receiptStatusBg(bill.receiptStatus),
                      color: receiptStatusColor(bill.receiptStatus),
                      fontSize: 9,
                    }}
                  >
                    {bill.receiptStatus === "sent" ? "RECEIPT SENT" : bill.receiptStatus === "failed" ? "SEND FAILED" : "PENDING"}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} color="#D1D5DB" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
