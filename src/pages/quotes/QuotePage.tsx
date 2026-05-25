import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Typography, Box, Divider, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Order } from "../../types/order";
import { quoteService, BankTransferInstructions } from "../../services/quoteService";
import CountdownTimer from "../../components/CountdownTimer";
import SantanderIcon from "../../components/icons/SantanderIcon";

const KLARNA_FEE = 0.05;
const KLARNA_MAX_AMOUNT = 2500;
const BANK_TRANSFER_MIN = 2500;
const BANK_TRANSFER_MAX = 30000;
const SANTANDER_URL = "https://www.santanderconsumer.it/prestito/partner/artpay";

type PageStatus = "loading" | "loaded" | "accepted" | "rejected" | "error";

const QuotePage = () => {
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [vendorName, setVendorName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "klarna" | "bank_transfer">("card");
  const [bankTransferInstructions, setBankTransferInstructions] = useState<BankTransferInstructions | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const orderId = searchParams.get("order_id");
  const orderKey = searchParams.get("key");
  const email = searchParams.get("email");
  const vendorId = searchParams.get("vendor_id");

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
        console.error("Errore nel caricamento dell'ordine:", error);
        setErrorMessage(
          error?.response?.data?.message ||
            "Impossibile recuperare i dati dell'offerta. Verifica il link ricevuto via email."
        );
        setStatus("error");
      }
    };

    loadOrder();
  }, [orderId, orderKey, email]);

  useEffect(() => {
    const loadVendor = async () => {
      if (!vendorId) return;

      try {
        const vendorData = await quoteService.getVendor(vendorId);
        setVendorName(vendorData?.shop_name || vendorData?.display_name || "");
      } catch (error) {
        console.error("Errore nel recupero dei dati della galleria:", error);
      }
    };

    loadVendor();
  }, [vendorId]);

  const handleAccept = async () => {
    if (!orderKey || !email || processing) return;

    try {
      setProcessing(true);
      const response = await quoteService.acceptQuote({
        order_key: orderKey,
        email,
        payment_method: paymentMethod,
        add_klarna_fee: paymentMethod === "klarna",
      });
      if (paymentMethod === "bank_transfer" && response.payment_intent?.bank_transfer_instructions) {
        const instructions = response.payment_intent.bank_transfer_instructions;
        setBankTransferInstructions(instructions);

        const ibanInfo = instructions.financial_addresses?.[0]?.iban;
        const amount = (instructions.amount_remaining / 100).toFixed(2);
        const recipientName = `${order?.billing?.first_name || ""} ${order?.billing?.last_name || ""}`.trim();

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": import.meta.env.VITE_BREVO_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "artpay", email: "noreply@artpay.art" },
            to: [{ email, name: recipientName }],
            subject: "Istruzioni per il bonifico – artpay",
            htmlContent: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:520px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#3E4EEC;padding:32px 40px">
            <div style="color:#ffffff;font-size:22px;font-weight:300;letter-spacing:-0.5px">artpay</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <p style="margin:0 0 8px;font-size:13px;color:#3E4EEC;font-weight:600;text-transform:uppercase;letter-spacing:1px">Bonifico bancario</p>
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:400;color:#111">Istruzioni per il pagamento</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.6">
              Ciao${recipientName ? ` <strong>${recipientName}</strong>` : ""},<br/>
              hai accettato l'offerta. Effettua il bonifico con i dati qui sotto per completare l'acquisto. Il pagamento verrà confermato automaticamente.
            </p>

            <!-- Dati bonifico -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:12px;overflow:hidden">
              ${[
                ["Intestatario", ibanInfo?.account_holder_name],
                ["IBAN", ibanInfo?.iban],
                ["BIC / SWIFT", ibanInfo?.bic],
                ["Causale", instructions.reference],
                ["Importo da versare", `<strong style="color:#3E4EEC;font-size:16px">${amount} ${instructions.currency.toUpperCase()}</strong>`],
              ].map(([label, value], i, arr) => `
                <tr style="background:${i % 2 === 0 ? "#fafafa" : "#ffffff"}">
                  <td style="padding:14px 20px;font-size:13px;color:#888;width:42%;${i < arr.length - 1 ? "border-bottom:1px solid #eee" : ""}">${label}</td>
                  <td style="padding:14px 20px;font-size:14px;color:#111;font-weight:600;${i < arr.length - 1 ? "border-bottom:1px solid #eee" : ""}">${value}</td>
                </tr>
              `).join("")}
            </table>

            <p style="margin:32px 0 0;font-size:13px;color:#999;line-height:1.6">
              Una volta ricevuto il bonifico, riceverai una conferma via email. Per assistenza scrivi a <a href="mailto:hello@artpay.art" style="color:#3E4EEC">hello@artpay.art</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#bbb">© ${new Date().getFullYear()} artpay · <a href="https://artpay.art" style="color:#bbb">artpay.art</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
          }),
        }).catch((err) => console.error("Errore invio email bonifico:", err));
      }
      setStatus("accepted");
    } catch (error: any) {
      console.error("Errore nell'accettazione dell'offerta:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Si è verificato un errore durante l'accettazione dell'offerta. Riprova."
      );
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!orderKey || !email || processing) return;

    try {
      setProcessing(true);
      await quoteService.rejectQuote({ order_key: orderKey, email });
      setStatus("rejected");
    } catch (error: any) {
      console.error("Errore nel rifiuto dell'offerta:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Si è verificato un errore durante il rifiuto dell'offerta. Riprova."
      );
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center mx-auto max-w-lg px-6 py-12">
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" className="mt-6">
          Caricamento offerta...
        </Typography>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center mx-auto max-w-lg px-6 py-12">
        <Cancel sx={{ fontSize: 80, color: "#ef4444", mb: 2 }} />
        <Typography variant="h4" color="text.primary" gutterBottom>
          Errore
        </Typography>
        <Alert severity="error" sx={{ mt: 2, maxWidth: "600px" }}>
          {errorMessage}
        </Alert>
      </main>
    );
  }

  if (status === "accepted") {
    const ibanInfo = bankTransferInstructions?.financial_addresses?.[0]?.iban;
    const rows = bankTransferInstructions && ibanInfo ? [
      ["Intestatario", ibanInfo.account_holder_name],
      ["IBAN", ibanInfo.iban],
      ["BIC / SWIFT", ibanInfo.bic],
      ["Causale", bankTransferInstructions.reference],
      ["Importo", `${(bankTransferInstructions.amount_remaining / 100).toFixed(2)} ${bankTransferInstructions.currency.toUpperCase()}`],
    ] : [];

    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center mx-auto max-w-lg px-6 py-12">
        <Box sx={{ width: "100%", bgcolor: "white", borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {/* Header verde */}
          <Box sx={{ bgcolor: "#22c55e", px: 4, py: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <CheckCircle sx={{ color: "white", fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 400 }}>
              Offerta accettata
            </Typography>
          </Box>

          <Box sx={{ px: 4, py: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {rows.length > 0 ? (
              <>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "primary.main" }}>
                    Dati per il bonifico
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Ti abbiamo inviato queste istruzioni anche via email.
                  </Typography>
                </Box>
                <Divider />
                {rows.map(([label, value]) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right", wordBreak: "break-all" }}>{value}</Typography>
                  </Box>
                ))}
                <Divider />
                <Typography variant="caption" color="text.secondary">
                  Il pagamento verrà confermato automaticamente non appena il bonifico sarà ricevuto.
                </Typography>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Grazie per aver accettato l'offerta. Riceverai a breve una email con le istruzioni per completare il pagamento.
              </Typography>
            )}
          </Box>
        </Box>
      </main>
    );
  }

  if (status === "rejected") {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center mx-auto max-w-lg px-6 py-12">
        <Cancel sx={{ fontSize: 80, color: "#f59e0b", mb: 2 }} />
        <Typography variant="h4" color="text.primary" gutterBottom>
          Offerta Rifiutata
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mt-4 text-center max-w-md">
          Hai rifiutato questa offerta. L'ordine è stato annullato.
        </Typography>
      </main>
    );
  }

  if (!order) return null;

  const expiryDateMeta = order.meta_data?.find((meta) => meta.key === "quote_expiry_date");
  const hasExpiryDate = !!expiryDateMeta;
  const expiryDate = hasExpiryDate ? new Date(expiryDateMeta.value) : null;

  const mainItem = order.line_items?.[0];
  const imageUrl = typeof mainItem?.image === 'string' ? mainItem.image : mainItem?.image?.src;
  const currencySymbol = order.currency_symbol || (order.currency === 'EUR' ? '€' : order.currency);

  const baseTotal = parseFloat(order.total || "0");
  const listPrice = Number(mainItem?.price) || baseTotal;
  const discountAmount = listPrice - baseTotal;
  const hasDiscount = discountAmount > 0.009;
  const discountPercent = hasDiscount ? ((discountAmount / listPrice) * 100).toFixed(0) : "0";
  const klarnaAvailable = baseTotal <= KLARNA_MAX_AMOUNT;
  const bankTransferAvailable = baseTotal > BANK_TRANSFER_MIN && baseTotal <= BANK_TRANSFER_MAX;
  const santanderAvailable = baseTotal > BANK_TRANSFER_MIN;
  const klarnaFeeAmount = paymentMethod === "klarna" ? baseTotal * KLARNA_FEE : 0;
  const finalTotal = baseTotal + klarnaFeeAmount;

  return (
    <main className="min-h-screen bg-gray-50 w-full">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-3xl font-light text-gray-900 mb-6">Dettaglio Offerta Dedicata</h1>

        <Alert severity="info" sx={{ mb: 3 }}>
          Hai ricevuto un'offerta dedicata. Controlla i dettagli qui sotto e decidi se accettare o rifiutare.
        </Alert>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Header con immagine e info base */}
          <div className="flex items-start gap-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={mainItem?.name || "Artwork"}
                className="rounded-lg object-cover w-20 h-20 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Offerta N.{order?.id}
              </Typography>
              {vendorName && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Galleria: {vendorName}
                </Typography>
              )}
              <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                {mainItem?.name || "Opera d'arte"}
              </Typography>
              {order?.billing?.email && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {order.billing.email}
                </Typography>
              )}
            </div>
          </div>

          <Divider />

          {/* Timer scadenza */}
          {hasExpiryDate && expiryDate && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                L'offerta scade tra:
              </Typography>
              <CountdownTimer expiryDate={expiryDate} />
            </Box>
          )}

          {/* Dettagli prezzo */}
          <Box className="space-y-3">
            <div>
              <Typography variant="body2" color="text.secondary">Data creazione</Typography>
              <Typography variant="body1" color="text.primary" sx={{ mt: 0.5 }}>
                {new Date(order.date_created).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </div>

            {hasDiscount && (
              <div>
                <Typography variant="body2" color="text.secondary">Prezzo di listino</Typography>
                <Typography variant="body1" color="text.primary" sx={{ mt: 0.5 }}>
                  {currencySymbol} {listPrice.toFixed(2)}
                </Typography>
              </div>
            )}

            <div>
              <Typography variant="body2" color="text.secondary">
                {hasDiscount ? "Prezzo offerta" : "Prezzo"}
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mt: 0.5 }}>
                {currencySymbol} {baseTotal.toFixed(2)}
              </Typography>
            </div>

            {hasDiscount && (
              <div>
                <Typography variant="body2" color="text.secondary">Sconto applicato</Typography>
                <Typography variant="body1" color="success.main" fontWeight={500} sx={{ mt: 0.5 }}>
                  -{discountPercent}% ({currencySymbol} {discountAmount.toFixed(2)})
                </Typography>
              </div>
            )}

            {mainItem?.meta_data && mainItem.meta_data.find((m: any) => m.key === "_product_description")?.value && (
              <div>
                <Typography variant="body2" color="text.secondary">Descrizione opera</Typography>
                <Typography variant="body1" color="text.primary" sx={{ mt: 0.5 }}>
                  {mainItem.meta_data.find((m: any) => m.key === "_product_description")?.value}
                </Typography>
              </div>
            )}

            {order.line_items.length > 1 && (
              <div>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Altri prodotti:
                </Typography>
                {order.line_items.slice(1).map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <Typography variant="body2" color="text.primary">
                      {item.name} (x{item.quantity})
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {currencySymbol} {parseFloat(item.total).toFixed(2)}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </Box>

          {showPaymentMethods && (
            <>
              <Divider />

              {/* Selezione metodo di pagamento */}
              <Box className={'mt-4'}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Scegli la modalità di pagamento
                </Typography>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "card" | "klarna" | "bank_transfer")}
                >
                  <FormControlLabel
                    value="card"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2" color="text.primary">Carta di credito/debito</Typography>}
                  />
                  {klarnaAvailable && (
                    <FormControlLabel
                      value="klarna"
                      control={<Radio size="small" />}
                      label={
                        <Typography variant="body2" color="text.primary">
                          Klarna (paga dopo) — commissione +{(KLARNA_FEE * 100).toFixed(0)}%
                        </Typography>
                      }
                    />
                  )}
                  {bankTransferAvailable && (
                    <FormControlLabel
                      value="bank_transfer"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2" color="text.primary">Bonifico bancario</Typography>}
                    />
                  )}
                </RadioGroup>
                {santanderAvailable && (
                  <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box
                      component="a"
                      href={SANTANDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", color: "text.secondary", "&:hover": { color: "text.primary" } }}
                    >
                      <Box sx={{ width: 18, height: 18, "& svg": { width: 18, height: 18 } }}>
                        <SantanderIcon />
                      </Box>
                      <Typography variant="caption">Chiedi il finanziamento con Santander →</Typography>
                    </Box>
                    <Typography variant="caption" color="text.disabled" sx={{ pl: "26px" }}>
                      (torna su questa pagina una volta ottenuto il prestito, seleziona bonifico e accetta l'offerta per ricevere le istruzioni di pagamento)
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Riepilogo totale */}
              <Box sx={{ bgcolor: "grey.50", borderRadius: 2, p: 2 }} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body2" color="text.secondary">Prezzo offerta</Typography>
                  <Typography variant="body2" color="text.primary">{currencySymbol} {baseTotal.toFixed(2)}</Typography>
                </div>
                {paymentMethod === "klarna" && (
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" color="text.secondary">
                      Commissione Klarna (+{(KLARNA_FEE * 100).toFixed(0)}%)
                    </Typography>
                    <Typography variant="body2" color="text.primary">{currencySymbol} {klarnaFeeAmount.toFixed(2)}</Typography>
                  </div>
                )}
                <Divider sx={{ my: 1 }} />
                <div className="flex justify-between items-center">
                  <Typography variant="body1" fontWeight={600} color="text.primary">Totale da pagare</Typography>
                  <Typography variant="body1" fontWeight={600} color="text.primary">
                    {currencySymbol} {finalTotal.toFixed(2)}
                  </Typography>
                </div>
              </Box>
            </>
          )}

          <Divider />

          {/* Azioni */}
          <Box className="flex flex-col gap-3 mt-4">
            {!showPaymentMethods ? (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => setShowPaymentMethods(true)}
                startIcon={<CheckCircle />}
                sx={{ py: 1.5 }}
              >
                Accetta Offerta
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleAccept}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                sx={{ py: 1.5 }}
              >
                {processing ? "Elaborazione..." : "Conferma"}
              </Button>
            )}

            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleReject}
              disabled={processing}
              startIcon={<Cancel />}
              sx={{ py: 1.5 }}
            >
              Rifiuta Offerta
            </Button>
          </Box>
        </div>
      </div>
    </main>
  );
};

export default QuotePage;