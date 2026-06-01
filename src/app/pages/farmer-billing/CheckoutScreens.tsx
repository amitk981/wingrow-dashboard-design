import { useState } from "react";
import {
  ArrowLeft, Phone, ChevronRight, Scale, Hash,
  CheckCircle2, Share2, RefreshCw, Plus, Printer,
  MessageCircle, Smartphone, X
} from "lucide-react";
import { BillingCtx, PRIMARY, formatRupee, cartTotal, pricingLabel } from "./types";

interface Props { ctx: BillingCtx }

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
          style={{ width: 38, height: 38, background: "#FDF2F7" }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Customer Details</h2>
          <p className="text-xs text-gray-400">Optional — for digital receipt</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3" style={{ fontSize: 10 }}>
          CUSTOMER MOBILE NUMBER
        </p>

        {/* Input row */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all"
          style={{
            borderColor: error ? "#EF4444" : focused ? PRIMARY : isValid ? "#10B981" : "#E5E7EB",
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
              <CheckCircle2 size={20} color="#10B981" className="shrink-0" />
            ) : (
              <button onClick={handleClear} className="shrink-0 p-0.5 rounded-full" style={{ background: "#F9FAFB" }}>
                <X size={14} color="#9CA3AF" />
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
              background: isValid ? "#10B981" : PRIMARY,
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
            color: "#10B981",
            bg: "#D1FAE5",
            title: "WhatsApp Receipt",
            desc: "Instant digital receipt with itemised bill breakdown",
          },
          {
            icon: Smartphone,
            color: "#3B82F6",
            bg: "#DBEAFE",
            title: "SMS Fallback",
            desc: "SMS sent automatically if WhatsApp is unavailable",
          },
          {
            icon: Phone,
            color: PRIMARY,
            bg: "#FDF2F7",
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
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: isValid ? PRIMARY : "#D1D5DB",
            boxShadow: isValid ? `0 4px 14px rgba(232,49,102,0.3)` : "none",
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
          style={{ width: 38, height: 38, background: "#FDF2F7" }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Confirm Bill</h2>
          <p className="text-xs text-gray-400">Final review before saving</p>
        </div>
      </div>

      {/* Bill Header Card */}
      <div
        className="rounded-2xl p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #c4274f 100%)` }}
      >
        <p className="text-xs opacity-70 uppercase tracking-widest mb-1" style={{ fontSize: 9 }}>BILL PREVIEW</p>
        <p className="font-bold text-lg mb-3">{market.name} · Stall {market.stallNo}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-70">Customer Mobile</p>
            <p className="font-semibold">{ctx.customerMobile ? `+91 ${ctx.customerMobile}` : "Not provided"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Items in Bill</p>
            <p className="font-semibold">{ctx.cart.length}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: 10 }}>LINE ITEMS</p>
        </div>
        {ctx.cart.map((item, idx) => (
          <div
            key={item.cartId}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: idx < ctx.cart.length - 1 ? "1px solid #F9FAFB" : "none" }}
          >
            <span className="text-lg">{item.sku.emoji}</span>
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
          style={{ background: "#F9FAFB" }}
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
          style={{ background: "#FDF2F7", color: PRIMARY }}
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
  const market = ctx.selectedMarket!;
  const lastItem = ctx.cart[ctx.cart.length - 1]; // Showing details of the last item for this view
  const [receiptResent, setReceiptResent] = useState(false);

  const handleResend = () => {
    setReceiptResent(true);
    setTimeout(() => setReceiptResent(false), 3000);
  };

  const handleNewBill = () => {
    ctx.clearCart();
    ctx.setCustomerMobile("");
    ctx.setCompletedBillNo("");
    ctx.goTo("new-bill");
  };

  return (
    <div className="flex flex-col -m-4">
      {/* Header Section */}
      <div 
        className="flex flex-col items-center pt-10 pb-8 px-6 text-white text-center rounded-b-[40px]"
        style={{ background: PRIMARY }}
      >
        <div 
          className="flex items-center justify-center rounded-full mb-6"
          style={{ width: 84, height: 84, background: "rgba(255,255,255,0.2)" }}
        >
          <div 
            className="flex items-center justify-center rounded-full bg-white"
            style={{ width: 44, height: 44 }}
          >
            <CheckCircle2 size={24} color={PRIMARY} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Sale Completed! 🎉</h1>
        <p className="text-sm opacity-90 mb-6">Transaction saved successfully</p>
        
        <div 
          className="px-6 py-2 rounded-full font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          {ctx.completedBillNo || "TXN-005"}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="px-5 -mt-6">
        <div 
          className="bg-white rounded-3xl p-6 flex flex-col items-center"
          style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
          <p className="text-5xl font-black mb-1" style={{ color: PRIMARY }}>{formatRupee(total)}</p>
          {lastItem && (
            <p className="text-sm text-gray-400 mb-6 font-medium">
              {lastItem.sku.billingType === "weight" 
                ? `${lastItem.weight} kg × ₹${lastItem.sku.rate} / kg`
                : `${lastItem.quantity} units × ₹${lastItem.sku.rate} / unit`}
            </p>
          )}

          <div className="w-full h-px bg-gray-50 mb-6" />

          {/* Info Grid */}
          <div className="grid grid-cols-2 w-full gap-y-5">
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">PRODUCT</p>
              <p className="text-sm font-bold text-gray-800">{lastItem?.sku.name || "Tomato"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">WEIGHT</p>
              <p className="text-sm font-bold text-gray-800">
                {lastItem?.sku.billingType === "weight" ? `${lastItem.weight} kg` : `${lastItem.quantity} units`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">MARKET</p>
              <p className="text-sm font-bold text-gray-800">{market.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">STALL</p>
              <p className="text-sm font-bold text-gray-800">{market.stallNo}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">FARMER</p>
              <p className="text-sm font-bold text-gray-800">Rajesh Kumar</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">TIME</p>
              <p className="text-sm font-bold text-gray-800">05:15 pm</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-50 my-6" />

          {/* Customer Section */}
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">CUSTOMER</p>
              <p className="text-sm font-bold text-gray-800">
                {ctx.customerMobile ? `+91 ${ctx.customerMobile}` : "No number provided"}
              </p>
            </div>
            {ctx.customerMobile && (
              <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 size={12} strokeWidth={3} />
                <span className="text-[10px] font-bold">SMS Sent</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-3 px-5 mt-6">
        <button 
          onClick={handleResend}
          className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-100"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FDF2F7" }}>
            <MessageCircle size={18} color={PRIMARY} />
          </div>
          <span className="text-xs font-bold text-gray-500">Resend</span>
        </button>
        <button 
          className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-100"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#F5F3FF" }}>
            <Share2 size={18} color="#8B5CF6" />
          </div>
          <span className="text-xs font-bold text-gray-500">Share</span>
        </button>
        <button 
          className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-100"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#ECFDF5" }}>
            <Printer size={18} color="#10B981" />
          </div>
          <span className="text-xs font-bold text-gray-500">Print</span>
        </button>
      </div>

      {/* Primary Actions */}
      <div className="px-5 mt-6 pb-10 flex flex-col gap-3">
        <button 
          className="w-full py-4 rounded-2xl border-2 font-bold transition-colors"
          style={{ borderColor: PRIMARY, color: PRIMARY }}
          onClick={() => { ctx.setViewingBillId(null); ctx.goTo("sales-history"); }}
        >
          View Transaction Details
        </button>
        <button 
          onClick={handleNewBill}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
          style={{ background: PRIMARY }}
        >
          <Plus size={18} strokeWidth={3} />
          Start New Bill
        </button>
      </div>
    </div>
  );
}