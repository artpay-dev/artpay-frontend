// Main exports
export { default as AuctionCheckoutProvider } from "./hoc/AuctionCheckoutProvider.tsx";
export { default as AuctionCheckoutView } from "./components/AuctionCheckoutView.tsx";
export { default as AuctionThankYou } from "./components/AuctionThankYou.tsx";
export { default as AuctionCheckoutLayout } from "./layouts/AuctionCheckoutLayout.tsx";

// Context and hooks
export { useAuctionCheckout } from "./contexts/AuctionCheckoutContext.tsx";
export { useAuctionCheckoutData } from "./hooks/useAuctionCheckoutData.ts";
export { useAuctionCheckoutUtils } from "./hooks/useAuctionCheckoutUtils.ts";
export { useAuctionCheckoutHandlers } from "./hooks/useAuctionCheckoutHandlers.ts";

// Store
export { default as useAuctionCheckoutStore } from "./stores/auctionCheckoutStore.ts";

// Types
export type {
  GuestBillingData,
  AuctionCheckoutState,
  PaymentMethodOption,
} from "./types.ts";

// Constants
export {
  PAYMENT_METHODS,
  ORDER_STATUS,
  KLARNA_MAX_LIMIT,
  KLARNA_FEE_RATE,
} from "./utils/constants.ts";

// Validation
export {
  validateEmail,
  validateItalianPostcode,
  validateCodiceFiscale,
  validateGuestForm,
} from "./utils/validation.ts";