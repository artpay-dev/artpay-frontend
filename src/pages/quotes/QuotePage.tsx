import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Typography, Box, Divider, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Order } from "../../types/order";
import { quoteService } from "../../services/quoteService";
import CountdownTimer from "../../components/CountdownTimer";

const KLARNA_FEE = 0.05;
const KLARNA_MAX_AMOUNT = 2500;

type PageStatus = "loading" | "loaded" | "accepted" | "rejected" | "error";

const QuotePage = () => {
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [vendorName, setVendorName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "klarna">("card");

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
      await quoteService.acceptQuote({
        order_key: orderKey,
        email,
        payment_method: paymentMethod,
        add_klarna_fee: paymentMethod === "klarna",
      });
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
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center mx-auto max-w-lg px-6 py-12">
        <CheckCircle sx={{ fontSize: 80, color: "#22c55e", mb: 2 }} />
        <Typography variant="h4" color="text.primary" gutterBottom>
          Offerta Accettata!
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mt-4 text-center max-w-md">
          Grazie per aver accettato l'offerta a te dedicata. Riceverai a breve una email con le istruzioni per completare il
          pagamento.
        </Typography>
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
  const listPrice = mainItem?.price || baseTotal;
  const discountAmount = listPrice - baseTotal;
  const hasDiscount = discountAmount > 0.009;
  const discountPercent = hasDiscount ? ((discountAmount / listPrice) * 100).toFixed(0) : "0";
  const klarnaAvailable = baseTotal <= KLARNA_MAX_AMOUNT;
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
              <>
                <div>
                  <Typography variant="body2" color="text.secondary">Prezzo di listino</Typography>
                  <Typography variant="body1" color="text.primary" sx={{ mt: 0.5 }}>
                    {currencySymbol} {listPrice.toFixed(2)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" color="text.secondary">Sconto applicato</Typography>
                  <Typography variant="body1" color="success.main" fontWeight={500} sx={{ mt: 0.5 }}>
                    -{discountPercent}% ({currencySymbol} {discountAmount.toFixed(2)})
                  </Typography>
                </div>
              </>
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

          <Divider />

          {/* Selezione metodo di pagamento */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Metodo di pagamento
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "card" | "klarna")}
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
            </RadioGroup>
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

          <Divider />

          {/* Azioni */}
          <Box className="flex flex-col gap-3">
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleAccept}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
              sx={{ py: 1.5 }}
            >
              {processing ? "Elaborazione..." : "Accetta Offerta"}
            </Button>

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