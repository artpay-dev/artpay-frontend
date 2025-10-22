import { create } from "zustand";
import { Order, ShippingMethodOption } from "../../../types/order.ts";
import { UserProfile } from "../../../types/user.ts";
import { PaymentIntent } from "@stripe/stripe-js";
import { ArtworkCardProps } from "../../../components/ArtworkCard.tsx";
import { Gallery } from "../../../types/gallery.ts";

export interface DirectPurchaseState {
  // UI State
  isReady: boolean;
  paymentsReady: boolean;
  paymentMethod: string | null;
  isSaving: boolean;
  checkoutReady: boolean;
  noPendingOrder: boolean;
  shippingDataEditing: boolean;
  requireInvoice: boolean;
  privacyChecked: boolean;
  showCommissioni: boolean;
  subtotal: number;
  loading: boolean;
  isProcessingCheckout: boolean; // Flag per disabilitare il blocco durante il checkout
  // Data State
  userProfile?: UserProfile;
  availableShippingMethods: ShippingMethodOption[];
  pendingOrder?: Order;
  paymentIntent?: PaymentIntent;
  artworks: ArtworkCardProps[];
  galleries: Gallery[];
  orderMode: "standard" | "loan" | "redeem" | "onHold";

  // Actions
  setDirectPurchaseData: (data: Partial<DirectPurchaseState>) => void;
  updateState: (updates: Partial<Pick<DirectPurchaseState,
    'isReady' | 'paymentsReady' | 'paymentMethod' | 'isSaving' | 'checkoutReady' |
    'noPendingOrder' | 'shippingDataEditing' | 'requireInvoice' | 'privacyChecked' |
    'showCommissioni' | 'subtotal' | 'loading' | 'isProcessingCheckout'>>) => void;
  updatePageData: (updates: Partial<Pick<DirectPurchaseState,
    'userProfile' | 'availableShippingMethods' | 'pendingOrder' | 'paymentIntent' |
    'artworks' | 'galleries'>>) => void;
  reset: () => void;
}

const initialState = {
  // UI State
  isReady: false,
  paymentsReady: false,
  paymentMethod: null,
  isSaving: false,
  checkoutReady: false,
  noPendingOrder: false,
  shippingDataEditing: false,
  requireInvoice: false,
  privacyChecked: false,
  showCommissioni: true,
  subtotal: 0,
  loading: false,
  isProcessingCheckout: false,

  // Data State
  availableShippingMethods: [],
  artworks: [],
  galleries: [],
  orderMode: "standard" as const,
};

const useDirectPurchaseStore = create<DirectPurchaseState>((set) => ({
  ...initialState,

  setDirectPurchaseData: (data) => 
    set((state) => ({ ...state, ...data })),

  updateState: (updates) => 
    set((state) => ({ ...state, ...updates })),

  updatePageData: (updates) => 
    set((state) => ({ ...state, ...updates })),

  reset: () => 
    set({ ...initialState }),
}));

export default useDirectPurchaseStore;