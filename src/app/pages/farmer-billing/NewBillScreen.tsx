import { useState } from "react";
import {
  ArrowLeft, Plus, Camera, Trash2, Scale, Hash,
  ShoppingCart, MapPin, ChevronRight, AlertTriangle, RefreshCw
} from "lucide-react";
import { BillingCtx, PRIMARY, formatRupee, cartTotal, pricingLabel } from "./types";

interface Props { ctx: BillingCtx }

export function NewBillScreen({ ctx }: Props) {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const market = ctx.selectedMarket!;
  const total = cartTotal(ctx.cart);

  const handleAddManual = () => {
    setShowAddOptions(false);
    ctx.setSelectedSKU(null);
    ctx.goTo("product-select");
  };

  const handleAddImage = () => {
    setShowAddOptions(false);
    ctx.goTo("image-add");
  };

  return (
    <div className="flex flex-col gap-4 pb-32">
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
          <h2 className="font-bold text-gray-900 text-lg leading-tight">New Bill</h2>
          <p className="text-xs text-gray-400">Add products to cart</p>
        </div>
        {ctx.cart.length > 0 && (
          <button
            onClick={() => ctx.goTo("cart-review")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold"
            style={{ background: PRIMARY }}
          >
            <ShoppingCart size={13} />
            Review ({ctx.cart.length})
          </button>
        )}
      </div>

      {/* Active Market Context — with Change affordance */}
      <div
        className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
        style={{ background: "#FDE8EF" }}
      >
        <MapPin size={15} color={PRIMARY} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-tight truncate" style={{ color: PRIMARY }}>{market.name}</p>
          <p className="text-xs text-gray-500">Stall {market.stallNo} · {market.timing}</p>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
          style={{ background: "#10B981", fontSize: 9 }}
        >
          ACTIVE
        </span>
        <div className="w-px h-7 bg-pink-200 shrink-0" />
        <button
          onClick={() => ctx.goTo("market-select")}
          className="flex items-center gap-1 shrink-0 text-xs font-semibold py-1 px-2 rounded-lg"
          style={{ background: "rgba(232,49,102,0.12)", color: PRIMARY }}
        >
          <RefreshCw size={11} />
          Change
        </button>
      </div>

      {/* Add Product Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAddManual}
          className="rounded-2xl p-4 flex flex-col items-center gap-2 border-2"
          style={{ borderColor: PRIMARY, background: "#FDE8EF" }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 44, height: 44, background: PRIMARY }}
          >
            <Plus size={22} color="white" />
          </div>
          <span className="text-xs font-bold text-center leading-tight" style={{ color: PRIMARY }}>
            Add Manually
          </span>
          <span className="text-xs text-gray-400 text-center leading-tight">Select from SKU list</span>
        </button>

        <button
          onClick={handleAddImage}
          className="rounded-2xl p-4 flex flex-col items-center gap-2 border-2"
          style={{ borderColor: PRIMARY, background: "white" }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 44, height: 44, background: "#FDE8EF" }}
          >
            <Camera size={22} color={PRIMARY} />
          </div>
          <span className="text-xs font-bold text-center leading-tight" style={{ color: PRIMARY }}>
            Add via Image
          </span>
          <span className="text-xs text-gray-400 text-center leading-tight">AI-assisted detection</span>
        </button>
      </div>

      {/* Cart Items */}
      {ctx.cart.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center bg-white"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
        >
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-3"
            style={{ width: 56, height: 56, background: "#F9FAFB" }}
          >
            <ShoppingCart size={24} color="#D1D5DB" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Your cart is empty</p>
          <p className="text-gray-300 text-xs">Add products using the options above</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase" style={{ fontSize: 10 }}>
            CART ITEMS ({ctx.cart.length})
          </p>
          {ctx.cart.map((item) => (
            <div
              key={item.cartId}
              className="bg-white rounded-2xl p-3.5 flex items-center gap-3"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0 text-lg"
                style={{ width: 40, height: 40, background: "#FDE8EF" }}
              >
                {item.sku.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.sku.name}</p>
                  {item.manualCorrection && (
                    <AlertTriangle size={12} color="#F59E0B" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  {item.sku.billingType === "weight" ? (
                    <><Scale size={11} /><span>{item.weight} kg × ₹{item.sku.rate}/kg</span></>
                  ) : (
                    <><Hash size={11} /><span>{item.quantity} {item.sku.unit} × ₹{item.sku.rate}{pricingLabel(item.sku)}</span></>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm" style={{ color: PRIMARY }}>
                  {formatRupee(item.lineTotal)}
                </p>
                <button
                  onClick={() => ctx.removeFromCart(item.cartId)}
                  className="mt-1 p-1 rounded-lg"
                  style={{ background: "#FEE2E2" }}
                >
                  <Trash2 size={13} color="#EF4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Checkout Bar */}
      {ctx.cart.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white p-4 flex items-center gap-3"
          style={{ boxShadow: "0 -2px 16px rgba(0,0,0,0.08)" }}
        >
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest" style={{ fontSize: 9 }}>GRAND TOTAL</p>
            <p className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupee(total)}</p>
          </div>
          <button
            onClick={() => ctx.goTo("cart-review")}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold"
            style={{ background: PRIMARY }}
          >
            Review Cart
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
