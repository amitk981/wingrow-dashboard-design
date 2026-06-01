import { useState } from "react";
import {
  ArrowLeft, Camera, CheckCircle2, X, Scale, Hash,
  Zap, AlertTriangle, Plus, ShoppingCart
} from "lucide-react";
import { BillingCtx, CartItem, PRIMARY, pricingLabel, formatRupee, SKUS } from "./types";

type DetectionState = "idle" | "uploading" | "processing" | "done";

interface DetectedItem {
  id: string;
  skuId: string;
  emoji: string;
  name: string;
  billingType: "weight" | "count";
  unit: string;
  rate: number;
  confidence: number;
  weight?: number;
  quantity?: number;
  confirmed: boolean;
  removed: boolean;
  needsInput: boolean;
}

const DETECTED_MOCK: DetectedItem[] = [
  {
    id: "d1", skuId: "s1", emoji: "🍅", name: "Tomato",
    billingType: "weight", unit: "kg", rate: 25, confidence: 94,
    weight: 1.8, confirmed: false, removed: false, needsInput: false,
  },
  {
    id: "d2", skuId: "s9", emoji: "🌿", name: "Coriander Bunch",
    billingType: "count", unit: "bunch", rate: 10, confidence: 88,
    quantity: 0, confirmed: false, removed: false, needsInput: true,
  },
  {
    id: "d3", skuId: "s3", emoji: "🧅", name: "Onion",
    billingType: "weight", unit: "kg", rate: 22, confidence: 71,
    weight: 0, confirmed: false, removed: false, needsInput: true,
  },
];

interface Props { ctx: BillingCtx }

export function ImageAddScreen({ ctx }: Props) {
  const [state, setState] = useState<DetectionState>("idle");
  const [imageCount, setImageCount] = useState(0);
  const [items, setItems] = useState<DetectedItem[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleUpload = () => {
    setImageCount((c) => Math.min(c + 1, 4));
    if (imageCount === 0) {
      setState("uploading");
      setTimeout(() => setState("processing"), 800);
      setTimeout(() => {
        setItems(DETECTED_MOCK.map((i) => ({ ...i })));
        setState("done");
      }, 2600);
    }
  };

  const toggleConfirm = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmed: !item.confirmed } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, removed: true } : item));
  };

  const confidenceColor = (c: number) =>
    c >= 85 ? "#10B981" : c >= 70 ? "#F59E0B" : "#EF4444";

  const visibleItems = items.filter((i) => !i.removed);
  const confirmedItems = visibleItems.filter((i) => i.confirmed);

  const handleAddAll = () => {
    confirmedItems.forEach((item) => {
      const val = parseFloat(inputValues[item.id] || "0");
      const quantity = item.billingType === "count" ? (item.quantity || val) : undefined;
      const weight = item.billingType === "weight" ? (item.weight || val) : undefined;
      const lineTotal =
        item.billingType === "weight"
          ? (weight || 0) * item.rate
          : (quantity || 0) * item.rate;
      const cartItem: CartItem = {
        cartId: Date.now().toString() + item.id,
        sku: SKUS.find((s) => s.id === item.skuId)!,
        weight,
        quantity,
        lineTotal,
        imageCapture: true,
        aiConfidence: item.confidence,
        manualCorrection: item.needsInput,
      };
      ctx.addToCart(cartItem);
    });
    ctx.goTo("new-bill");
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => ctx.goTo("new-bill")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: "#FDE8EF" }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Add via Image</h2>
          <p className="text-xs text-gray-400">AI-assisted product detection</p>
        </div>
      </div>

      {/* Upload Zone */}
      {(state === "idle" || state === "uploading") && (
        <button
          onClick={handleUpload}
          className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed"
          style={{ borderColor: imageCount > 0 ? PRIMARY : "#D1D5DB", background: imageCount > 0 ? "#FDE8EF" : "#F9FAFB" }}
        >
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{ width: 56, height: 56, background: imageCount > 0 ? PRIMARY : "#F9FAFB" }}
          >
            <Camera size={26} color={imageCount > 0 ? "white" : "#9CA3AF"} />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-700 text-base">
              {imageCount === 0 ? "Capture or Upload Image" : `${imageCount} image${imageCount > 1 ? "s" : ""} added · Add more`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {imageCount === 0
                ? "Take a photo of your products on the scale or bench"
                : "Each image can contain multiple products"}
            </p>
          </div>
        </button>
      )}

      {/* Image thumbnails (simulated) */}
      {imageCount > 0 && state !== "done" && (
        <div className="flex gap-2">
          {Array.from({ length: imageCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl flex items-center justify-center"
              style={{ width: 64, height: 64, background: "#1F2937" }}
            >
              <span className="text-2xl">{["🍅", "🌿", "🧅", "🥕"][i]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Processing */}
      {state === "processing" && (
        <div className="bg-white rounded-2xl p-6 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div
            className="mx-auto mb-4 rounded-full animate-spin"
            style={{ width: 40, height: 40, border: `3px solid ${PRIMARY}`, borderTopColor: "transparent" }}
          />
          <p className="font-bold text-gray-900 mb-1">Analysing Images...</p>
          <p className="text-xs text-gray-400">Detecting products and reading scale values</p>
        </div>
      )}

      {/* Detection Results */}
      {state === "done" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase" style={{ fontSize: 10 }}>
              DETECTED PRODUCTS ({visibleItems.length})
            </p>
            <div className="flex items-center gap-1">
              <Zap size={12} color="#F59E0B" />
              <span className="text-xs text-gray-500">AI Confidence shown</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4"
                style={{
                  boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                  borderLeft: item.confirmed ? `3px solid #10B981` : `3px solid #E5E7EB`,
                  opacity: item.removed ? 0.4 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0 text-xl"
                    style={{ width: 44, height: 44, background: "#F9FAFB" }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <button onClick={() => removeItem(item.id)}>
                        <X size={15} color="#9CA3AF" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={
                          item.billingType === "weight"
                            ? { background: "#DBEAFE", color: "#3B82F6" }
                            : { background: "#F0FDF4", color: "#10B981" }
                        }
                      >
                        {item.billingType === "weight" ? <><Scale size={10} /> Weight</> : <><Hash size={10} /> Count</>}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${confidenceColor(item.confidence)}20`,
                          color: confidenceColor(item.confidence),
                        }}
                      >
                        {item.confidence}% match
                      </span>
                    </div>

                    {/* Input fields for needsInput items */}
                    {item.needsInput && (
                      <div
                        className="rounded-xl p-3 mb-2"
                        style={{ background: "#FEF3C7" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={12} color="#F59E0B" />
                          <p className="text-xs" style={{ color: "#92400E" }}>
                            {item.billingType === "weight"
                              ? "Weight not detected — please enter manually"
                              : "Enter quantity manually"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder={item.billingType === "weight" ? "0.00 kg" : "Qty"}
                            value={inputValues[item.id] || ""}
                            onChange={(e) =>
                              setInputValues((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                            style={{ borderColor: "#E5E7EB" }}
                          />
                          <span className="text-xs text-gray-400">{item.unit}</span>
                        </div>
                      </div>
                    )}

                    {!item.needsInput && (
                      <p className="text-xs text-gray-500 mb-2">
                        {item.billingType === "weight"
                          ? `${item.weight} kg × ₹${item.rate}/kg = `
                          : `${item.quantity} ${item.unit} × ₹${item.rate} = `}
                        <strong style={{ color: PRIMARY }}>
                          {formatRupee(
                            item.billingType === "weight"
                              ? (item.weight || 0) * item.rate
                              : (item.quantity || 0) * item.rate
                          )}
                        </strong>
                      </p>
                    )}

                    <button
                      onClick={() => toggleConfirm(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{
                        background: item.confirmed ? "#D1FAE5" : PRIMARY,
                        color: item.confirmed ? "#10B981" : "white",
                      }}
                    >
                      <CheckCircle2 size={13} />
                      {item.confirmed ? "Confirmed ✓" : "Confirm & Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {confirmedItems.length > 0 && (
            <button
              onClick={handleAddAll}
              className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
              style={{ background: PRIMARY }}
            >
              <ShoppingCart size={18} />
              Add {confirmedItems.length} Item{confirmedItems.length > 1 ? "s" : ""} to Cart
            </button>
          )}
        </>
      )}

      {/* Info note */}
      {state === "idle" && (
        <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#F0FDF4" }}>
          <Zap size={14} color="#10B981" className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: "#065F46" }}>
            Our AI can detect multiple products from a single image. For weight-based products, ensure the weighing scale display is visible in the same frame.
          </p>
        </div>
      )}
    </div>
  );
}