import { createContext, useContext } from "react";
import { DirectPurchaseState } from "../stores/directPurchaseStore.ts";

export interface DirectPurchaseContextType extends DirectPurchaseState {
  // Handlers
  handleRequireInvoice: (newVal: boolean) => Promise<void>;
  handleProfileDataSubmit: (formData: any, isBilling?: boolean) => Promise<void>;
  handleSelectShippingMethod: (
    selectedShippingMethod: any, 
    estimatedShippingCost: number, 
    onChangePaymentMethod: (method: string) => Promise<void>
  ) => Promise<void>;
  handlePurchase: (checkoutButtonRef: React.RefObject<HTMLButtonElement>) => Promise<void>;
  handleSubmitCheckout: () => void;
  onChangePaymentMethod: (payment: string) => Promise<void>;
  onCancelPaymentMethod: () => void;
  
  // Utils
  showError: (err?: unknown, text?: string) => Promise<void>;
  getCurrentShippingMethod: () => string;
  getEstimatedShippingCost: () => number;
  getThankYouPage: () => string;
  getCheckoutEnabled: () => boolean;
  getShippingPrice: () => number;
  getCardContentTitle: () => string;
}

export const DirectPurchaseContext = createContext<DirectPurchaseContextType | null>(null);

export const useDirectPurchase = () => {
  const context = useContext(DirectPurchaseContext);
  if (!context) {
    throw new Error("useDirectPurchase must be used within a DirectPurchaseProvider");
  }
  return context;
};