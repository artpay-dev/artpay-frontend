import { create } from 'zustand';
import type { GatewaySession, GatewayPaymentIntent, GatewayPaymentMethod, GatewayHeylightStatus } from './types';

interface GatewayPaymentState {
  session: GatewaySession | null;
  paymentMethod: GatewayPaymentMethod | null;
  paymentIntent: GatewayPaymentIntent | null;
  heylightStatus: GatewayHeylightStatus | null;
  loading: boolean;
  error: string | null;
  setSession: (session: GatewaySession | null) => void;
  setPaymentMethod: (method: GatewayPaymentMethod | null) => void;
  setPaymentIntent: (intent: GatewayPaymentIntent | null) => void;
  setHeylightStatus: (status: GatewayHeylightStatus | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useGatewayPaymentStore = create<GatewayPaymentState>((set) => ({
  session: null,
  paymentMethod: null,
  paymentIntent: null,
  heylightStatus: null,
  loading: false,
  error: null,
  setSession: (session) => set({ session }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPaymentIntent: (paymentIntent) => set({ paymentIntent }),
  setHeylightStatus: (heylightStatus) => set({ heylightStatus }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ session: null, paymentMethod: null, paymentIntent: null, heylightStatus: null, loading: false, error: null }),
}));

export default useGatewayPaymentStore;