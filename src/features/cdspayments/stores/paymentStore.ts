import { create } from 'zustand';
import type { CdsOrderDetails, CdsPaymentIntent, PaymentMethod } from '../types';

interface CdsPaymentState {
  orderDetails: CdsOrderDetails | null;
  paymentMethod: PaymentMethod | null;
  paymentIntent: CdsPaymentIntent | null;
  loading: boolean;
  error: string | null;
  setOrderDetails: (order: CdsOrderDetails | null) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setPaymentIntent: (intent: CdsPaymentIntent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  refreshOrders: () => void;
}

const useCdsPaymentStore = create<CdsPaymentState>((set) => ({
  orderDetails: null,
  paymentMethod: null,
  paymentIntent: null,
  loading: false,
  error: null,
  setOrderDetails: (orderDetails) => set({ orderDetails }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPaymentIntent: (paymentIntent) => set({ paymentIntent }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ orderDetails: null, paymentMethod: null, paymentIntent: null, loading: false, error: null }),
  refreshOrders: () => {},
}));

export default useCdsPaymentStore;
