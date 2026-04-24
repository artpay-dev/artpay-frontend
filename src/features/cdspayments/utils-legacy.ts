import axios from "axios";
import { Order } from "../../types/order.ts";

export const reverseFee = (order: Order): number => {
  return Number(order?.total) / 1.04;
};

export const calculateKlarnaFee = (order: Order): number => {
  const baseValue = reverseFee(order);
  const withKlarnaFee = baseValue * 1.061;

  return withKlarnaFee - baseValue;
};

export const calculateArtPayFee = (order: Order): number => {
  const baseValue = reverseFee(order);
  const artpayFee = Number(order?.total) - baseValue;

  return artpayFee;
};

export const calculateTotalFee = (order: Order): number => {
  const orderTotal = Number(order?.total);
  const totalWithKlarnaFee = orderTotal * 1.061;

  return totalWithKlarnaFee - orderTotal;
};

export const clearLocalStorage = (order: Order) => {
  localStorage.removeItem(`payment-intents-cds-${order.order_key}`);
  localStorage.removeItem(`showCheckout`);
  localStorage.removeItem(`checkoutUrl`);
  localStorage.removeItem(`CdsOrder`);
};

type SendBrevoEmailParams = {
  toEmail: string;
  toName?: string;
  params: Record<string, any>;
};

export const sendBrevoEmail = async ({
  toEmail,
  toName = "Team Artpay",
  params,
}: SendBrevoEmailParams): Promise<void> => {
  const html = `
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <title>Nuova ricevuta caricata</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f6f9fc;
        margin: 0;
        padding: 40px;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
      h2 {
        color: #2c3e50;
      }
      p {
        margin: 0 0 10px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #999;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>📄 Nuova ricevuta caricata per l'ordine N. <strong>${params.order}</strong></h2>
      <p><strong>Utente:</strong> ${params.user}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><strong>Ordine:</strong> ${params.order}</p>
      <p><strong>Nome file:</strong> ${params.fileName}</p>
     

      <hr style="margin: 20px 0;" />

      <p>Controlla il pannello di <a href="https://app.uploadcare.com/" title="UploadCare">UploadCare</a> per visualizzare o gestire il file ricevuto.</p>

      <div class="footer">
        Artpay – Notifica automatica
      </div>
    </div>
  </body>
</html>`;

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Team artpay", email: "hello@artpay.art" },
        to: [{ email: toEmail, name: toName }],
        subject: "Nuova ricevuta bancaria caricata",
        htmlContent: html,
        params,
      },
      {
        headers: {
          "api-key": import.meta.env.VITE_BREVO_KEY!,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("Errore invio email Brevo:", error.response?.data || error.message);
    throw new Error("Errore invio email");
  }
};

export const sendPaymentNotification = async (vendor: any, order: any) => {
  if (!order.order_key) throw new Error("order_key is required");
  if (!vendor.url) throw new Error("Endpoint not specified");
  try {
    const orderStatus = await axios.get(`${import.meta.env.VITE_SERVER_URL}/wp-json/api/v1/external-order/${order.order_key}`);
    if (!orderStatus) throw new Error("Error getting order status");

    console.log(orderStatus);

    const response = await axios.post(vendor.url, {
      ...orderStatus
    });

    console.log(response);

  } catch (error: any) {
    console.error("Errore invio", error.response?.data || error.message);
  }
};
