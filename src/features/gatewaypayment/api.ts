import type { GatewaySession, GatewayPaymentIntent, GatewayPaymentMethod, GatewayHeylightSession } from './types';

const baseUrl = () => import.meta.env.VITE_SERVER_URL || '';

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any).message || `HTTP ${res.status}`);
  return body as T;
}

export async function fetchGatewaySession(sessionKey: string): Promise<GatewaySession> {
  const res = await fetch(
    `${baseUrl()}/wp-json/artpay/v1/gateway/sessions/${encodeURIComponent(sessionKey)}`
  );
  return parseResponse<GatewaySession>(res);
}

export type GatewayHeylightCreateParams = {
  success_url: string;
  failure_url: string;
  product_type: 'finanziamento' | 'dilazione';
  language?: string;
  allowed_terms?: number[];
  customer_details: {
    first_name: string;
    last_name: string;
    email_address: string;
    contact_number: string;
  };
};

export async function createGatewayHeylightSession(
  sessionKey: string,
  params: GatewayHeylightCreateParams
): Promise<GatewayHeylightSession> {
  const res = await fetch(
    `${baseUrl()}/wp-json/artpay/v1/gateway/sessions/${encodeURIComponent(sessionKey)}/heylight`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
  return parseResponse<GatewayHeylightSession>(res);
}

export async function createGatewayPaymentIntent(
  sessionKey: string,
  method: Exclude<GatewayPaymentMethod, 'heylight'>
): Promise<GatewayPaymentIntent> {
  const res = await fetch(
    `${baseUrl()}/wp-json/artpay/v1/gateway/sessions/${encodeURIComponent(sessionKey)}/payment-intent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_method: method }),
    }
  );
  return parseResponse<GatewayPaymentIntent>(res);
}