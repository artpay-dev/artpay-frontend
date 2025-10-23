import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Typography, Box, Divider } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Order } from "../../types/order";
import { quoteService } from "../../services/quoteService";
import CountdownTimer from "../../components/CountdownTimer";

type PageStatus = "loading" | "loaded" | "accepted" | "rejected" | "error";

const QuotePage = () => {
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);

  const orderId = searchParams.get("order_id");
  const orderKey = searchParams.get("key");
  const email = searchParams.get("email");

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
            `Questo preventivo non è più disponibile. Lo stato attuale dell'ordine è: ${orderData.status}`
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
            "Impossibile recuperare i dati del preventivo. Verifica il link ricevuto via email."
        );
        setStatus("error");
      }
    };

    loadOrder();
  }, [orderId, orderKey, email]);

  const handleAccept = async () => {
    if (!orderKey || !email || processing) return;

    try {
      setProcessing(true);
      await quoteService.acceptQuote({ order_key: orderKey, email });
      setStatus("accepted");
    } catch (error: any) {
      console.error("Errore nell'accettazione del preventivo:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Si è verificato un errore durante l'accettazione del preventivo. Riprova."
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
      console.error("Errore nel rifiuto del preventivo:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Si è verificato un errore durante il rifiuto del preventivo. Riprova."
      );
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="text-white flex flex-col items-center justify-center h-full mx-auto max-w-lg px-6 py-12">
        <CircularProgress size={60} sx={{ color: "white" }} />
        <Typography variant="h6" className="mt-6 text-white">
          Caricamento preventivo...
        </Typography>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="text-white flex flex-col items-center justify-center h-full mx-auto max-w-lg px-6 py-12">
        <Cancel sx={{ fontSize: 80, color: "#ef4444", mb: 2 }} />
        <Typography variant="h4" className="mb-4 text-white" gutterBottom>
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
      <main className="text-white flex flex-col items-center justify-center h-full mx-auto max-w-lg px-6 py-12">
        <CheckCircle sx={{ fontSize: 80, color: "#22c55e", mb: 2 }} />
        <Typography variant="h4" className="mb-4 text-white" gutterBottom>
          Preventivo Accettato!
        </Typography>
        <Typography variant="body1" className="mt-4 text-center text-white max-w-md">
          Grazie per aver accettato il preventivo. Riceverai a breve una email con le istruzioni per completare il
          pagamento.
        </Typography>
      </main>
    );
  }

  if (status === "rejected") {
    return (
      <main className="text-white flex flex-col items-center justify-center h-full mx-auto max-w-lg px-6 py-12">
        <Cancel sx={{ fontSize: 80, color: "#f59e0b", mb: 2 }} />
        <Typography variant="h4" className="mb-4 text-white" gutterBottom>
          Preventivo Rifiutato
        </Typography>
        <Typography variant="body1" className="mt-4 text-center text-white max-w-md">
          Hai rifiutato questo preventivo. L'ordine è stato annullato.
        </Typography>
      </main>
    );
  }

  if (!order) return null;

0  // Cerca la data di scadenza nei meta_data
  const expiryDateMeta = order.meta_data?.find((meta) => meta.key === "quote_expiry_date");
  const hasExpiryDate = !!expiryDateMeta;
  const expiryDate = hasExpiryDate ? new Date(expiryDateMeta.value) : null;

  // Prendi la percentuale di sconto direttamente dal coupon_data se disponibile
  const couponLine = order.coupon_lines?.[0];
  const couponData = couponLine?.meta_data?.find((meta: any) => meta.key === "coupon_data")?.value;
  const discountPercentage = couponData?.amount || "0";

  // Prendi il primo line_item per mostrare i dettagli principali
  const mainItem = order.line_items?.[0];

  // Gestione immagine: può essere una stringa URL o un oggetto con src
  const imageUrl = typeof mainItem?.image === 'string' ? mainItem.image : mainItem?.image?.src;

  // Gestione currency symbol
  const currencySymbol = order.currency_symbol || (order.currency === 'EUR' ? '€' : order.currency);

  return (
    <main className="text-white w-full max-w-lg mx-auto px-6 pb-6">
      <h1 className="text-4xl font-light mb-8">Dettaglio Preventivo</h1>

      <Alert severity="info" sx={{ mb: 3 }}>
        Hai ricevuto un preventivo. Controlla i dettagli qui sotto e decidi se accettare o rifiutare.
      </Alert>

      <div className="bg-white rounded-3xl p-6 space-y-6">
        {/* Header con immagine e info base */}
        <div className="flex items-start gap-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={mainItem?.name || "Artwork"}
              className="rounded-lg object-cover w-24 h-24"
            />
          )}
          <div className="flex-1">
            <Typography variant="h6" className="!font-semibold text-tertiary">
              Preventivo N.{order?.id}
            </Typography>
            <Typography variant="body1" className="!mt-2 text-tertiary">
              {mainItem?.name || "Opera d'arte"}
            </Typography>
            {order?.billing?.email && (
              <Typography variant="body2" color="text.secondary" className="!mt-1">
                Email: {order.billing.email}
              </Typography>
            )}
          </div>
        </div>

        <Divider />

        {/* Timer scadenza */}
        {hasExpiryDate && expiryDate && (
          <Box className="mt-6">
            <Typography variant="body2" color="text.secondary" className="!mb-2">
              Il preventivo scade tra:
            </Typography>
            <CountdownTimer expiryDate={expiryDate} />
          </Box>
        )}

        {/* Dettagli prezzo */}
        <Box className="space-y-4 mt-6">
          <div>
            <Typography variant="body2" color="text.secondary">
              Data creazione:
            </Typography>
            <Typography variant="body1" className="!mt-1 text-tertiary">
              {new Date(order.date_created).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Typography>
          </div>

          {parseFloat(order.discount_total || "0") > 0 && (
            <div>
              <Typography variant="body2" color="text.secondary">
                Prezzo di partenza:
              </Typography>
              <Typography variant="body1" className="!mt-1 text-tertiary">
                {currencySymbol} {(parseFloat(order.total || "0") + parseFloat(order.discount_total || "0") * 1.05).toFixed(2)}
              </Typography>
            </div>
          )}

          <div>
            <Typography variant="body2" color="text.secondary">
              Prezzo finale:
            </Typography>
            <Typography variant="body1" className="!mt-1 text-tertiary">
              {currencySymbol} {parseFloat(order.total || "0").toFixed(2)}
            </Typography>
          </div>

          {parseFloat(order.discount_total || "0") > 0 && (
            <div>
              <Typography variant="body2" color="text.secondary">
                Sconto applicato:
              </Typography>
              <Typography variant="body1" className="text-tertiary !mb-4 !mt-1">
                {discountPercentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Risparmio
              </Typography>
              <Typography variant="body1" className="text-tertiary !mt-1">
                {currencySymbol} {(parseFloat(order.discount_total || "0") * 1.05).toFixed(2)}
              </Typography>
            </div>
          )}

          {mainItem?.meta_data && mainItem.meta_data.length > 0 && (
            <div>
              <Typography variant="body2" color="text.secondary">
                Descrizione opera:
              </Typography>
              <Typography variant="body1" className="!mt-1 text-tertiary">
                {mainItem.meta_data.find((m: any) => m.key === "_product_description")?.value || "N/A"}
              </Typography>
            </div>
          )}

          {/* Altri line items se presenti */}
          {order.line_items.length > 1 && (
            <div>
              <Typography variant="body2" color="text.secondary" className="!mb-2">
                Altri prodotti:
              </Typography>
              {order.line_items.slice(1).map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <Typography variant="body1" className="text-tertiary">
                    {item.name} (x{item.quantity})
                  </Typography>
                  <Typography variant="body1" className="text-tertiary">
                    {currencySymbol}
                    {parseFloat(item.total).toFixed(2)}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </Box>

        <Divider />

        {/* Azioni */}
        <Box className="flex flex-col gap-4 !mt-6">
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleAccept}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
            sx={{ py: 1.5 }}
          >
            {processing ? "Elaborazione..." : "Accetta Preventivo"}
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
            Rifiuta Preventivo
          </Button>
        </Box>
      </div>
    </main>
  );
};

export default QuotePage;