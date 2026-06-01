import {
  ArrowLeft, Trash2, Scale, Hash, AlertTriangle,
  Plus, ChevronRight, ShoppingCart, Zap, Pencil
} from "lucide-react";
import { BillingCtx, formatRupee, cartTotal, pricingLabel } from "./types";
import {
  PRIMARY, PRIMARY_TINT,
  SUCCESS, SUCCESS_TINT,
  WARNING, WARNING_TINT, WARNING_STRONG,
  DANGER, DANGER_TINT,
  INFO, INFO_TINT,
  SURFACE_MUTED, BORDER,
  CARD_SHADOW, ACCENT_SHADOW,
} from "./tokens";
import { CheckoutStepper } from "./CheckoutStepper";

interface Props { ctx: BillingCtx }

const CELL_BG     = SURFACE_MUTED;
const CELL_BORDER = BORDER;

export function CartReviewScreen({ ctx }: Props) {
  const total = cartTotal(ctx.cart);
  const weightItems = ctx.cart.filter((i) => i.sku.billingType === "weight");
  const countItems = ctx.cart.filter((i) => i.sku.billingType === "count");
  const hasManualCorrections = ctx.cart.some((i) => i.manualCorrection);
  const aiCapturedCount = ctx.cart.filter((i) => i.imageCapture).length;

  if (ctx.cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 72, height: 72, background: CELL_BG }}
        >
          <ShoppingCart size={32} color={BORDER} />
        </div>
        <div className="text-center">
          <p className="text-gray-700 text-base font-semibold mb-1">Cart is empty</p>
          <p className="text-gray-400 text-sm">Add products to build your bill</p>
        </div>
        <button
          onClick={() => ctx.goTo("new-bill")}
          className="px-6 py-3 rounded-xl text-white font-semibold"
          style={{ background: PRIMARY }}
        >
          Add Products
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("new-bill")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Cart Review</h2>
          <p className="text-xs text-gray-400">{ctx.selectedMarket?.name}</p>
        </div>
        <button
          onClick={() => ctx.goTo("new-bill")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: PRIMARY_TINT, color: PRIMARY }}
        >
          <Plus size={13} />
          Add More
        </button>
      </div>

      {/* Checkout Progress */}
      <CheckoutStepper step={1} />

      {/* Cart Summary Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: CELL_BG, color: "#334155" }}
        >
          <ShoppingCart size={12} color="#64748B" />
          {ctx.cart.length} item{ctx.cart.length !== 1 ? "s" : ""}
        </span>
        {weightItems.length > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: INFO_TINT, color: INFO }}
          >
            <Scale size={11} />
            {weightItems.length} weight
          </span>
        )}
        {countItems.length > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: SUCCESS_TINT, color: SUCCESS }}
          >
            <Hash size={11} />
            {countItems.length} count
          </span>
        )}
        {aiCapturedCount > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: WARNING_TINT, color: WARNING }}
          >
            <Zap size={11} />
            {aiCapturedCount} AI-captured
          </span>
        )}
        {hasManualCorrections && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: WARNING_TINT, color: WARNING }}
          >
            <AlertTriangle size={11} />
            flagged
          </span>
        )}
      </div>

      {/* Manual Correction Warning */}
      {hasManualCorrections && (
        <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: WARNING_TINT }}>
          <AlertTriangle size={14} color={WARNING} className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: WARNING_STRONG }}>
            Some items have manual corrections and will be flagged for supervisor review.
          </p>
        </div>
      )}

      {/* Weight-based items */}
      {weightItems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Scale size={13} color={INFO} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontSize: 9, color: INFO }}>
              WEIGHT-BASED · {weightItems.length} ITEM{weightItems.length !== 1 ? "S" : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {weightItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-white rounded-2xl p-4"
                style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0 text-xl"
                    style={{ width: 44, height: 44, background: CELL_BG }}
                  >
                    {item.sku.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Name + badges */}
                    <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                      <p className="font-bold text-gray-900">{item.sku.name}</p>
                      {/* Source badge */}
                      {item.imageCapture ? (
                        <span
                          className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: WARNING_TINT, color: WARNING, fontSize: 9 }}
                        >
                          <Zap size={9} /> AI
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: CELL_BG, color: PRIMARY, fontSize: 9 }}
                        >
                          <Pencil size={9} /> Manual
                        </span>
                      )}
                      {item.manualCorrection && <AlertTriangle size={13} color={WARNING} />}
                    </div>
                    {/* Inner data cells */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "WEIGHT", value: `${item.weight} kg` },
                        { label: "RATE", value: `₹${item.sku.rate}/kg` },
                        { label: "LINE TOTAL", value: formatRupee(item.lineTotal), highlight: true },
                      ].map((f) => (
                        <div key={f.label} className="rounded-lg p-2" style={{ background: CELL_BG }}>
                          <p className="uppercase mb-0.5" style={{ fontSize: 8, color: "#9CA3AF", letterSpacing: "0.06em" }}>{f.label}</p>
                          <p className="text-sm font-bold" style={{ color: f.highlight ? PRIMARY : "#111827" }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                    {item.aiConfidence !== undefined && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        {item.imageCapture ? `AI confidence: ${item.aiConfidence}%` : "Manual weight entry"}
                        {item.correctedWeight && " · ⚠️ Weight corrected"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => ctx.removeFromCart(item.cartId)}
                    className="p-1.5 rounded-lg shrink-0"
                    style={{ background: DANGER_TINT }}
                  >
                    <Trash2 size={14} color={DANGER} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Count-based items */}
      {countItems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Hash size={13} color={SUCCESS} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontSize: 9, color: SUCCESS }}>
              COUNT-BASED · {countItems.length} ITEM{countItems.length !== 1 ? "S" : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {countItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-white rounded-2xl p-4"
                style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0 text-xl"
                    style={{ width: 44, height: 44, background: CELL_BG }}
                  >
                    {item.sku.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <p className="font-bold text-gray-900">{item.sku.name}</p>
                      <span
                        className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: CELL_BG, color: PRIMARY, fontSize: 9 }}
                      >
                        <Pencil size={9} /> Manual
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "QTY", value: `${item.quantity} ${item.sku.unit}` },
                        { label: "RATE", value: `₹${item.sku.rate}${pricingLabel(item.sku)}` },
                        { label: "LINE TOTAL", value: formatRupee(item.lineTotal), highlight: true },
                      ].map((f) => (
                        <div key={f.label} className="rounded-lg p-2" style={{ background: CELL_BG }}>
                          <p className="uppercase mb-0.5" style={{ fontSize: 8, color: "#9CA3AF", letterSpacing: "0.06em" }}>{f.label}</p>
                          <p className="text-sm font-bold" style={{ color: f.highlight ? PRIMARY : "#111827" }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => ctx.removeFromCart(item.cartId)}
                    className="p-1.5 rounded-lg shrink-0"
                    style={{ background: DANGER_TINT }}
                  >
                    <Trash2 size={14} color={DANGER} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals Summary */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: CARD_SHADOW, border: `1px solid ${CELL_BORDER}` }}>
        <div className="flex justify-between py-2" style={{ borderBottom: `1px dashed ${BORDER}` }}>
          <p className="text-sm text-gray-500">Subtotal ({ctx.cart.length} items)</p>
          <p className="text-sm font-semibold text-gray-800">{formatRupee(total)}</p>
        </div>
        <div className="flex justify-between pt-3">
          <p className="font-bold text-gray-900">Grand Total</p>
          <p className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupee(total)}</p>
        </div>
      </div>

      {/* Checkout Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white p-4 flex items-center gap-3"
        style={{ boxShadow: "0 -2px 16px rgba(0,0,0,0.08)" }}
      >
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-widest" style={{ fontSize: 9 }}>GRAND TOTAL</p>
          <p className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupee(total)}</p>
        </div>
        <button
          onClick={() => ctx.goTo("customer-mobile")}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold"
          style={{ background: PRIMARY, boxShadow: ACCENT_SHADOW }}
        >
          Proceed to Checkout
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}