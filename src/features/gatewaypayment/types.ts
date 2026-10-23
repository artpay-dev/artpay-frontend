export type GatewaySessionStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

export type GatewayPaymentMethod = 'card' | 'klarna' | 'scalapay' | 'heylight';

export type GatewayHeylightStatus = 'pending' | 'success' | 'awaiting_confirmation' | 'cancelled';

export type GatewaySession = {
  session_key: string;
  status: GatewaySessionStatus;
  amount: number;
  currency: string;
  order_ref: string;
  stripe_intent_id: string | null;
  created_at: string;
  expires_at: string;
  // Added by backend on request:
  success_url?: string;
  cancel_url?: string;
};

export type GatewayPaymentIntent = {
  client_secret: string;
};