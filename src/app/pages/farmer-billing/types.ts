export { PRIMARY } from "./tokens";

// ─── Screen Navigation ────────────────────────────────────────────────────────
export type Screen =
  | "home"
  | "market-select"
  | "new-bill"
  | "product-select"
  | "weight-capture"
  | "count-quantity"
  | "image-add"
  | "cart-review"
  | "customer-mobile"
  | "bill-confirm"
  | "bill-success"
  | "sales-history"
  | "bill-detail";

// ─── Domain Types ─────────────────────────────────────────────────────────────
export interface Market {
  id: string;
  name: string;
  location: string;
  stallNo: string;
  timing: string;
  date: string;
  isActive: boolean;
  produceFocus: string;
}

export type PricingBasis =
  | "per_kg"
  | "per_bunch"
  | "per_piece"
  | "per_packet"
  | "per_dozen";
export type BillingType = "weight" | "count";
export type Category = "Vegetables" | "Fruits" | "Herbs" | "Others";

export interface SKU {
  id: string;
  name: string;
  category: Category;
  billingType: BillingType;
  pricingBasis: PricingBasis;
  rate: number;
  unit: string;
  imageSupported: boolean;
  emoji: string;
}

export interface CartItem {
  cartId: string;
  sku: SKU;
  quantity?: number;
  weight?: number;
  detectedWeight?: number;
  correctedWeight?: boolean;
  lineTotal: number;
  imageCapture?: boolean;
  manualCorrection?: boolean;
  aiConfidence?: number;
}

export interface HistoryBillItem {
  name: string;
  billingType: BillingType;
  weight?: number;
  quantity?: number;
  unit: string;
  rate: number;
  lineTotal: number;
  manualCorrection?: boolean;
  aiConfidence?: number;
}

export interface HistoryBill {
  id: string;
  billNo: string;
  marketName: string;
  stallNo: string;
  timestamp: string;
  items: HistoryBillItem[];
  grandTotal: number;
  customerMobile: string;
  receiptStatus: "sent" | "pending" | "failed";
  itemCount: number;
  hasException?: boolean;
}

// ─── Context / Props Passed to Screens ───────────────────────────────────────
export interface BillingCtx {
  screen: Screen;
  selectedMarket: Market | null;
  cart: CartItem[];
  selectedSKU: SKU | null;
  customerMobile: string;
  completedBillNo: string;
  viewingBillId: string | null;
  // actions
  goTo: (s: Screen) => void;
  setSelectedMarket: (m: Market) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  setSelectedSKU: (sku: SKU | null) => void;
  setCustomerMobile: (m: string) => void;
  setCompletedBillNo: (n: string) => void;
  setViewingBillId: (id: string | null) => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MARKETS: Market[] = [
  {
    id: "m1",
    name: "Vidya Vikas Market",
    location: "Nashik, Maharashtra · PIN 422010",
    stallNo: "A-12",
    timing: "6:00 AM – 12:00 PM",
    date: "Wed, Apr 22, 2026",
    isActive: true,
    produceFocus: "Vegetables & Herbs",
  },
  {
    id: "m2",
    name: "Gangapur Road Market",
    location: "Nashik, Maharashtra · PIN 422010",
    stallNo: "B-05",
    timing: "7:00 AM – 1:00 PM",
    date: "Wed, Apr 22, 2026",
    isActive: true,
    produceFocus: "Fruits & Vegetables",
  },
  {
    id: "m3",
    name: "Nashik Bhaji Mandai",
    location: "Nashik, Maharashtra · PIN 422001",
    stallNo: "D-08",
    timing: "5:30 AM – 11:00 AM",
    date: "Thu, Apr 23, 2026",
    isActive: false,
    produceFocus: "Mixed Produce",
  },
];

export const SKUS: SKU[] = [
  // Weight-based Vegetables
  { id: "s1", name: "Tomato", category: "Vegetables", billingType: "weight", pricingBasis: "per_kg", rate: 25, unit: "kg", imageSupported: true, emoji: "🍅" },
  { id: "s2", name: "Potato", category: "Vegetables", billingType: "weight", pricingBasis: "per_kg", rate: 18, unit: "kg", imageSupported: true, emoji: "🥔" },
  { id: "s3", name: "Onion", category: "Vegetables", billingType: "weight", pricingBasis: "per_kg", rate: 22, unit: "kg", imageSupported: true, emoji: "🧅" },
  { id: "s4", name: "Cabbage", category: "Vegetables", billingType: "weight", pricingBasis: "per_kg", rate: 15, unit: "kg", imageSupported: false, emoji: "🥬" },
  { id: "s5", name: "Carrot", category: "Vegetables", billingType: "weight", pricingBasis: "per_kg", rate: 30, unit: "kg", imageSupported: true, emoji: "🥕" },
  { id: "s6", name: "Brinjal", category: "Vegetables", billingType: "weight", pricingBasis: "per_kg", rate: 28, unit: "kg", imageSupported: false, emoji: "🍆" },
  // Weight-based Fruits
  { id: "s7", name: "Grapes", category: "Fruits", billingType: "weight", pricingBasis: "per_kg", rate: 80, unit: "kg", imageSupported: true, emoji: "🍇" },
  { id: "s8", name: "Apple", category: "Fruits", billingType: "weight", pricingBasis: "per_kg", rate: 120, unit: "kg", imageSupported: true, emoji: "🍎" },
  // Count-based Herbs
  { id: "s9", name: "Coriander Bunch", category: "Herbs", billingType: "count", pricingBasis: "per_bunch", rate: 10, unit: "bunch", imageSupported: false, emoji: "🌿" },
  { id: "s10", name: "Spinach Bunch", category: "Herbs", billingType: "count", pricingBasis: "per_bunch", rate: 8, unit: "bunch", imageSupported: false, emoji: "🥬" },
  { id: "s11", name: "Mint Bunch", category: "Herbs", billingType: "count", pricingBasis: "per_bunch", rate: 10, unit: "bunch", imageSupported: false, emoji: "🌱" },
  { id: "s12", name: "Curry Leaves Bunch", category: "Herbs", billingType: "count", pricingBasis: "per_bunch", rate: 5, unit: "bunch", imageSupported: false, emoji: "🍃" },
  // Count-based Others/Fruits
  { id: "s13", name: "Banana Dozen", category: "Fruits", billingType: "count", pricingBasis: "per_dozen", rate: 40, unit: "dozen", imageSupported: false, emoji: "🍌" },
  { id: "s14", name: "Coconut", category: "Others", billingType: "count", pricingBasis: "per_piece", rate: 25, unit: "piece", imageSupported: false, emoji: "🥥" },
  { id: "s15", name: "Lemon", category: "Others", billingType: "count", pricingBasis: "per_piece", rate: 5, unit: "piece", imageSupported: false, emoji: "🍋" },
];

export const HISTORY_BILLS: HistoryBill[] = [
  {
    id: "h1",
    billNo: "FB-2026-042",
    marketName: "Vidya Vikas Market",
    stallNo: "A-12",
    timestamp: "Today, 10:32 AM",
    items: [
      { name: "Tomato", billingType: "weight", weight: 2.5, unit: "kg", rate: 25, lineTotal: 62.5, aiConfidence: 94 },
      { name: "Coriander Bunch", billingType: "count", quantity: 3, unit: "bunch", rate: 10, lineTotal: 30 },
      { name: "Coconut", billingType: "count", quantity: 2, unit: "piece", rate: 25, lineTotal: 50 },
    ],
    grandTotal: 142.5,
    customerMobile: "9876543210",
    receiptStatus: "sent",
    itemCount: 3,
  },
  {
    id: "h2",
    billNo: "FB-2026-041",
    marketName: "Vidya Vikas Market",
    stallNo: "A-12",
    timestamp: "Today, 9:15 AM",
    items: [
      { name: "Potato", billingType: "weight", weight: 3, unit: "kg", rate: 18, lineTotal: 54, aiConfidence: 91 },
      { name: "Onion", billingType: "weight", weight: 2, unit: "kg", rate: 22, lineTotal: 44, aiConfidence: 88 },
      { name: "Banana Dozen", billingType: "count", quantity: 1, unit: "dozen", rate: 40, lineTotal: 40 },
    ],
    grandTotal: 138,
    customerMobile: "9812345678",
    receiptStatus: "sent",
    itemCount: 3,
  },
  {
    id: "h3",
    billNo: "FB-2026-040",
    marketName: "Vidya Vikas Market",
    stallNo: "A-12",
    timestamp: "Today, 8:45 AM",
    items: [
      { name: "Grapes", billingType: "weight", weight: 1.5, unit: "kg", rate: 80, lineTotal: 120, manualCorrection: true, aiConfidence: 62 },
      { name: "Spinach Bunch", billingType: "count", quantity: 2, unit: "bunch", rate: 8, lineTotal: 16 },
    ],
    grandTotal: 136,
    customerMobile: "9834567890",
    receiptStatus: "failed",
    itemCount: 2,
    hasException: true,
  },
  {
    id: "h4",
    billNo: "FB-2026-039",
    marketName: "Vidya Vikas Market",
    stallNo: "A-12",
    timestamp: "Yesterday, 11:20 AM",
    items: [
      { name: "Tomato", billingType: "weight", weight: 1, unit: "kg", rate: 25, lineTotal: 25 },
      { name: "Carrot", billingType: "weight", weight: 0.5, unit: "kg", rate: 30, lineTotal: 15 },
      { name: "Lemon", billingType: "count", quantity: 10, unit: "piece", rate: 5, lineTotal: 50 },
      { name: "Coriander Bunch", billingType: "count", quantity: 2, unit: "bunch", rate: 10, lineTotal: 20 },
    ],
    grandTotal: 110,
    customerMobile: "9823456789",
    receiptStatus: "sent",
    itemCount: 4,
  },
  {
    id: "h5",
    billNo: "FB-2026-038",
    marketName: "Gangapur Road Market",
    stallNo: "B-05",
    timestamp: "Yesterday, 9:50 AM",
    items: [
      { name: "Apple", billingType: "weight", weight: 2, unit: "kg", rate: 120, lineTotal: 240, aiConfidence: 96 },
      { name: "Banana Dozen", billingType: "count", quantity: 2, unit: "dozen", rate: 40, lineTotal: 80 },
    ],
    grandTotal: 320,
    customerMobile: "9856789012",
    receiptStatus: "sent",
    itemCount: 2,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function pricingLabel(sku: SKU) {
  const map: Record<PricingBasis, string> = {
    per_kg: "/ kg",
    per_bunch: "/ bunch",
    per_piece: "/ piece",
    per_packet: "/ packet",
    per_dozen: "/ dozen",
  };
  return map[sku.pricingBasis];
}

export function formatRupee(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
}

export function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.lineTotal, 0);
}