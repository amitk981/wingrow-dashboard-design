import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart, Hash } from "lucide-react";
import { BillingCtx } from "./types";
import {
  PRIMARY, PRIMARY_TINT,
  SUCCESS, SUCCESS_TINT,
  INFO, INFO_TINT,
  SURFACE_MUTED, BORDER,
  CARD_SHADOW, ACCENT_SHADOW,
} from "./tokens";

const CARD_SHADOW_LOCAL = CARD_SHADOW;
const CELL_BG    = SURFACE_MUTED;

interface Props { ctx: BillingCtx }

export function CountQuantityScreen({ ctx }: Props) {
  const sku = ctx.selectedSKU!;
  const [qty, setQty] = useState(1);

  const lineTotal = qty * sku.rate;

  const handleAddToCart = () => {
    const item: CartItem = {
      cartId: Date.now().toString(),
      sku,
      quantity: qty,
      lineTotal,
      imageCapture: false,
      manualCorrection: false,
    };
    ctx.addToCart(item);
    ctx.goTo("new-bill");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("product-select")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: PRIMARY_TINT }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Set Quantity</h2>
          <p className="text-xs text-gray-400">{sku.name}</p>
        </div>
        <div
          className="flex items-center justify-center rounded-xl text-2xl"
          style={{ width: 44, height: 44, background: CELL_BG }}
        >
          {sku.emoji}
        </div>
      </div>

      {/* Product Info Card */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: CARD_SHADOW_LOCAL }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-gray-900 text-xl leading-tight mb-1">{sku.name}</p>
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: SUCCESS_TINT, color: SUCCESS }}
              >
                <Hash size={10} /> Count-Based
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: CELL_BG, color: PRIMARY, fontSize: 11 }}
              >
                {sku.category}
              </span>
            </div>
          </div>
          <div
            className="rounded-xl p-2.5 text-right"
            style={{ background: CELL_BG }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5" style={{ fontSize: 9 }}>RATE</p>
            <p className="font-bold text-lg" style={{ color: PRIMARY }}>₹{sku.rate}</p>
            <p className="text-xs text-gray-400">{pricingLabel(sku)}</p>
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: CARD_SHADOW_LOCAL }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-4" style={{ fontSize: 10 }}>
          NUMBER OF {sku.unit.toUpperCase()}S
        </p>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 52, height: 52,
              background: qty === 1 ? CELL_BG : PRIMARY_TINT,
              color: qty === 1 ? "#E8A0B4" : PRIMARY,
              border: `1.5px solid ${qty === 1 ? BORDER : PRIMARY_TINT}`,
            }}
          >
            <Minus size={22} />
          </button>
          <div className="text-center" style={{ minWidth: 80 }}>
            <p className="font-bold text-5xl" style={{ color: PRIMARY }}>{qty}</p>
            <p className="text-xs text-gray-400 mt-1">{sku.unit}{qty > 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex items-center justify-center rounded-2xl"
            style={{ width: 52, height: 52, background: PRIMARY_TINT, color: PRIMARY }}
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Quick quantity chips */}
        <div className="flex gap-2 justify-center mt-4">
          {[2, 5, 10, 20].map((n) => (
            <button
              key={n}
              onClick={() => setQty(n)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: qty === n ? PRIMARY : CELL_BG,
                color: qty === n ? "white" : PRIMARY,
                border: `1.5px solid ${qty === n ? PRIMARY : BORDER}`,
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Line Total */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{ background: CELL_BG, border: `1.5px solid ${BORDER}` }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ fontSize: 9, color: "#9CA3AF" }}>LINE TOTAL</p>
          <p className="text-xs text-gray-500">
            {qty} {sku.unit}{qty > 1 ? "s" : ""} × ₹{sku.rate}{pricingLabel(sku)}
          </p>
        </div>
        <p className="text-3xl font-bold" style={{ color: PRIMARY }}>{formatRupee(lineTotal)}</p>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-md"
        style={{ background: PRIMARY, boxShadow: ACCENT_SHADOW }}
      >
        <ShoppingCart size={19} />
        Add to Cart — {formatRupee(lineTotal)}
      </button>
    </div>
  );
}