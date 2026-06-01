import { useState } from "react";
import { ArrowLeft, Search, Scale, Hash, ChevronRight, Zap } from "lucide-react";
import { BillingCtx, SKUS, SKU, PRIMARY, pricingLabel, Category } from "./types";

interface Props { ctx: BillingCtx }

const CATEGORIES: Category[] = ["Vegetables", "Fruits", "Herbs", "Others"];

export function ProductSelectScreen({ ctx }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const filtered = SKUS.filter((s) => {
    const matchSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleSelect = (sku: SKU) => {
    ctx.setSelectedSKU(sku);
    if (sku.billingType === "weight") {
      ctx.goTo("weight-capture");
    } else {
      ctx.goTo("count-quantity");
    }
  };

  return (
    <div className="flex flex-col gap-4">
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
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Select Product</h2>
          <p className="text-xs text-gray-400">Choose from configured SKUs</p>
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
          placeholder="Search products..."
          className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["All", ...CATEGORIES] as (Category | "All")[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{
              background: activeCategory === cat ? PRIMARY : "#fff",
              color: activeCategory === cat ? "#fff" : "#6B7280",
              border: `1px solid ${activeCategory === cat ? PRIMARY : "#E5E7EB"}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SKU List */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-gray-400 text-sm">No products found</p>
          </div>
        )}
        {filtered.map((sku) => (
          <button
            key={sku.id}
            onClick={() => handleSelect(sku)}
            className="bg-white rounded-2xl p-3.5 flex items-center gap-3 w-full text-left"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0 text-xl"
              style={{ width: 46, height: 46, background: "#FDE8EF" }}
            >
              {sku.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-900 text-base leading-tight">{sku.name}</p>
                {sku.imageSupported && (
                  <Zap size={12} color="#F59E0B" title="AI detection supported" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={
                    sku.billingType === "weight"
                      ? { background: "#DBEAFE", color: "#3B82F6" }
                      : { background: "#F0FDF4", color: "#10B981" }
                  }
                >
                  {sku.billingType === "weight" ? (
                    <><Scale size={10} /> Weight-Based</>
                  ) : (
                    <><Hash size={10} /> Count-Based</>
                  )}
                </span>
                <span className="text-xs text-gray-400">{sku.category}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-base" style={{ color: PRIMARY }}>₹{sku.rate}</p>
              <p className="text-xs text-gray-400">{pricingLabel(sku)}</p>
            </div>
            <ChevronRight size={16} color="#D1D5DB" />
          </button>
        ))}
      </div>
    </div>
  );
}