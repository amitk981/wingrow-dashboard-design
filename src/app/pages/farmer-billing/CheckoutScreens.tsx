import { useState } from "react";
import {
  ArrowLeft, Phone, ChevronRight, Scale, Hash,
  CheckCircle2, Share2, RefreshCw, Plus, Printer,
  MessageCircle, Smartphone, X, TrendingUp
} from "lucide-react";
import { BillingCtx, HISTORY_BILLS, formatRupee, cartTotal, pricingLabel } from "./types";
import {
  PRIMARY, PRIMARY_TINT, PRIMARY_HOVER,
  SECONDARY, SECONDARY_TINT,
  SUCCESS, SUCCESS_STRONG, SUCCESS_TINT,
  WARNING_TINT, WARNING_STRONG,
  DANGER_TINT, DANGER,
  INFO, INFO_TINT,
  SURFACE_MUTED, BORDER,
  CARD_SHADOW, ACCENT_SHADOW,
} from "./tokens";
import { CheckoutStepper } from "./CheckoutStepper";

interface Props { ctx: BillingCtx }

const CELL_BG      = SURFACE_MUTED;
const CELL_BORDER  = BORDER;
const BILL_ID_BG   = SECONDARY_TINT;
const BILL_ID_COLOR = SECONDARY;

// ─── Customer Mobile Screen ────────────────────────────────────────────────────
export function CustomerMobileScreen({ ctx }: Props) {
  const [mobile, setMobile] = useState(ctx.customerMobile);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const digits = mobile.replace(/\D/g, "").slice(0, 10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(val);
    if (error) setError("");
  };

  const handleClear = () => {
    setMobile("");
    setError("");
  };

  const validate = () => {
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleContinue = () => {
    if (validate()) {
      ctx.setCustomerMobile(digits);
      ctx.goTo("bill-confirm");
    }
  };

  const isValid = digits.length === 10;
  const progress = (digits.length / 10) * 100;

  return (
    <div className="flex flex-col gap-5 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("cart-review")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Customer Details</h2>
          <p className="text-xs text-gray-400">Optional — for digital receipt</p>
        </div>
      </div>

      {/* Checkout Progress */}
      <CheckoutStepper step={2} />

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3" style={{ fontSize: 10 }}>
          CUSTOMER MOBILE NUMBER
        </p>

        {/* Input row */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all"
          style={{
            borderColor: error ? "#EF4444" : focused ? PRIMARY : isValid ? SUCCESS : CELL_BORDER,
            background: focused ? "#FFFBFC" : "#fff",
          }}
        >
          {/* Country code */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-base">🇮🇳</span>
            <span className="font-semibold text-gray-700">+91</span>
          </div>
          <div className="w-px h-5 bg-gray-200 shrink-0" />

          {/* Native tel input */}
          <input
            type="tel"
            inputMode="numeric"
            value={mobile}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter 10-digit number"
            autoFocus
            className="flex-1 outline-none bg-transparent placeholder-gray-300"
            style={{ fontSize: 18, color: "#111827", letterSpacing: "0.04em" }}
          />

          {/* Clear / check indicator */}
          {mobile.length > 0 && (
            isValid ? (
              <CheckCircle2 size={20} color={SUCCESS} className="shrink-0" />
            ) : (
              <button onClick={handleClear} className="shrink-0 p-0.5 rounded-full" style={{ background: CELL_BG }}>
                <X size={14} color={PRIMARY} />
              </button>
            )
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: isValid ? SUCCESS : PRIMARY,
              transition: "width 0.15s ease",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          {error ? (
            <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
          ) : (
            <p className="text-xs text-gray-400">
              {digits.length === 0 ? "Tap above to open keyboard" : digits.length < 10 ? `${10 - digits.length} more digits needed` : "Valid number ✓"}
            </p>
          )}
          <p className="text-xs text-gray-300">{digits.length}/10</p>
        </div>
      </div>

      {/* Receipt info cards */}
      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: 10 }}>
          WHAT THE CUSTOMER GETS
        </p>
        {[
          {
            icon: MessageCircle,
            color: SUCCESS,
            bg: SUCCESS_TINT,
            title: "WhatsApp Receipt",
            desc: "Instant digital receipt with itemised bill breakdown",
          },
          {
            icon: Smartphone,
            color: INFO,
            bg: INFO_TINT,
            title: "SMS Fallback",
            desc: "SMS sent automatically if WhatsApp is unavailable",
          },
          {
            icon: Phone,
            color: PRIMARY,
            bg: PRIMARY_TINT,
            title: "Call-Back Ready",
            desc: "Customer can call back for bill queries using this number",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 38, height: 38, background: item.bg }}
            >
              <item.icon size={18} color={item.color} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{item.title}</p>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky bottom actions */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white px-4 pt-3 pb-5 flex flex-col gap-2"
        style={{ boxShadow: "0 -2px 16px rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: isValid ? PRIMARY : CELL_BG,
            boxShadow: isValid ? ACCENT_SHADOW : "none",
            color: isValid ? "white" : PRIMARY,
            border: `1.5px solid ${isValid ? PRIMARY : CELL_BORDER}`,
          }}
        >
          Continue to Confirm
          <ChevronRight size={17} />
        </button>
        <button
          onClick={() => { ctx.setCustomerMobile(""); ctx.goTo("bill-confirm"); }}
          className="text-center text-xs text-gray-400 py-1"
        >
          Skip — proceed without sending receipt
        </button>
      </div>
    </div>
  );
}

// ─── Bill Confirm Screen ───────────────────────────────────────────────────────
export function BillConfirmScreen({ ctx }: Props) {
  const total = cartTotal(ctx.cart);
  const market = ctx.selectedMarket!;

  const handleConfirm = () => {
    const billNo = `FB-2026-${(Math.floor(Math.random() * 900) + 100)}`;
    ctx.setCompletedBillNo(billNo);
    ctx.goTo("bill-success");
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("customer-mobile")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Confirm Bill</h2>
          <p className="text-xs text-gray-400">Final review before saving</p>
        </div>
      </div>

      {/* Checkout Progress */}
      <CheckoutStepper step={3} />

      {/* Bill Header Card — white with inner cells */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}>
        {/* Market name */}
        <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{market.name}</p>
        <p className="text-xs text-gray-400 mb-4">Stall {market.stallNo} · Ramesh Patil</p>
        {/* Inner cells */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "CUSTOMER MOBILE", value: ctx.customerMobile ? `+91 ${ctx.customerMobile}` : "Not provided" },
            { label: "ITEMS IN BILL", value: String(ctx.cart.length) },
          ].map((cell) => (
            <div key={cell.label} className="rounded-xl p-3" style={{ background: CELL_BG }}>
              <p className="uppercase mb-0.5" style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.06em" }}>{cell.label}</p>
              <p className="font-bold text-gray-900 text-sm">{cell.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px dashed ${CELL_BORDER}` }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: 10 }}>LINE ITEMS</p>
        </div>
        {ctx.cart.map((item, idx) => (
          <div
            key={item.cartId}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: idx < ctx.cart.length - 1 ? `1px dashed ${CELL_BORDER}` : "none" }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0 text-base"
              style={{ width: 36, height: 36, background: CELL_BG }}
            >
              {item.sku.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.sku.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                {item.sku.billingType === "weight" ? (
                  <><Scale size={10} /><span>{item.weight} kg × ₹{item.sku.rate}/kg</span></>
                ) : (
                  <><Hash size={10} /><span>{item.quantity} {item.sku.unit} × ₹{item.sku.rate}{pricingLabel(item.sku)}</span></>
                )}
              </div>
            </div>
            <p className="font-bold text-sm text-gray-900">{formatRupee(item.lineTotal)}</p>
          </div>
        ))}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: CELL_BG, borderTop: `1px dashed ${CELL_BORDER}` }}
        >
          <p className="font-bold text-gray-900">Grand Total</p>
          <p className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupee(total)}</p>
        </div>
      </div>

      {/* Confirm Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white p-4 flex gap-3"
        style={{ boxShadow: "0 -2px 16px rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={() => ctx.goTo("cart-review")}
          className="flex-1 py-4 rounded-2xl font-bold"
          style={{ background: CELL_BG, color: PRIMARY, border: `1.5px solid ${CELL_BORDER}` }}
        >
          Edit Bill
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-4 rounded-2xl text-white font-bold"
          style={{ background: PRIMARY }}
        >
          Confirm & Save
        </button>
      </div>
    </div>
  );
}

// ─── Bill Success Screen ───────────────────────────────────────────────────────
export function BillSuccessScreen({ ctx }: Props) {
  const total = cartTotal(ctx.cart);
  const [receiptResent, setReceiptResent] = useState(false);

  // Running today's total (mock history + this bill)
  const historyToday = HISTORY_BILLS.filter((b) => b.timestamp.startsWith("Today"));
  const historyTodayTotal = historyToday.reduce((s, b) => s + b.grandTotal, 0);
  const todayTotal = historyTodayTotal + total;
  const todayBillCount = historyToday.length + 1;

  const handleResend = () => {
    setReceiptResent(true);
    setTimeout(() => setReceiptResent(false), 3000);
  };

  const handleNewBill = () => {
    ctx.clearCart();
    ctx.setCustomerMobile("");
    ctx.setCompletedBillNo("");
    // Market stays selected — farmer doesn't need to re-select every time
    ctx.goTo("new-bill");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Checkout Progress */}
      <CheckoutStepper step={4} />

      {/* Success Animation */}
      <div className="flex flex-col items-center py-6 gap-3">
        <div className="relative">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: SUCCESS_TINT, transform: "scale(1.25)", opacity: 0.5 }}
          />
          <div
            className="flex items-center justify-center rounded-full relative"
            style={{ width: 80, height: 80, background: SUCCESS_TINT }}
          >
            <CheckCircle2 size={44} color={SUCCESS} />
          </div>
        </div>
        <p className="text-xl font-bold text-gray-900">Bill Saved!</p>
        <span
          className="text-xs font-bold tracking-widest px-3 py-1.5 rounded-full"
          style={{ background: BILL_ID_BG, color: BILL_ID_COLOR }}
        >
          {ctx.completedBillNo}
        </span>
      </div>

      {/* Bill Amount Card */}
      <div
        className="rounded-2xl p-5 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)` }}
      >
        <p className="text-sm opacity-80 mb-1">This Bill</p>
        <p className="text-4xl font-bold mb-1" style={{ letterSpacing: "-0.02em" }}>{formatRupee(total)}</p>
        <p className="text-sm opacity-70">{ctx.cart.length} item{ctx.cart.length !== 1 ? "s" : ""} · {ctx.selectedMarket?.name}</p>
      </div>

      {/* Today's running total — motivational stat */}
      <div
        className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
        style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 40, height: 40, background: SECONDARY_TINT }}
        >
          <TrendingUp size={19} color={SECONDARY} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ fontSize: 9, color: "#9CA3AF" }}>
            TODAY'S RUNNING TOTAL
          </p>
          <p className="font-bold text-gray-900">
            {formatRupee(todayTotal)}
            <span className="text-gray-400 text-sm font-normal ml-1.5">across {todayBillCount} bills</span>
          </p>
        </div>
      </div>

      {/* Receipt Status */}
      {ctx.customerMobile ? (
        <div
          className="bg-white rounded-xl p-3 flex items-center justify-between"
          style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 34, height: 34, background: SUCCESS_TINT }}
            >
              <CheckCircle2 size={16} color={SUCCESS} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {receiptResent ? "Receipt Resent!" : "Receipt Sent via WhatsApp"}
              </p>
              <p className="text-xs text-gray-400">+91 {ctx.customerMobile}</p>
            </div>
          </div>
          <button
            onClick={() => { setReceiptResent(true); setTimeout(() => setReceiptResent(false), 3000); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: SUCCESS_TINT, color: SUCCESS_STRONG }}
          >
            <RefreshCw size={11} /> Resend
          </button>
        </div>
      ) : (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: WARNING_TINT }}>
          <span className="text-sm">📵</span>
          <p className="text-xs" style={{ color: WARNING_STRONG }}>No customer mobile — receipt not sent</p>
        </div>
      )}

      {/* Line Items (compact) */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px dashed ${CELL_BORDER}` }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: 10 }}>ITEMS SOLD</p>
        </div>
        {ctx.cart.map((item, idx) => (
          <div
            key={item.cartId}
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: idx < ctx.cart.length - 1 ? `1px dashed ${CELL_BORDER}` : "none" }}
          >
            <span className="text-sm text-gray-700">
              {item.sku.emoji} {item.sku.name}
              <span className="text-gray-400 ml-2 text-xs">
                {item.sku.billingType === "weight" ? `${item.weight}kg` : `×${item.quantity}`}
              </span>
            </span>
            <span className="text-sm font-semibold text-gray-900">{formatRupee(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      {/* Actions row */}
      <div className="flex gap-2">
        <button
          onClick={() => { setReceiptResent(true); setTimeout(() => setReceiptResent(false), 3000); }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: CELL_BG, color: PRIMARY }}
        >
          <Share2 size={15} /> Share
        </button>
        <button
          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: CELL_BG, color: PRIMARY }}
        >
          <Printer size={15} /> Print
        </button>
        <button
          onClick={() => { ctx.setViewingBillId(null); ctx.goTo("sales-history"); }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: CELL_BG, color: PRIMARY }}
        >
          History
        </button>
      </div>

      <button
        onClick={handleNewBill}
        className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
        style={{ background: PRIMARY, boxShadow: ACCENT_SHADOW }}
      >
        <Plus size={18} />
        Start New Bill
      </button>
    </div>
  );
}