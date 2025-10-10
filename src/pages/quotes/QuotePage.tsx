import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Alert, Button, CircularProgress, Typography } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Order } from "../../types/order";
import { quoteService } from "../../services/quoteService";

type PageStatus = "loading" | "loaded" | "accepted" | "rejected" | "error";

const QuotePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
        const orderData = await quoteService.getQuoteOrder(+orderId, orderKey, email);

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
        <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 3 }}>
          Torna alla home
        </Button>
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
        <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 3 }}>
          Torna alla home
        </Button>
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
        <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 3 }}>
          Torna alla home
        </Button>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="text-white mx-auto max-w-lg px-6 py-4">
      <Typography variant="h3" className="text-secondary mb-4" sx={{ typography: { xs: "h4", md: "h3" } }}>
        Preventivo #{order.number}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Hai ricevuto un preventivo. Controlla i dettagli qui sotto e decidi se accettare o rifiutare.
      </Alert>

      <div className="bg-white text-black rounded-lg p-6 mb-6">
        <Typography variant="h6" className="mb-4" gutterBottom>
          Dettagli Ordine
        </Typography>
        <hr className="mb-4" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="body2" color="text.secondary">
              Numero Ordine:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              #{order.number}
            </Typography>
          </div>

          <div>
            <Typography variant="body2" color="text.secondary">
              Data:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {new Date(order.date_created).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Typography>
          </div>

          <div className="col-span-2 mt-2">
            <Typography variant="body2" color="text.secondary">
              Cliente:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {order.billing.first_name} {order.billing.last_name}
            </Typography>
            <Typography variant="body2">{order.billing.email}</Typography>
          </div>
        </div>

        <hr className="my-4" />

        <Typography variant="h6" className="mb-3" gutterBottom>
          Prodotti
        </Typography>

        {order.line_items.map((item, index) => (
          <div key={index} className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Typography variant="body1" fontWeight="medium">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantità: {item.quantity}
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="body1" fontWeight="bold">
                  {order.currency_symbol}
                  {parseFloat(item.total).toFixed(2)}
                </Typography>
              </div>
            </div>
          </div>
        ))}

        <hr className="my-4" />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Typography variant="h6">Totale:</Typography>
          </div>
          <div className="text-right">
            <Typography variant="h6" color="primary" fontWeight="bold">
              {order.currency_symbol}
              {parseFloat(order.total).toFixed(2)}
            </Typography>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleAccept}
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
          fullWidth
        >
          {processing ? "Elaborazione..." : "Accetta Preventivo"}
        </Button>

        <Button
          variant="outlined"
          color="error"
          size="large"
          onClick={handleReject}
          disabled={processing}
          startIcon={<Cancel />}
          fullWidth
        >
          Rifiuta Preventivo
        </Button>
      </div>
    </main>
  );
};

export default QuotePage;