import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Box, CircularProgress, Alert, Container, Typography, Card, CardContent, Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

// Carica la tua chiave pubblica Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "");

// Componente interno per il form di pagamento
const PaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
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
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Si è verificato un errore durante il pagamento");
        setIsProcessing(false);
      } else {
        // Pagamento completato con successo
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

  // Recupera i parametri dall'URL
  const paymentMethod = searchParams.get("payment");
  const orderId = searchParams.get("order_id");
  const orderKey = searchParams.get("order_key");
  const clientSecret = searchParams.get("client_secret");

  useEffect(() => {
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

    setLoading(false);
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
                    alignItems: "center",
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
              </Box>
            ) : (
              clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <PaymentForm onSuccess={() => setPaymentSuccess(true)} />
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