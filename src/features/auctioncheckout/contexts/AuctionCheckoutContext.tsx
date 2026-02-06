import { createContext, useContext } from "react";
import type { AuctionCheckoutState, GuestBillingData } from "../types.ts";

/**
 * Context interface combining store state + hook methods
 */
interface AuctionCheckoutContextValue extends AuctionCheckoutState {
  // From useAuctionCheckoutData
  loadInitialData: () => Promise<void>;
  refreshOrder: () => Promise<void>;
  logError: (err?: unknown) => void;

  // From useAuctionCheckoutUtils
  showError: (err?: unknown, text?: string) => Promise<void>;
  validateGuestForm: (data: Partial<GuestBillingData>) => string | null;
  calculateKlarnaFee: (subtotal: number) => number;
  isKlarnaAvailable: (orderTotal: number) => boolean;
  onChangePaymentMethod: (method: string) => Promise<void>;
  onCancelPaymentMethod: () => Promise<void>;
  getThankYouUrl: (orderId: number) => string;

  // From useAuctionCheckoutHandlers
  handleGuestFormSubmit: (formData: GuestBillingData) => Promise<void>;
  handlePaymentMethodSelect: (
    method: string,
    onChangePaymentMethod: (method: string) => Promise<void>
  ) => Promise<void>;
  handleStripeSubmit: (orderId: number) => Promise<void>;
  handleOrderCompletion: () => Promise<void>;
}

/**
 * Auction checkout context
 */
export const AuctionCheckoutContext = createContext<AuctionCheckoutContextValue | null>(null);

/**
 * Hook to use auction checkout context
 */
export const useAuctionCheckout = () => {
  const context = useContext(AuctionCheckoutContext);

  if (!context) {
    throw new Error("useAuctionCheckout must be used within AuctionCheckoutProvider");
  }

  return context;
};