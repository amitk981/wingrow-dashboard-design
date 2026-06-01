import {
  ArrowLeft, Trash2, Scale, Hash, AlertTriangle,
  Plus, ChevronRight, ShoppingCart
} from "lucide-react";
import { BillingCtx, PRIMARY, formatRupee, cartTotal, pricingLabel } from "./types";

interface Props { ctx: BillingCtx }

export function CartReviewScreen({ ctx }: Props) {
  const total = cartTotal(ctx.cart);
  const weightItems = ctx.cart.filter((i) => i.sku.billingType === "weight");
  const countItems = ctx.cart.filter((i) => i.sku.billingType === "count");
  const hasManualCorrections = ctx.cart.some((i) => i.manualCorrection);

  if (ctx.cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: "#F9FAFB" }}
        >
          <ShoppingCart size={28} color="#D1D5DB" />
        </div>
        <p className="text-gray-400 text-sm">Cart is empty</p>
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
          style={{ width: 38, height: 38, background: "#FDE8EF" }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Cart Review</h2>
          <p className="text-xs text-gray-400">{ctx.cart.length} item{ctx.cart.length !== 1 ? "s" : ""} · {ctx.selectedMarket?.name}</p>
        </div>
        <button
          onClick={() => ctx.goTo("new-bill")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#FDE8EF", color: PRIMARY }}
        >
          <Plus size={13} />
          Add More
        </button>
      </div>

      {/* Manual Correction Warning */}
      {hasManualCorrections && (
        <div
          className="rounded-xl p-3 flex items-start gap-2"
          style={{ background: "#FEF3C7" }}
        >
          <AlertTriangle size={14} color="#F59E0B" className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: "#92400E" }}>
            Some items have manual corrections and will be flagged for supervisor review.
          </p>
        </div>
      )}

      {/* Weight-based items */}
      {weightItems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Scale size={13} color="#3B82F6" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: 9, color: "#3B82F6" }}>
              WEIGHT-BASED ITEMS ({weightItems.length})
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {weightItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-white rounded-2xl p-4"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0 text-xl"
                    style={{ width: 42, height: 42, background: "#F9FAFB" }}
                  >
                    {item.sku.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-gray-900">{item.sku.name}</p>
                      {item.manualCorrection && (
                        <AlertTriangle size={13} color="#F59E0B" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {[
                        { label: "Weight", value: `${item.weight} kg` },
                        { label: "Rate", value: `₹${item.sku.rate}/kg` },
                        { label: "Line Total", value: formatRupee(item.lineTotal) },
                      ].map((f) => (
                        <div key={f.label}>
                          <p className="text-gray-400 uppercase" style={{ fontSize: 8, letterSpacing: "0.06em", marginBottom: 1 }}>{f.label}</p>
                          <p className="text-sm font-bold text-gray-800">{f.value}</p>
                        </div>
                      ))}
                    </div>
                    {item.aiConfidence !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.imageCapture ? `AI detected · ${item.aiConfidence}% confidence` : "Manual weight entry"}
                        {item.correctedWeight && " · Weight corrected"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => ctx.removeFromCart(item.cartId)}
                    className="p-1.5 rounded-lg shrink-0"
                    style={{ background: "#FEE2E2" }}
                  >
                    <Trash2 size={14} color="#EF4444" />
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
          <div className="flex items-center gap-1.5 mb-2">
            <Hash size={13} color="#10B981" />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontSize: 9, color: "#10B981" }}>
              COUNT-BASED ITEMS ({countItems.length})
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {countItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-white rounded-2xl p-4"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0 text-xl"
                    style={{ width: 42, height: 42, background: "#F9FAFB" }}
                  >
                    {item.sku.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 mb-0.5">{item.sku.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} {item.sku.unit}{(item.quantity || 0) > 1 ? "s" : ""} × ₹{item.sku.rate}{pricingLabel(item.sku)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: PRIMARY }}>{formatRupee(item.lineTotal)}</p>
                  </div>
                  <button
                    onClick={() => ctx.removeFromCart(item.cartId)}
                    className="p-1.5 rounded-lg shrink-0"
                    style={{ background: "#FEE2E2" }}
                  >
                    <Trash2 size={14} color="#EF4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals Summary */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div className="flex justify-between py-2 border-b border-gray-100">
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
          style={{ background: PRIMARY }}
        >
          Proceed to Checkout
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}