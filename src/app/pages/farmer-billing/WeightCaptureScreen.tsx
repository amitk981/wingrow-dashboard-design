import { useState } from "react";
import {
  ArrowLeft, Camera, RefreshCw, CheckCircle2, AlertTriangle,
  Edit3, Zap, Scale, ShoppingCart
} from "lucide-react";
import { BillingCtx, CartItem, PRIMARY, formatRupee } from "./types";

type Stage = "capture" | "processing" | "verify" | "manual-entry";

interface ProcessStep {
  label: string;
  subLabel?: string;
  done: boolean;
  active: boolean;
  error?: boolean;
}

interface Props { ctx: BillingCtx }

export function WeightCaptureScreen({ ctx }: Props) {
  const sku = ctx.selectedSKU!;
  const [stage, setStage] = useState<Stage>("capture");
  const [useManual, setUseManual] = useState(false);
  const [manualWeight, setManualWeight] = useState("");
  const [detectedWeight, setDetectedWeight] = useState(0);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editWeight, setEditWeight] = useState("");
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { label: "Validating image quality", subLabel: "", done: false, active: false },
    { label: "Detecting product", subLabel: "", done: false, active: false },
    { label: "Reading weight from scale", subLabel: "", done: false, active: false },
    { label: "Fetching configured price", subLabel: "", done: false, active: false },
  ]);

  const simulateCapture = () => {
    if (useManual) {
      if (!manualWeight || isNaN(parseFloat(manualWeight))) return;
      const w = parseFloat(manualWeight);
      setDetectedWeight(w);
      setStage("verify");
      return;
    }
    setStage("processing");
    
    // Values to be "detected"
    const weightVal = parseFloat((Math.random() * 3 + 0.5).toFixed(2));
    const capturedData = [
      "High Clarity ✓",
      `${sku.name} detected`,
      `${weightVal} kg identified`,
      `₹${sku.rate}/kg applied`
    ];

    // Simulate processing steps
    const steps = [...processSteps];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setProcessSteps((prev) =>
          prev.map((st, idx) => ({
            ...st,
            done: idx < i,
            active: idx === i,
            subLabel: idx < i ? capturedData[idx] : ""
          }))
        );
      }, i * 800);
    });
    
    setTimeout(() => {
      setDetectedWeight(weightVal);
      setProcessSteps((prev) => prev.map((s, idx) => ({ ...s, done: true, active: false, subLabel: capturedData[idx] })));
      setTimeout(() => setStage("verify"), 600);
    }, processSteps.length * 800 + 400);
  };

  const lineTotal = detectedWeight * sku.rate;
  const finalWeight = editingWeight ? parseFloat(editWeight) || 0 : detectedWeight;
  const finalTotal = finalWeight * sku.rate;

  const handleAddToCart = () => {
    const isManualCorrected = editingWeight && parseFloat(editWeight) !== detectedWeight;
    const item: CartItem = {
      cartId: Date.now().toString(),
      sku,
      weight: finalWeight,
      detectedWeight,
      correctedWeight: isManualCorrected,
      lineTotal: finalTotal,
      imageCapture: !useManual,
      manualCorrection: isManualCorrected || useManual,
      aiConfidence: useManual ? undefined : Math.floor(Math.random() * 15) + 82,
    };
    ctx.addToCart(item);
    ctx.goTo("new-bill");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => stage === "verify" ? setStage("capture") : ctx.goTo("product-select")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: "#FDE8EF" }}
        >
          <ArrowLeft size={18} color={PRIMARY} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">
            {stage === "verify" ? "Verify Details" : stage === "processing" ? "Processing..." : "Capture Weight"}
          </h2>
          <p className="text-xs text-gray-400">{sku.name}</p>
        </div>
        <div
          className="flex items-center justify-center rounded-xl text-xl"
          style={{ width: 38, height: 38, background: "#F9FAFB" }}
        >
          {sku.emoji}
        </div>
      </div>

      {/* Product Info */}
      <div
        className="rounded-xl p-3 flex items-center justify-between"
        style={{ background: "#F9FAFB" }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5" style={{ fontSize: 9 }}>SELECTED PRODUCT</p>
          <p className="font-bold text-gray-900">{sku.name}</p>
          <p className="text-xs text-gray-400">{sku.category}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5" style={{ fontSize: 9 }}>RATE</p>
          <p className="font-bold" style={{ color: PRIMARY }}>₹{sku.rate}/kg</p>
        </div>
      </div>

      {/* ── CAPTURE STAGE ── */}
      {stage === "capture" && (
        <>
          {/* Method Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUseManual(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: !useManual ? PRIMARY : "#F9FAFB",
                color: !useManual ? "white" : "#6B7280",
              }}
            >
              <Camera size={16} />
              Use Camera
            </button>
            <button
              onClick={() => setUseManual(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: useManual ? PRIMARY : "#F9FAFB",
                color: useManual ? "white" : "#6B7280",
              }}
            >
              <Edit3 size={16} />
              Enter Manually
            </button>
          </div>

          {!useManual ? (
            <>
              {/* Camera Viewfinder Simulation */}
              <div
                className="relative rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ height: 240, background: "#111827" }}
              >
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                {/* Guide frame */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: 200,
                    height: 160,
                    border: "2px solid rgba(255,255,255,0.6)",
                    borderRadius: 12,
                  }}
                >
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white rounded-br-lg" />
                  <p className="text-white text-xs text-center opacity-70 px-4">
                    Place product & scale display within frame
                  </p>
                </div>
                {/* Scale icon hint */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black bg-opacity-50 rounded-lg px-2 py-1">
                  <Scale size={13} color="white" />
                  <span className="text-white text-xs">Scale display must be visible</span>
                </div>
                {sku.imageSupported && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black bg-opacity-50 rounded-lg px-2 py-1">
                    <Zap size={12} color="#F59E0B" />
                    <span className="text-yellow-300 text-xs">AI Ready</span>
                  </div>
                )}
              </div>
              {/* Capture Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={simulateCapture}
                  className="flex items-center justify-center rounded-full shadow-lg"
                  style={{ width: 68, height: 68, background: PRIMARY }}
                >
                  <Camera size={28} color="white" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400">Tap to capture image of product on scale</p>
            </>
          ) : (
            <>
              {/* Manual Weight Entry */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2" style={{ fontSize: 10 }}>
                  ENTER WEIGHT MANUALLY
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 text-3xl font-bold text-center outline-none border-b-2 pb-2"
                    style={{ borderColor: manualWeight ? PRIMARY : "#E5E7EB", color: PRIMARY }}
                    step="0.01"
                    min="0"
                  />
                  <span className="text-gray-400 font-semibold text-lg">kg</span>
                </div>
                {manualWeight && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Line Total: <strong style={{ color: PRIMARY }}>
                      {formatRupee(parseFloat(manualWeight) * sku.rate)}
                    </strong>
                  </p>
                )}
                <div
                  className="mt-3 p-2 rounded-lg flex items-center gap-2"
                  style={{ background: "#FEF3C7" }}
                >
                  <AlertTriangle size={13} color="#F59E0B" />
                  <p className="text-xs" style={{ color: "#92400E" }}>
                    Manual entry will be flagged for supervisor review
                  </p>
                </div>
              </div>
              <button
                onClick={simulateCapture}
                disabled={!manualWeight || isNaN(parseFloat(manualWeight))}
                className="w-full py-4 rounded-2xl text-white font-bold"
                style={{
                  background: manualWeight && !isNaN(parseFloat(manualWeight)) ? PRIMARY : "#D1D5DB",
                }}
              >
                Continue
              </button>
            </>
          )}
        </>
      )}

      {/* ── PROCESSING STAGE ── */}
      {stage === "processing" && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <p className="text-sm font-bold text-gray-900 mb-4 text-center">Analysing Image...</p>
          <div className="flex flex-col gap-3">
            {processSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 28, height: 28, background: step.done ? "#D1FAE5" : step.active ? "#FDE8EF" : "#F9FAFB" }}
                >
                  {step.done ? (
                    <CheckCircle2 size={16} color="#10B981" />
                  ) : step.active ? (
                    <div
                      className="rounded-full animate-spin"
                      style={{ width: 14, height: 14, border: `2px solid ${PRIMARY}`, borderTopColor: "transparent" }}
                    />
                  ) : (
                    <div
                      className="rounded-full"
                      style={{ width: 8, height: 8, background: "#D1D5DB" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm"
                    style={{
                      color: step.done ? "#10B981" : step.active ? PRIMARY : "#9CA3AF",
                      fontWeight: step.active ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </p>
                  {step.done && step.subLabel && (
                    <p className="text-[11px] font-bold text-green-600 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-300">
                      {step.subLabel}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VERIFY STAGE ── */}
      {stage === "verify" && (
        <>
          {/* Image Preview */}
          {!useManual && (
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ height: 120, background: "#1F2937" }}
            >
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-white text-3xl">{sku.emoji}</p>
                  <p className="text-white text-xs opacity-60 mt-1">Product Detected</p>
                </div>
                <div className="text-center">
                  <div
                    className="px-3 py-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    <p className="text-white font-bold text-xl">{detectedWeight}kg</p>
                  </div>
                  <p className="text-white text-xs opacity-60 mt-1">Weight Read</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black bg-opacity-50 rounded-lg px-2 py-1">
                <Zap size={11} color="#10B981" />
                <span className="text-green-300 text-xs">AI Detected</span>
              </div>
            </div>
          )}

          {/* Detected Values */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <div className="grid grid-cols-2 gap-4">
              {/* Product */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1" style={{ fontSize: 9 }}>PRODUCT</p>
                <div
                  className="rounded-xl px-3 py-2 flex items-center justify-between"
                  style={{ background: "#F9FAFB" }}
                >
                  <p className="font-bold text-gray-900 text-sm">{sku.name}</p>
                  {!useManual && <CheckCircle2 size={14} color="#10B981" />}
                </div>
              </div>
              {/* Weight */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1" style={{ fontSize: 9 }}>
                  WEIGHT {useManual ? "(MANUAL)" : "(DETECTED)"}
                </p>
                {!editingWeight ? (
                  <div
                    className="rounded-xl px-3 py-2 flex items-center justify-between"
                    style={{ background: "#F9FAFB" }}
                  >
                    <p className="font-bold text-gray-900 text-sm">{detectedWeight} kg</p>
                    <button onClick={() => { setEditingWeight(true); setEditWeight(String(detectedWeight)); }}>
                      <Edit3 size={14} color={PRIMARY} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded-xl px-3 py-2 border-2"
                    style={{ borderColor: PRIMARY }}
                  >
                    <input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-full font-bold text-sm outline-none bg-transparent"
                      style={{ color: PRIMARY }}
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </div>

            {editingWeight && (
              <div
                className="mt-2 p-2 rounded-lg flex items-center gap-2"
                style={{ background: "#FEF3C7" }}
              >
                <AlertTriangle size={13} color="#F59E0B" />
                <p className="text-xs" style={{ color: "#92400E" }}>Weight correction flagged for review</p>
              </div>
            )}

            {/* Line Total */}
            <div
              className="mt-4 rounded-xl p-3 flex items-center justify-between"
              style={{ background: "#FDE8EF" }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ fontSize: 9, color: PRIMARY }}>LINE TOTAL</p>
                <p className="text-xs text-gray-400">{finalWeight} kg × ₹{sku.rate}/kg</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: PRIMARY }}>
                {formatRupee(finalTotal)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!useManual && (
              <button
                onClick={() => setStage("capture")}
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: "#FDE8EF", color: PRIMARY }}
              >
                <RefreshCw size={15} />
                Retake
              </button>
            )}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: PRIMARY }}
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}