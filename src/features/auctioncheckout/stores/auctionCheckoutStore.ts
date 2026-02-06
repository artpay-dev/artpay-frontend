import { create } from "zustand";
import type { AuctionCheckoutState, UIState, DataState } from "../types.ts";

/**
 * Initial state values
 */
const initialState: Omit<
  AuctionCheckoutState,
  "setAuctionCheckoutData" | "updateState" | "updatePageData" | "reset"
> = {
  // UI State
  isReady: false,
  loading: false,
  isSaving: false,
  paymentMethod: null,
  checkoutReady: false,
  privacyChecked: false,
  formValid: false,
  isGuest: true, // Default to guest
  showCommissioni: true,

  // Data State
  order: null,
  paymentIntent: null,
  artwork: null,
  guestData: null,
  orderKey: null,
};

/**
 * Auction checkout store
 * Manages state for guest/authenticated auction checkout flow
 */
const useAuctionCheckoutStore = create<AuctionCheckoutState>((set) => ({
  ...initialState,

  /**
   * Merge any partial state update
   */
  setAuctionCheckoutData: (data) =>
    set((state) => ({ ...state, ...data })),

  /**
   * Update only UI state properties
   */
  updateState: (updates) =>
    set((state) => ({ ...state, ...updates })),

  /**
   * Update only Data state properties
   */
  updatePageData: (updates) =>
    set((state) => ({ ...state, ...updates })),

  /**
   * Reset to initial state
   */
  reset: () =>
    set({ ...initialState }),
}));

export default useAuctionCheckoutStore;