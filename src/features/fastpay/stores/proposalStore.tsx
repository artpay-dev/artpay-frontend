import { create } from "zustand";
import { Order } from "../../../types/order.ts";
import { Gallery } from "../../../types/gallery.ts";
import { PaymentIntent } from "@stripe/stripe-js";
import { UserProfile } from "../../../types/user.ts";

interface ProposalState {
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

  setPaymentData: (data: Partial<ProposalState>) => void;
}

const useProposalStore = create<ProposalState>((set) => ({
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

  setPaymentData: (data) => set((state) => ({ ...state, ...data })),
}));

export default useProposalStore;
