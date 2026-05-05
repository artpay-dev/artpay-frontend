import type { CdsOrderDetails, CdsPaymentIntent, PaymentMethod, BankTransferInstructions } from './types';

const baseUrl = () => import.meta.env.VITE_SERVER_URL || '';

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any).message || `HTTP ${res.status}`);
  return body as T;
}

export async function fetchOrderDetails(orderKey: string): Promise<CdsOrderDetails> {
  const res = await fetch(
    `${baseUrl()}/wp-json/wc/v3/stripe/cds-order-details?order_key=${encodeURIComponent(orderKey)}`
  );
  return parseResponse<CdsOrderDetails>(res);
}

export async function createPaymentIntent(
  orderKey: string,
  method: PaymentMethod
): Promise<CdsPaymentIntent> {
  const res = await fetch(`${baseUrl()}/wp-json/wc/v3/stripe/cds-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wc_order_key: orderKey,
      payment_method: method,
      add_klarna_fee: method === 'klarna',
    }),
  });
  return parseResponse<CdsPaymentIntent>(res);
}

export async function sendBankTransferEmail(
  order: CdsOrderDetails,
  instructions: BankTransferInstructions,
  amount: number
): Promise<void> {
  const iban = instructions.financial_addresses.find((fa) => fa.type === 'iban' && fa.iban)?.iban;
  const amountFormatted = (amount / 100).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const artpayLogoUrl = `${window.location.origin}/android-chrome-192x192.png`;

  const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8" /><title>Istruzioni bonifico</title>
<style>
  body { font-family: Arial, sans-serif; background: #f6f9fc; margin: 0; padding: 40px; color: #333; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden; }
  .header { background: #3E4EEC; padding: 24px 30px; display: flex; align-items: center; justify-content: space-between; }
  .header-logos { display: flex; align-items: center; gap: 16px; }
  .body { padding: 30px; }
  h2 { color: #181F5D; margin-top: 0; }
  .field { margin: 0 0 16px; }
  .label { font-size: 12px; color: #666F7A; margin-bottom: 4px; }
  .value { font-weight: bold; font-family: monospace; font-size: 15px; }
  .total { background: #f0f2ff; border-radius: 6px; padding: 12px 16px; margin-top: 24px; font-size: 18px; }
  .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="header-logos">
      <img src="${artpayLogoUrl}" alt="Artpay" width="40" height="40" style="border-radius:50%; display:block;" />
      ${order.vendor_logo_url ? `
      <span style="color:rgba(255,255,255,0.4); font-size:20px;">×</span>
      <div style="background:#fff; border-radius:6px; padding:4px 10px; display:inline-flex; align-items:center;">
        <img src="${order.vendor_logo_url}" alt="${order.vendor_name}" height="24" style="display:block; max-width:110px; object-fit:contain;" />
      </div>
      ` : ''}
    </div>
    <span style="color:rgba(255,255,255,0.7); font-size:12px;">Ordine N. ${order.order_id}</span>
  </div>

  <div class="body">
    <h2>Istruzioni per il bonifico</h2>
    <p>Completa il pagamento effettuando un bonifico con i dati seguenti. L'ordine verrà confermato automaticamente alla ricezione dei fondi.</p>

    ${iban ? `
    <div class="field"><div class="label">Intestatario</div><div class="value">${iban.account_holder_name}</div></div>
    <div class="field"><div class="label">IBAN</div><div class="value">${iban.iban}</div></div>
    ${iban.bic ? `<div class="field"><div class="label">BIC / SWIFT</div><div class="value">${iban.bic}</div></div>` : ''}
    ${iban.bank_name ? `<div class="field"><div class="label">Banca</div><div class="value">${iban.bank_name}</div></div>` : ''}
    ` : ''}

    ${instructions.reference ? `<div class="field"><div class="label">Causale (obbligatoria)</div><div class="value">${instructions.reference}</div></div>` : ''}

    <div class="total">Importo da versare: <strong>€ ${amountFormatted}</strong></div>

    ${instructions.hosted_instructions_url ? `<p style="margin-top:24px"><a href="${instructions.hosted_instructions_url}" style="color:#3E4EEC">Visualizza istruzioni complete</a></p>` : ''}

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
    <p style="color:#666F7A; font-size:13px">${order.description}<br/>Venditore: ${order.vendor_name}</p>
    <div class="footer">Artpay S.R.L. — notifica automatica</div>
  </div>
</div>
</body>
</html>`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': import.meta.env.VITE_BREVO_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Artpay', email: 'hello@artpay.art' },
      to: [{ email: order.customer_email }],
      subject: `Istruzioni per il bonifico — Ordine N. ${order.order_id}`,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message || `Brevo error ${res.status}`);
  }
}

export async function updatePaymentIntentFee(
  orderKey: string,
  addKlarnaFee: boolean
): Promise<CdsPaymentIntent> {
  const res = await fetch(`${baseUrl()}/wp-json/wc/v3/stripe/cds-payment-intent-fee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wc_order_key: orderKey, add_klarna_fee: addKlarnaFee }),
  });
  return parseResponse<CdsPaymentIntent>(res);
}
