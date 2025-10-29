import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Box, CircularProgress, Alert, Container, Typography, Card, CardContent, Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { quoteService } from "../../services/quoteService.ts";
import { Gallery } from "../../types/gallery.ts";


// Carica la tua chiave pubblica Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "");

// Componente interno per il form di pagamento
const PaymentForm = ({ onSuccess, orderKey }: { onSuccess: () => void; orderKey: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Si è verificato un errore durante il pagamento");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Pagamento completato con successo, aggiorna l'ordine WooCommerce
        try {
          console.log("Pagamento completato! Aggiornamento ordine WooCommerce...");
          console.log("Chiamando completePayment con orderKey:", orderKey, "paymentIntentId:", paymentIntent.id);
          const result = await quoteService.completePayment(orderKey, paymentIntent.id);
          console.log("Risultato completePayment:", result);
          console.log("Ordine WooCommerce aggiornato con successo");
        } catch (err: any) {
          console.error("Errore nell'aggiornamento dell'ordine WooCommerce:", err);
          console.error("Dettagli errore:", err.response?.data);
          // Non blocchiamo l'utente, mostriamo comunque il successo
        }
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Si è verificato un errore imprevisto");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <PaymentElement />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={!stripe || isProcessing}
        sx={{ mt: 3 }}
      >
        {isProcessing ? (
          <>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Elaborazione...
          </>
        ) : (
          "Paga ora"
        )}
      </Button>
    </form>
  );
};

const CheckoutPayment = () => {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [gallery, setGallery] = useState<Gallery | null>(null);

  // Recupera i parametri dall'URL
  const paymentMethod = searchParams.get("payment");
  const orderId = searchParams.get("order_id");
  const orderKey = searchParams.get("order_key");
  const clientSecret = searchParams.get("client_secret");
  const vendorId = searchParams.get("vendor_id");


  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Validazione parametri
      if (!paymentMethod || !orderId || !orderKey || !clientSecret) {
        setError("Parametri di pagamento mancanti o non validi");
        setLoading(false);
        return;
      }

      if (paymentMethod !== "stripe") {
        setError("Metodo di pagamento non supportato");
        setLoading(false);
        return;
      }

      try {
        // Inizializza Stripe
        const stripe = await stripePromise;
        if (!stripe) {
          setError("Impossibile inizializzare Stripe");
          setLoading(false);
          return;
        }

        // Verifica lo stato del payment intent usando client_secret
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        if (paymentIntent) {
          console.log("Payment Intent status:", paymentIntent.status);

          // Se il pagamento è già completato, aggiorna l'ordine WooCommerce
          if (paymentIntent.status === "succeeded") {
            try {
              // Chiama l'endpoint per completare il pagamento e aggiornare l'ordine
              console.log("Chiamando completePayment con orderKey:", orderKey, "paymentIntentId:", paymentIntent.id);
              const result = await quoteService.completePayment(orderKey, paymentIntent.id);
              console.log("Risultato completePayment:", result);
              console.log("Ordine WooCommerce aggiornato con successo");
            } catch (err: any) {
              console.error("Errore nell'aggiornamento dell'ordine WooCommerce:", err);
              console.error("Dettagli errore:", err.response?.data);
              // Non blocchiamo l'utente, mostriamo comunque il successo
            }
            setPaymentSuccess(true);
          } else if (paymentIntent.status === "processing") {
            // Il pagamento è in elaborazione
            setPaymentProcessing(true);
          } else if (
            paymentIntent.status === "requires_payment_method" ||
            paymentIntent.status === "requires_confirmation" ||
            paymentIntent.status === "requires_action"
          ) {
            // Il pagamento richiede ulteriori azioni, mostra il form
            console.log("Pagamento richiede azione");
          } else if (paymentIntent.status === "canceled") {
            setError("Il pagamento è stato annullato");
          } else if (paymentIntent.status === "requires_capture") {
            // Il pagamento richiede cattura manuale
            console.log("Pagamento richiede cattura manuale");
          }
        }

        if (!vendorId) return ;

        const currentVendor = await quoteService.getVendor(vendorId)
        setGallery(currentVendor);

      } catch (err: any) {
        console.error("Errore nella verifica dello stato del pagamento:", err);
        // Non impostiamo un errore qui, lasciamo che l'utente provi a pagare
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [paymentMethod, orderId, orderKey, clientSecret]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Caricamento...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const options = {
    clientSecret: clientSecret!,
    appearance: {
      theme: "stripe" as const,
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Completa il pagamento
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ordine N. {orderId}
              </Typography>
            </Box>

            {paymentSuccess ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={6}
                gap={3}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "success.main",
                    display: "flex",
                    alignItems:"center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon sx={{ fontSize: 50, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight={600} textAlign="center">
                  Pagamento completato con successo!
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Il tuo ordine N. {orderId} è stato pagato correttamente.
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Riceverai una conferma via email a breve.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  href={`/gallerie/${gallery?.nice_name}`}
                  sx={{ mt: 3 }}
                >
                  Scopri le altre opere di {gallery?.display_name}
                </Button>
              </Box>
            ) : paymentProcessing ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={6}
                gap={3}
              >
                <CircularProgress size={60} />
                <Typography variant="h5" fontWeight={600} textAlign="center">
                  Pagamento in elaborazione
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Il tuo pagamento è in fase di verifica.
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Ti invieremo una conferma via email quando il pagamento sarà completato.
                </Typography>
              </Box>
            ) : (
              clientSecret && orderKey && (
                <Elements stripe={stripePromise} options={options}>
                  <PaymentForm onSuccess={() => setPaymentSuccess(true)} orderKey={orderKey} />
                </Elements>
              )
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CheckoutPayment;