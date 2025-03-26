import { create } from "zustand";
import { Order } from "../../types/order.ts";
import { Gallery } from "../../types/gallery.ts";
import { PaymentIntent } from "@stripe/stripe-js";

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

  setPaymentData: (data: Partial<PaymentState>) => void;
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

  setPaymentData: (data) => set((state) => ({ ...state, ...data })),
}));

export default usePaymentStore;
