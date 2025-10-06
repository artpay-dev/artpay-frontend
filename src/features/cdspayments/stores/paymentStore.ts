import { create } from "zustand";
import { Order } from "../../../types/order.ts";
import { Gallery } from "../../../types/gallery.ts";
import { PaymentIntent } from "@stripe/stripe-js";
import { UserProfile } from "../../../types/user.ts";

interface PaymentState {
  order: Order | null;
  vendor: Gallery | null;
  total: number;
  paymentStatus: Order["status"];
  paymentMethod: string | null;
  paymentIntent: PaymentIntent | null;
  readyToPay: boolean;
  loading: boolean;
  isError: boolean;
  receipt: boolean;
  orderNote: string;
  user: UserProfile | null;
  openDraw?: boolean;
  refreshTimestamp?: number;

  setPaymentData: (data: Partial<PaymentState>) => void;
  refreshOrders: () => void;
}

const usePaymentStore = create<PaymentState>((set) => ({
  order: null,
  vendor: null,
  total: 0,
  paymentStatus: "pending",
  paymentMethod: null,
  paymentIntent: null,
  readyToPay: false,
  loading: false,
  isError: false,
  receipt: false,
  orderNote: "",
  user: null,
  openDraw: false,
  refreshTimestamp: 0,

  setPaymentData: (data) => set((state) => ({ ...state, ...data })),
  refreshOrders: () => set({ refreshTimestamp: Date.now() }),
}));

export default usePaymentStore;
