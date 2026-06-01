import { useState } from "react";
import { Screen, Market, SKU, CartItem, BillingCtx } from "./farmer-billing/types";
import { HomeScreen } from "./farmer-billing/HomeScreen";
import { MarketSelectScreen } from "./farmer-billing/MarketSelectScreen";
import { NewBillScreen } from "./farmer-billing/NewBillScreen";
import { ProductSelectScreen } from "./farmer-billing/ProductSelectScreen";
import { WeightCaptureScreen } from "./farmer-billing/WeightCaptureScreen";
import { CountQuantityScreen } from "./farmer-billing/CountQuantityScreen";
import { ImageAddScreen } from "./farmer-billing/ImageAddScreen";
import { CartReviewScreen } from "./farmer-billing/CartReviewScreen";
import { CustomerMobileScreen, BillConfirmScreen, BillSuccessScreen } from "./farmer-billing/CheckoutScreens";
import { SalesHistoryScreen, BillDetailScreen } from "./farmer-billing/SalesHistoryScreen";

export function FarmerBilling() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [customerMobile, setCustomerMobile] = useState("");
  const [completedBillNo, setCompletedBillNo] = useState("");
  const [viewingBillId, setViewingBillId] = useState<string | null>(null);

  const addToCart = (item: CartItem) => setCart((prev) => [...prev, item]);
  const removeFromCart = (cartId: string) =>
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  const clearCart = () => setCart([]);

  const ctx: BillingCtx = {
    screen,
    selectedMarket,
    cart,
    selectedSKU,
    customerMobile,
    completedBillNo,
    viewingBillId,
    goTo: setScreen,
    setSelectedMarket,
    addToCart,
    removeFromCart,
    clearCart,
    setSelectedSKU,
    setCustomerMobile,
    setCompletedBillNo,
    setViewingBillId,
  };

  const renderScreen = () => {
    switch (screen) {
      case "home":              return <HomeScreen ctx={ctx} />;
      case "market-select":    return <MarketSelectScreen ctx={ctx} />;
      case "new-bill":         return <NewBillScreen ctx={ctx} />;
      case "product-select":   return <ProductSelectScreen ctx={ctx} />;
      case "weight-capture":   return <WeightCaptureScreen ctx={ctx} />;
      case "count-quantity":   return <CountQuantityScreen ctx={ctx} />;
      case "image-add":        return <ImageAddScreen ctx={ctx} />;
      case "cart-review":      return <CartReviewScreen ctx={ctx} />;
      case "customer-mobile":  return <CustomerMobileScreen ctx={ctx} />;
      case "bill-confirm":     return <BillConfirmScreen ctx={ctx} />;
      case "bill-success":     return <BillSuccessScreen ctx={ctx} />;
      case "sales-history":    return <SalesHistoryScreen ctx={ctx} />;
      case "bill-detail":      return <BillDetailScreen ctx={ctx} />;
      default:                 return <HomeScreen ctx={ctx} />;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto">
      {renderScreen()}
    </div>
  );
}
