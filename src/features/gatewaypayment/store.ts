import { create } from 'zustand';
import type { GatewaySession, GatewayPaymentIntent } from './types';

interface GatewayPaymentState {
  session: GatewaySession | null;
  paymentIntent: GatewayPaymentIntent | null;
  loading: boolean;
  error: string | null;
  setSession: (session: GatewaySession | null) => void;
  setPaymentIntent: (intent: GatewayPaymentIntent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useGatewayPaymentStore = create<GatewayPaymentState>((set) => ({
  session: null,
  paymentIntent: null,
  loading: false,
  error: null,
  setSession: (session) => set({ session }),
  setPaymentIntent: (paymentIntent) => set({ paymentIntent }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ session: null, paymentIntent: null, loading: false, error: null }),
}));

export default useGatewayPaymentStore;