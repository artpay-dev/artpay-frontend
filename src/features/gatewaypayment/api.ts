import type { GatewaySession, GatewayPaymentIntent } from './types';

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

export async function createGatewayPaymentIntent(sessionKey: string): Promise<GatewayPaymentIntent> {
  const res = await fetch(
    `${baseUrl()}/wp-json/artpay/v1/gateway/sessions/${encodeURIComponent(sessionKey)}/payment-intent`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );
  return parseResponse<GatewayPaymentIntent>(res);
}