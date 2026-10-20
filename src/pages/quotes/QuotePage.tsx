import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { Order } from "../../types/order";
import { quoteService, BankTransferInstructions } from "../../services/quoteService";
import CountdownTimer from "../../components/CountdownTimer";
import PaymentProviderCard from "../../features/cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import KlarnaIcon from "../../features/cdspayments/components/ui/paymentprovidercard/KlarnaIcon.tsx";
import ScalapayIcon from "../../features/cdspayments/components/ui/paymentprovidercard/ScalapayIcon.tsx";
import HeyLightIcon from "../../features/cdspayments/components/ui/paymentprovidercard/HeyLightIcon.tsx";
import SantanderIcon from "../../components/icons/SantanderIcon.tsx";
import { createPaymentIntent, createHeylightSession } from "../../features/cdspayments/api.ts";
import { heylightStorageKey } from "../../features/cdspayments/components/heylight/heylightStorage.ts";
import { ArrowRight } from "@mui/icons-material";

const KLARNA_FEE = 0.05;
const KLARNA_MAX = 2500;
const SCALAPAY_MIN = 40;
const SCALAPAY_MAX = 5000;
const HEYLIGHT_MAX = 5000;
const BANK_TRANSFER_MIN = 1500;
const BANK_TRANSFER_MAX = 30000;
const SANTANDER_MIN = 1500;

type PageStatus = "loading" | "loaded" | "accepted" | "rejected" | "error";

const Spinner = () => (
  <div className="size-4 border border-white border-b-transparent rounded-full animate-spin" />
);

const fmt = (n: number) => n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const QuotePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [vendorName, setVendorName] = useState<string>("");
  const [bankTransferInstructions, setBankTransferInstructions] = useState<BankTransferInstructions | null>(null);
  const [processingMethod, setProcessingMethod] = useState<string | null>(null);
  const [heylightForm, setHeylightForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [heylightProductType, setHeylightProductType] = useState<"dilazione" | "finanziamento">("dilazione");

  const orderId = searchParams.get("order_id");
  const orderKey = searchParams.get("key");
  const email = searchParams.get("email");
  const vendorId = searchParams.get("vendor_id");
  const heylightReturn = searchParams.get("heylight_return");

  const heylightFormValid =
    heylightForm.firstName.trim() !== "" &&
    heylightForm.lastName.trim() !== "" &&
    heylightForm.phone.trim() !== "";

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !orderKey || !email) {
        setErrorMessage("Parametri mancanti nella URL. Verifica il link ricevuto via email.");
        setStatus("error");
        return;
      }

      try {
        setStatus("loading");
        const orderData = await quoteService.getQuoteOrder(orderKey, email);

        if (orderData?.status !== "quote") {
          setErrorMessage(
            `Questa offerta non è più disponibile. Lo stato attuale dell'ordine è: ${orderData.status}`
          );
          setStatus("error");
          return;
        }

        setOrder(orderData);
        setStatus("loaded");
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Impossibile recuperare i dati dell'offerta. Verifica il link ricevuto via email."
        );
        setStatus("error");
      }
    };

    // if returning from heylight, skip reloading order
    if (heylightReturn) {
      setStatus("loaded");
      return;
    }

    loadOrder();
  }, [orderId, orderKey, email, heylightReturn]);

  useEffect(() => {
    const loadVendor = async () => {
      if (!vendorId) return;
      try {
        const vendorData = await quoteService.getVendor(vendorId);
        setVendorName(vendorData?.shop_name || vendorData?.display_name || "");
      } catch {}
    };
    loadVendor();
  }, [vendorId]);

  const redirectToCheckout = (clientSecret: string) => {
    const params = new URLSearchParams({
      payment: "stripe",
      order_id: orderId ?? "",
      order_key: orderKey ?? "",
      client_secret: clientSecret,
      ...(vendorId ? { vendor_id: vendorId } : {}),
    });
    navigate(`/checkout/payment?${params.toString()}`);
  };

  const handleAccept = async (method: "card" | "klarna" | "bank_transfer") => {
    if (!orderKey || !email) return;
    setProcessingMethod(method);
    try {
      const response = await quoteService.acceptQuote({
        order_key: orderKey,
        email,
        payment_method: method,
        add_klarna_fee: method === "klarna",
      });

      if (method === "bank_transfer" && response.payment_intent?.bank_transfer_instructions) {
        const instructions = response.payment_intent.bank_transfer_instructions;
        setBankTransferInstructions(instructions);
        sendBankTransferEmail(instructions);
        setStatus("accepted");
        return;
      }

      if (response.payment_intent?.client_secret) {
        redirectToCheckout(response.payment_intent.client_secret);
        return;
      }

      setStatus("accepted");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Si è verificato un errore. Riprova."
      );
      setStatus("error");
    } finally {
      setProcessingMethod(null);
    }
  };

  const handleAcceptScalapay = async () => {
    if (!orderKey || !email) return;
    setProcessingMethod("scalapay");
    try {
      await quoteService.acceptQuote({ order_key: orderKey, email });
      const intent = await createPaymentIntent(orderKey, "scalapay");
      if (intent.client_secret) {
        redirectToCheckout(intent.client_secret);
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Errore Scalapay. Riprova.");
      setStatus("error");
    } finally {
      setProcessingMethod(null);
    }
  };

  const handleAcceptHeylight = async () => {
    if (!orderKey || !email || !order) return;
    setProcessingMethod("heylight");
    try {
      await quoteService.acceptQuote({ order_key: orderKey, email });
      const pageBase = `${window.location.origin}${window.location.pathname}`;
      const returnBase = `${pageBase}?order_id=${encodeURIComponent(orderId ?? "")}&key=${encodeURIComponent(orderKey)}&email=${encodeURIComponent(email)}${vendorId ? `&vendor_id=${vendorId}` : ""}`;
      const session = await createHeylightSession({
        wc_order_id: order.id,
        success_url: `${returnBase}&heylight_return=success`,
        failure_url: `${returnBase}&heylight_return=failed`,
        product_type: heylightProductType,
        language: "it",
        allowed_terms: heylightProductType === "dilazione" ? [3, 6, 12, 24] : [12, 24, 36],
        customer_details: {
          first_name: heylightForm.firstName.trim(),
          last_name: heylightForm.lastName.trim(),
          email_address: email,
          contact_number: heylightForm.phone.trim(),
        },
      });
      localStorage.setItem(heylightStorageKey(orderKey), session.application_uuid);
      window.location.href = session.redirect_url;
    } catch (error: any) {
      setErrorMessage(error?.message || "Errore HeyLight. Riprova.");
      setProcessingMethod(null);
      setStatus("error");
    }
  };

  const handleReject = async () => {
    if (!orderKey || !email) return;
    setProcessingMethod("reject");
    try {
      await quoteService.rejectQuote({ order_key: orderKey, email });
      setStatus("rejected");
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Errore nel rifiuto. Riprova.");
      setStatus("error");
    } finally {
      setProcessingMethod(null);
    }
  };

  const sendBankTransferEmail = async (instructions: BankTransferInstructions) => {
    if (!email || !order) return;
    const ibanInfo = instructions.financial_addresses?.[0]?.iban;
    const amount = (instructions.amount_remaining / 100).toFixed(2);
    const recipientName = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim();

    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/wp-json/api/v1/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          to_name: recipientName || email,
          subject: "Istruzioni per il bonifico – artpay",
          sender_name: "artpay",
          sender_email: "noreply@artpay.art",
          html_content: `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:520px;width:100%"><tr><td style="background:#3E4EEC;padding:32px 40px"><div style="color:#ffffff;font-size:22px;font-weight:300">artpay</div></td></tr><tr><td style="padding:40px"><h1 style="margin:0 0 16px;font-size:24px;font-weight:400;color:#111">Istruzioni per il pagamento</h1><p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.6">Ciao${recipientName ? ` <strong>${recipientName}</strong>` : ""},<br/>hai accettato l'offerta. Effettua il bonifico per completare l'acquisto.</p><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:12px;overflow:hidden">${[["Intestatario", ibanInfo?.account_holder_name], ["IBAN", ibanInfo?.iban], ["BIC / SWIFT", ibanInfo?.bic], ["Causale", instructions.reference], ["Importo", `<strong>${amount} ${instructions.currency.toUpperCase()}</strong>`]].map(([l, v], i, a) => `<tr style="background:${i % 2 === 0 ? "#fafafa" : "#fff"}"><td style="padding:14px 20px;font-size:13px;color:#888;width:42%;${i < a.length - 1 ? "border-bottom:1px solid #eee" : ""}">${l}</td><td style="padding:14px 20px;font-size:14px;color:#111;font-weight:600;${i < a.length - 1 ? "border-bottom:1px solid #eee" : ""}">${v}</td></tr>`).join("")}</table></td></tr></table></td></tr></table></body></html>`,
        }),
      });
    } catch {}
  };

  // HeyLight return states
  if (heylightReturn === "success") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.2739 41.9177H15.7841C16.311 41.9177 16.75 42.1004 17.1013 42.4656L21.0308 46.345C22.0846 47.4117 23.0761 47.945 24.0054 47.945C24.9347 47.945 25.9263 47.4117 26.9801 46.345L30.8876 42.4656C31.2535 42.1004 31.6999 41.9177 32.2267 41.9177H37.7369C39.2444 41.9177 40.3274 41.5889 40.9859 40.9313C41.6445 40.2739 41.9739 39.1926 41.9739 37.6875V32.1864C41.9739 31.6895 42.1494 31.251 42.5006 30.8712L46.4082 26.948C47.4766 25.8958 48.0071 24.9095 47.9998 23.989C47.9926 23.0685 47.4621 22.0749 46.4082 21.0082L42.5006 17.0849C42.1494 16.705 41.9739 16.274 41.9739 15.7918V10.2904C41.9739 8.78542 41.6445 7.70049 40.9859 7.03567C40.3274 6.37082 39.2444 6.0384 37.7369 6.0384H32.2267C31.6999 6.0384 31.2535 5.86306 30.8876 5.51239L26.9801 1.63294C25.9118 0.537057 24.9165 -0.00723334 23.9944 7.25754e-05C23.0724 0.00737848 22.0772 0.551668 21.0089 1.63294L17.1013 5.51239C16.75 5.86306 16.311 6.0384 15.7841 6.0384H10.2739C8.76649 6.0384 7.68349 6.36717 7.02491 7.02471C6.36633 7.68224 6.03704 8.77081 6.03704 10.2904V15.7918C6.03704 16.274 5.8541 16.705 5.48822 17.0849L1.60256 21.0082C0.534186 22.0749 0 23.0685 0 23.989C0 24.9095 0.534186 25.8958 1.60256 26.948L5.48822 30.8712C5.8541 31.251 6.03704 31.6895 6.03704 32.1864V37.6875C6.03704 39.1926 6.36633 40.2739 7.02491 40.9313C7.68349 41.5889 8.76649 41.9177 10.2739 41.9177ZM21.6674 34.4217C21.4772 34.4217 21.3199 34.3889 21.1955 34.3232C21.0711 34.2575 20.943 34.1443 20.8113 33.9834L14.2254 26.3341C14.0523 26.232 13.962 25.7643 13.962 25.6328C13.962 25.3991 14.0425 25.2055 14.2035 25.0519C14.3645 24.8986 14.5547 24.8219 14.7743 24.8219C14.9353 24.8219 15.0743 24.8511 15.1914 24.9096C15.3084 24.968 15.4255 25.0703 15.5426 25.2164L21.6235 32.3176L32.6657 15.1343C32.8853 14.8274 33.1341 14.674 33.4123 14.674C33.6171 14.674 33.8074 14.7507 33.983 14.9041C34.1587 15.0576 34.2465 15.2439 34.2465 15.463C34.2465 15.5653 34.2245 15.6712 34.1806 15.7808C34.1367 15.8904 34.0928 15.989 34.0489 16.0767L22.5017 33.9834C22.3846 34.1296 22.2565 34.2392 22.1175 34.3122C21.9784 34.3852 21.8284 34.4217 21.6674 34.4217Z" fill="#42B396"/>
        </svg>
        <p className="text-2xl text-center font-light">Pagamento completato con HeyLight!</p>
        <p className="text-secondary text-sm text-center">Riceverai una conferma via email. La tua opera è in arrivo.</p>
      </div>
    );
  }

  if (heylightReturn === "failed") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="#EC6F7B" strokeWidth="2" fill="none" />
          <path d="M15 15L33 33M33 15L15 33" stroke="#EC6F7B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="text-2xl text-center font-light">Pagamento HeyLight non completato</p>
        <p className="text-secondary text-sm text-center">Puoi riprovare con HeyLight o scegliere un altro metodo.</p>
        <a
          href={`${window.location.pathname}?order_id=${orderId}&key=${orderKey}&email=${email}${vendorId ? `&vendor_id=${vendorId}` : ""}`}
          className="text-primary underline text-sm">
          Torna all'offerta
        </a>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <CircularProgress size={40} />
        <p className="text-secondary text-sm">Caricamento offerta...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="#EC6F7B" strokeWidth="2" fill="none" />
          <path d="M15 15L33 33M33 15L15 33" stroke="#EC6F7B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="text-xl text-center font-light">Errore</p>
        <p className="text-secondary text-sm text-center">{errorMessage}</p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <path d="M24 14v14M24 32v2" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="text-2xl text-center font-light">Offerta rifiutata</p>
        <p className="text-secondary text-sm text-center">Hai rifiutato l'offerta. L'ordine è stato annullato.</p>
      </div>
    );
  }

  if (status === "accepted" && bankTransferInstructions) {
    const ibanInfo = bankTransferInstructions.financial_addresses?.[0]?.iban;
    const rows = ibanInfo
      ? [
          ["Intestatario", ibanInfo.account_holder_name],
          ["IBAN", ibanInfo.iban],
          ["BIC / SWIFT", ibanInfo.bic],
          ["Causale", bankTransferInstructions.reference],
          ["Importo", `${(bankTransferInstructions.amount_remaining / 100).toFixed(2)} ${bankTransferInstructions.currency.toUpperCase()}`],
        ]
      : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.2739 41.9177H15.7841C16.311 41.9177 16.75 42.1004 17.1013 42.4656L21.0308 46.345C22.0846 47.4117 23.0761 47.945 24.0054 47.945C24.9347 47.945 25.9263 47.4117 26.9801 46.345L30.8876 42.4656C31.2535 42.1004 31.6999 41.9177 32.2267 41.9177H37.7369C39.2444 41.9177 40.3274 41.5889 40.9859 40.9313C41.6445 40.2739 41.9739 39.1926 41.9739 37.6875V32.1864C41.9739 31.6895 42.1494 31.251 42.5006 30.8712L46.4082 26.948C47.4766 25.8958 48.0071 24.9095 47.9998 23.989C47.9926 23.0685 47.4621 22.0749 46.4082 21.0082L42.5006 17.0849C42.1494 16.705 41.9739 16.274 41.9739 15.7918V10.2904C41.9739 8.78542 41.6445 7.70049 40.9859 7.03567C40.3274 6.37082 39.2444 6.0384 37.7369 6.0384H32.2267C31.6999 6.0384 31.2535 5.86306 30.8876 5.51239L26.9801 1.63294C25.9118 0.537057 24.9165 -0.00723334 23.9944 7.25754e-05C23.0724 0.00737848 22.0772 0.551668 21.0089 1.63294L17.1013 5.51239C16.75 5.86306 16.311 6.0384 15.7841 6.0384H10.2739C8.76649 6.0384 7.68349 6.36717 7.02491 7.02471C6.36633 7.68224 6.03704 8.77081 6.03704 10.2904V15.7918C6.03704 16.274 5.8541 16.705 5.48822 17.0849L1.60256 21.0082C0.534186 22.0749 0 23.0685 0 23.989C0 24.9095 0.534186 25.8958 1.60256 26.948L5.48822 30.8712C5.8541 31.251 6.03704 31.6895 6.03704 32.1864V37.6875C6.03704 39.1926 6.36633 40.2739 7.02491 40.9313C7.68349 41.5889 8.76649 41.9177 10.2739 41.9177ZM21.6674 34.4217C21.4772 34.4217 21.3199 34.3889 21.1955 34.3232C21.0711 34.2575 20.943 34.1443 20.8113 33.9834L14.2254 26.3341C13.962 25.7643 13.962 25.6328 13.962 25.6328C13.962 25.3991 14.0425 25.2055 14.2035 25.0519C14.3645 24.8986 14.5547 24.8219 14.7743 24.8219C14.9353 24.8219 15.0743 24.8511 15.1914 24.9096C15.3084 24.968 15.4255 25.0703 15.5426 25.2164L21.6235 32.3176L32.6657 15.1343C32.8853 14.8274 33.1341 14.674 33.4123 14.674C33.6171 14.674 33.8074 14.7507 33.983 14.9041C34.1587 15.0576 34.2465 15.2439 34.2465 15.463C34.2465 15.5653 34.2245 15.6712 34.1806 15.7808C34.1367 15.8904 34.0928 15.989 34.0489 16.0767L22.5017 33.9834C22.3846 34.1296 22.2565 34.2392 22.1175 34.3122C21.9784 34.3852 21.8284 34.4217 21.6674 34.4217Z" fill="#42B396"/>
          </svg>
          <div>
            <p className="font-semibold text-tertiary">Offerta accettata</p>
            <p className="text-sm text-secondary">Ti abbiamo inviato le istruzioni anche via email.</p>
          </div>
        </div>
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <div className="bg-[#42B396] px-4 py-3">
            <p className="text-white text-sm font-medium">Dati per il bonifico</p>
          </div>
          <div className="divide-y divide-gray-100">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between items-start gap-4 px-4 py-3">
                <span className="text-sm text-secondary shrink-0">{label}</span>
                <span className="text-sm font-semibold text-right break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-secondary text-center">
          Il pagamento verrà confermato automaticamente non appena il bonifico sarà ricevuto.
        </p>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <CircularProgress size={32} />
        <p className="text-secondary text-sm">Reindirizzamento al pagamento...</p>
      </div>
    );
  }

  if (!order) return null;

  const expiryDateMeta = order.meta_data?.find((meta) => meta.key === "quote_expiry_date");
  const expiryDate = expiryDateMeta ? new Date(expiryDateMeta.value) : null;

  const mainItem = order.line_items?.[0];
  const imageUrl = typeof mainItem?.image === "string" ? mainItem.image : mainItem?.image?.src;
  const currencySymbol = order.currency_symbol || "€";

  const baseTotal = parseFloat(order.total || "0");
  const listPrice = Number(mainItem?.price) || baseTotal;
  const discountAmount = listPrice - baseTotal;
  const hasDiscount = discountAmount > 0.009;
  const discountPercent = hasDiscount ? ((discountAmount / listPrice) * 100).toFixed(0) : "0";

  const klarnaFee = baseTotal * KLARNA_FEE;
  const klarnaTotal = baseTotal + klarnaFee;
  const klarnaQuota = klarnaTotal / 3;

  const scalapayFee = baseTotal * KLARNA_FEE;
  const scalapayTotal = baseTotal + scalapayFee;
  const scalapayQuota = scalapayTotal / 3;

  const showKlarna = baseTotal <= KLARNA_MAX;
  const showScalapay = baseTotal >= SCALAPAY_MIN && baseTotal <= SCALAPAY_MAX;
  const showHeylight = false; // baseTotal <= HEYLIGHT_MAX;
  const showBankTransfer = baseTotal >= BANK_TRANSFER_MIN && baseTotal <= BANK_TRANSFER_MAX;
  const showSantander = baseTotal >= SANTANDER_MIN;

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div>
        <h1 className="text-3xl font-light text-gray-900">Offerta dedicata</h1>
        {vendorName && <p className="text-sm text-secondary mt-1">da {vendorName}</p>}
      </div>

      {/* Riepilogo ordine */}
      <div className="border border-gray-100 rounded-2xl p-4 space-y-4">
        <div className="flex items-start gap-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={mainItem?.name || "Artwork"}
              className="rounded-lg object-cover w-20 h-20 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-tertiary text-sm">Offerta N.{order.id}</p>
            <p className="text-base text-tertiary mt-0.5">{mainItem?.name || "Opera d'arte"}</p>
          </div>
        </div>

        {expiryDate && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-secondary mb-2">L'offerta scade tra:</p>
            <CountdownTimer expiryDate={expiryDate} />
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 space-y-2">
          {hasDiscount && (
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Prezzo di listino</span>
              <span className="text-tertiary">{currencySymbol} {fmt(listPrice)}</span>
            </div>
          )}
          {hasDiscount && (
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Sconto applicato</span>
              <span className="text-[#42B396] font-medium">−{discountPercent}% ({currencySymbol} {fmt(discountAmount)})</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span className="text-tertiary">{hasDiscount ? "Prezzo offerta" : "Prezzo"}</span>
            <span className="text-tertiary">{currencySymbol} {fmt(baseTotal)}</span>
          </div>
        </div>
      </div>

      {/* Metodi di pagamento */}
      <div className="border-t border-gray-200 pt-6">
        <p className="text-sm text-secondary mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M3.375 7C3.375 6.10254 4.10254 5.375 5 5.375H19C19.8975 5.375 20.625 6.10254 20.625 7V8.625H3.375V7ZM3.375 17V11.375H20.625V17C20.625 17.8975 19.8975 18.625 19 18.625H5C4.10254 18.625 3.375 17.8975 3.375 17ZM5 4.625C3.68832 4.625 2.625 5.68832 2.625 7V17C2.625 18.3117 3.68832 19.375 5 19.375H19C20.3117 19.375 21.375 18.3117 21.375 17V7C21.375 5.68832 20.3117 4.625 19 4.625H5Z" fill="#CDCFD3"/>
          </svg>
          Scegli come pagare
        </p>

        <ul className="flex flex-col space-y-4">
          {showScalapay && (
            <li>
              <PaymentProviderCard
                cardTitle="Scalapay"
                icon={<ScalapayIcon />}
                subtitle={`Paga in 3 rate senza interessi da € ${fmt(SCALAPAY_MIN)} a € ${fmt(SCALAPAY_MAX)}`}
                backgroundColor="bg-[#FEF3F4]"
                button={
                  <button
                    onClick={handleAcceptScalapay}
                    disabled={!!processingMethod}
                    className="artpay-button-style bg-black hover:bg-zinc-800 text-white disabled:opacity-65">
                    {processingMethod === "scalapay" ? <Spinner /> : `Accetta · prima rata € ${fmt(scalapayQuota)}`}
                  </button>
                }>
                <ul className="space-y-4 py-4 border-t border-zinc-300">
                  <li className="w-full flex justify-between">
                    Tre rate senza interessi da: <span>€ {fmt(scalapayQuota)}</span>
                  </li>
                  <li className="w-full flex justify-between">
                    Subtotale: <span>€ {fmt(baseTotal)}</span>
                  </li>
                  <li>
                    <div className="w-full flex justify-between">
                      Commissione Scalapay (5%): <span>€ {fmt(scalapayFee)}</span>
                    </div>
                    <p className="text-secondary text-xs">Inclusi costi del finanziamento</p>
                  </li>
                  <li className="w-full flex justify-between">
                    <strong>Totale:</strong> <strong>€ {fmt(scalapayTotal)}</strong>
                  </li>
                </ul>
              </PaymentProviderCard>
            </li>
          )}

          {showKlarna && (
            <li>
              <PaymentProviderCard
                cardTitle="Klarna"
                icon={<KlarnaIcon />}
                subtitle={`Paga in 3 rate fino a € ${fmt(KLARNA_MAX)}`}
                backgroundColor="bg-[#FFE9EE]"
                button={
                  <button
                    onClick={() => handleAccept("klarna")}
                    disabled={!!processingMethod}
                    className="artpay-button-style bg-klarna hover:bg-klarna-hover disabled:opacity-65">
                    {processingMethod === "klarna" ? <Spinner /> : `Accetta · prima rata € ${fmt(klarnaQuota)}`}
                  </button>
                }>
                <ul className="space-y-4 py-4 border-t border-zinc-300">
                  <li className="w-full flex justify-between">
                    Tre rate senza interessi da: <span>€ {fmt(klarnaQuota)}</span>
                  </li>
                  <li className="w-full flex justify-between">
                    Subtotale: <span>€ {fmt(baseTotal)}</span>
                  </li>
                  <li>
                    <div className="w-full flex justify-between">
                      Commissione Klarna (5%): <span>€ {fmt(klarnaFee)}</span>
                    </div>
                    <p className="text-secondary text-xs">Inclusi costi del finanziamento</p>
                  </li>
                  <li className="w-full flex justify-between">
                    <strong>Totale:</strong> <strong>€ {fmt(klarnaTotal)}</strong>
                  </li>
                </ul>
              </PaymentProviderCard>
            </li>
          )}

          {showHeylight && (
            <li>
              <PaymentProviderCard
                cardTitle="HeyLight"
                icon={<HeyLightIcon />}
                subtitle={`Paga a rate fino a € ${fmt(HEYLIGHT_MAX)}`}
                backgroundColor="bg-[#FFF0EE]"
                button={
                  <button
                    onClick={handleAcceptHeylight}
                    disabled={!!processingMethod || !heylightFormValid}
                    className="artpay-button-style bg-[#ea1c00] hover:bg-[#c41800] text-white disabled:opacity-65">
                    {processingMethod === "heylight" ? <Spinner /> : "Accetta con HeyLight"}
                  </button>
                }>
                <div className="flex gap-3 py-4 border-t border-zinc-300">
                  <button
                    type="button"
                    onClick={() => setHeylightProductType("dilazione")}
                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                      heylightProductType === "dilazione"
                        ? "border-[#ea1c00] bg-[#FFF0EE]"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}>
                    <p className={`text-sm font-semibold ${heylightProductType === "dilazione" ? "text-[#ea1c00]" : "text-zinc-800"}`}>
                      Dilazione
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">3 – 24 rate · Tasso 0%</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeylightProductType("finanziamento")}
                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                      heylightProductType === "finanziamento"
                        ? "border-[#ea1c00] bg-[#FFF0EE]"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}>
                    <p className={`text-sm font-semibold ${heylightProductType === "finanziamento" ? "text-[#ea1c00]" : "text-zinc-800"}`}>
                      Finanziamento
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">3 – 24 rate · con interessi</p>
                  </button>
                </div>
                <ul className="space-y-4 py-4 border-t border-zinc-300">
                  <li className="w-full flex justify-between">
                    Subtotale: <span>€ {fmt(baseTotal)}</span>
                  </li>
                  <li>
                    {heylightProductType === "dilazione" ? (
                      <>
                        <div className="w-full flex justify-between">Rate da 3 a 24 mesi</div>
                        <p className="text-secondary text-xs">Senza interessi · Tasso 0%</p>
                      </>
                    ) : (
                      <>
                        <div className="w-full flex justify-between">Da 3 rate (5,36%) fino a 24 rate (13,36%)</div>
                        <p className="text-secondary text-xs">Inclusi costi del finanziamento</p>
                      </>
                    )}
                  </li>
                  <li className="w-full flex justify-between">
                    <strong>Totale:</strong> <strong>€ {fmt(baseTotal)}</strong>
                  </li>
                </ul>
                <div className="space-y-3 pt-4 border-t border-zinc-300">
                  <p className="text-sm font-medium text-tertiary">I tuoi dati</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Nome *"
                      value={heylightForm.firstName}
                      onChange={(e) => setHeylightForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Cognome *"
                      value={heylightForm.lastName}
                      onChange={(e) => setHeylightForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Telefono *"
                    value={heylightForm.phone}
                    onChange={(e) => setHeylightForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                  />
                </div>
              </PaymentProviderCard>
            </li>
          )}

          {(showBankTransfer || showSantander) && (
            <li>
              <PaymentProviderCard
                cardTitle="Finanziamento con bonifico"
                icon={<SantanderIcon />}
                subtitle="Richiedi un prestito e paga tramite bonifico"
                backgroundColor="bg-[#E2E6FC]"
                button={
                  <button
                    onClick={() => handleAccept("bank_transfer")}
                    disabled={!!processingMethod || !showBankTransfer}
                    className="artpay-button-style bg-primary hover:bg-primary-hover text-white disabled:opacity-65">
                    {processingMethod === "bank_transfer" ? <Spinner /> : "Ho ottenuto il prestito"}
                  </button>
                }>
                <ol className="list-decimal ps-4 space-y-1 border-t border-zinc-300 pt-4 pb-2">
                  <li>Richiedi il finanziamento al tuo istituto</li>
                  <li>Ottieni l'approvazione del prestito</li>
                  <li>Clicca "Ho ottenuto il prestito" per ricevere i dati per il bonifico</li>
                </ol>
                <ul className="space-y-4 py-4 border-t border-zinc-300">
                  <li className="w-full flex justify-between">
                    <strong>Totale:</strong> <strong>€ {fmt(baseTotal)}</strong>
                  </li>
                </ul>
                <div className="border-t border-zinc-300 pt-4 space-y-1">
                  <h4 className="font-bold leading-[125%] text-tertiary">Calcola la rata</h4>
                  <p className="text-sm text-secondary">Avvia la procedura di richiesta prestito con Santander</p>
                </div>
                <a
                  href="https://www.santanderconsumer.it/prestito/partner/artpay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2 items-center mt-2 text-tertiary">
                  <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#EA1D25" />
                    <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
                    <path d="M19.6526 10.2795C19.9083 10.6554 20.0362 11.0892 20.0682 11.5229C22.4334 12.0723 24.0315 13.2578 23.9995 14.559C23.9995 16.4675 20.8672 18 16.9998 18C13.1323 18 10 16.4675 10 14.559C10 13.2 11.6301 12.0145 13.9633 11.4651C13.9633 11.9855 14.0912 12.506 14.3788 12.9687L16.5843 16.4096C16.7441 16.6699 16.8719 16.959 16.9358 17.2482L17.0317 17.1036C17.5751 16.2651 17.5751 15.1952 17.0317 14.3566L15.2738 11.6096C14.7304 10.7422 14.7304 9.7012 15.2738 8.86265L15.3697 8.71807C15.4336 9.00723 15.5615 9.29639 15.7213 9.55663L16.7441 11.1759L18.3422 13.6916C18.502 13.9518 18.6298 14.241 18.6938 14.5301L18.7897 14.3855C19.333 13.547 19.333 12.4771 18.7897 11.6386L17.0317 8.89157C16.4884 8.05301 16.4884 6.98313 17.0317 6.14458L17.1276 6C17.1915 6.28916 17.3194 6.57831 17.4792 6.83855L19.6526 10.2795Z" fill="white" />
                  </svg>
                  <span>Calcola la rata con Santander</span>
                  <ArrowRight fontSize="small" />
                </a>
                {!showBankTransfer && (
                  <p className="text-xs text-secondary mt-3">
                    Bonifico disponibile per importi tra € {fmt(BANK_TRANSFER_MIN)} e € {fmt(BANK_TRANSFER_MAX)}.
                  </p>
                )}
              </PaymentProviderCard>
            </li>
          )}

          {/* Carta di credito */}
          <li>
            <PaymentProviderCard
              cardTitle="Carta di credito / debito"
              subtitle="Paga con la tua carta in modo sicuro tramite Stripe"
              backgroundColor="bg-[#E2E6FC]"
              button={
                <button
                  onClick={() => handleAccept("card")}
                  disabled={!!processingMethod}
                  className="artpay-button-style bg-primary hover:bg-primary-hover text-white disabled:opacity-65">
                  {processingMethod === "card" ? <Spinner /> : "Accetta e paga con carta"}
                </button>
              }>
              <ul className="space-y-4 py-4 border-t border-zinc-300">
                <li className="w-full flex justify-between">
                  <strong>Totale:</strong> <strong>€ {fmt(baseTotal)}</strong>
                </li>
              </ul>
            </PaymentProviderCard>
          </li>
        </ul>
      </div>

      {/* Rifiuta */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleReject}
          disabled={!!processingMethod}
          className="w-full text-sm text-secondary underline underline-offset-2 cursor-pointer disabled:opacity-50 py-2">
          {processingMethod === "reject" ? "Rifiuto in corso..." : "Rifiuta offerta"}
        </button>
      </div>
    </div>
  );
};

export default QuotePage;