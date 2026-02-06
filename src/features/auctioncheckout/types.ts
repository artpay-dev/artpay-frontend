import { Order } from "../../types/order.ts";
import { PaymentIntent } from "@stripe/stripe-js";
import { ArtworkCardProps } from "../../components/ArtworkCard.tsx";

/**
 * Flash order response from /api/v1/external-order endpoint
 */
export interface FlashOrderResponse {
  timestamp: string;
  email: string;
  status: string;
  payment_timestamp: string;
  id: string; // order_key (e.g., "wc_order_xxx")
  artpay_id: number; // WooCommerce order ID
  third_party_id: string;
  third_party_description: string;
  vendor_name: string;
  billing_address: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
  };
  auction_details: {
    base_total: string;
    platform_fee: string;
    items_count: number;
  };
}

/**
 * Guest billing data collected during checkout
 */
export interface GuestBillingData {
  email: string;
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  codice_fiscale: string;
}

/**
 * UI state subset
 */
export interface UIState {
  isReady: boolean;
  loading: boolean;
  isSaving: boolean;
  paymentMethod: string | null;
  checkoutReady: boolean;
  privacyChecked: boolean;
  formValid: boolean;
  isGuest: boolean;
  showCommissioni: boolean;
}

/**
 * Data state subset
 */
export interface DataState {
  order: Order | null;
  paymentIntent: PaymentIntent | null;
  artwork: ArtworkCardProps | null;
  guestData: GuestBillingData | null;
  orderKey: string | null;
}

/**
 * Complete auction checkout state
 */
export interface AuctionCheckoutState extends UIState, DataState {
  setAuctionCheckoutData: (data: Partial<AuctionCheckoutState>) => void;
  updateState: (updates: Partial<UIState>) => void;
  updatePageData: (updates: Partial<DataState>) => void;
  reset: () => void;
}

/**
 * Payment method option
 */
export interface PaymentMethodOption {
  value: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}