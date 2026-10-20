import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { CircularProgress, Alert, Button } from "@mui/material";
import { quoteService } from "../../services/quoteService.ts";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "");

const PaymentForm = ({ onSuccess, orderKey }: { onSuccess: () => void; orderKey: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Si è verificato un errore durante il pagamento");
        setIsProcessing(false);
      } else if (paymentIntent?.status === "succeeded") {
        try {
          await quoteService.completePayment(orderKey, paymentIntent.id);
        } catch {}
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
        sx={{ mt: 3 }}>
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <CircularProgress size={20} color="inherit" />
            Elaborazione...
          </span>
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

  const paymentMethod = searchParams.get("payment");
  const orderId = searchParams.get("order_id");
  const orderKey = searchParams.get("order_key");
  const clientSecret = searchParams.get("client_secret");

  useEffect(() => {
    const checkPaymentStatus = async () => {
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
        const stripe = await stripePromise;
        if (!stripe) {
          setError("Impossibile inizializzare Stripe");
          setLoading(false);
          return;
        }

        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        if (paymentIntent?.status === "succeeded") {
          try {
            await quoteService.completePayment(orderKey, paymentIntent.id);
          } catch {}
          setPaymentSuccess(true);
        } else if (paymentIntent?.status === "processing") {
          setPaymentProcessing(true);
        } else if (paymentIntent?.status === "canceled") {
          setError("Il pagamento è stato annullato");
        }
      } catch {}

      setLoading(false);
    };

    checkPaymentStatus();
  }, [paymentMethod, orderId, orderKey, clientSecret]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <CircularProgress size={40} />
        <p className="text-secondary text-sm">Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.2739 41.9177H15.7841C16.311 41.9177 16.75 42.1004 17.1013 42.4656L21.0308 46.345C22.0846 47.4117 23.0761 47.945 24.0054 47.945C24.9347 47.945 25.9263 47.4117 26.9801 46.345L30.8876 42.4656C31.2535 42.1004 31.6999 41.9177 32.2267 41.9177H37.7369C39.2444 41.9177 40.3274 41.5889 40.9859 40.9313C41.6445 40.2739 41.9739 39.1926 41.9739 37.6875V32.1864C41.9739 31.6895 42.1494 31.251 42.5006 30.8712L46.4082 26.948C47.4766 25.8958 48.0071 24.9095 47.9998 23.989C47.9926 23.0685 47.4621 22.0749 46.4082 21.0082L42.5006 17.0849C42.1494 16.705 41.9739 16.274 41.9739 15.7918V10.2904C41.9739 8.78542 41.6445 7.70049 40.9859 7.03567C40.3274 6.37082 39.2444 6.0384 37.7369 6.0384H32.2267C31.6999 6.0384 31.2535 5.86306 30.8876 5.51239L26.9801 1.63294C25.9118 0.537057 24.9165 -0.00723334 23.9944 7.25754e-05C23.0724 0.00737848 22.0772 0.551668 21.0089 1.63294L17.1013 5.51239C16.75 5.86306 16.311 6.0384 15.7841 6.0384H10.2739C8.76649 6.0384 7.68349 6.36717 7.02491 7.02471C6.36633 7.68224 6.03704 8.77081 6.03704 10.2904V15.7918C6.03704 16.274 5.8541 16.705 5.48822 17.0849L1.60256 21.0082C0.534186 22.0749 0 23.0685 0 23.989C0 24.9095 0.534186 25.8958 1.60256 26.948L5.48822 30.8712C5.8541 31.251 6.03704 31.6895 6.03704 32.1864V37.6875C6.03704 39.1926 6.36633 40.2739 7.02491 40.9313C7.68349 41.5889 8.76649 41.9177 10.2739 41.9177ZM21.6674 34.4217C21.4772 34.4217 21.3199 34.3889 21.1955 34.3232C21.0711 34.2575 20.943 34.1443 20.8113 33.9834L14.2254 26.3341C13.962 25.7643 13.962 25.6328 13.962 25.6328C13.962 25.3991 14.0425 25.2055 14.2035 25.0519C14.3645 24.8986 14.5547 24.8219 14.7743 24.8219C14.9353 24.8219 15.0743 24.8511 15.1914 24.9096C15.3084 24.968 15.4255 25.0703 15.5426 25.2164L21.6235 32.3176L32.6657 15.1343C32.8853 14.8274 33.1341 14.674 33.4123 14.674C33.6171 14.674 33.8074 14.7507 33.983 14.9041C34.1587 15.0576 34.2465 15.2439 34.2465 15.463C34.2465 15.5653 34.2245 15.6712 34.1806 15.7808C34.1367 15.8904 34.0928 15.989 34.0489 16.0767L22.5017 33.9834C22.3846 34.1296 22.2565 34.2392 22.1175 34.3122C21.9784 34.3852 21.8284 34.4217 21.6674 34.4217Z" fill="#42B396"/>
        </svg>
        <p className="text-2xl text-center font-light">Pagamento completato!</p>
        <p className="text-secondary text-sm text-center">
          Il tuo ordine N. {orderId} è stato pagato correttamente.
          <br />
          Riceverai una conferma via email a breve.
        </p>
      </div>
    );
  }

  if (paymentProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <CircularProgress size={40} />
        <p className="text-xl font-light text-center">Pagamento in elaborazione</p>
        <p className="text-secondary text-sm text-center">
          Il tuo pagamento è in fase di verifica. Riceverai una conferma via email.
        </p>
      </div>
    );
  }

  const options = {
    clientSecret: clientSecret!,
    appearance: { theme: "stripe" as const },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-gray-900">Completa il pagamento</h1>
        <p className="text-sm text-secondary mt-1">Ordine N. {orderId}</p>
      </div>
      {clientSecret && orderKey && (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm onSuccess={() => setPaymentSuccess(true)} orderKey={orderKey} />
        </Elements>
      )}
    </div>
  );
};

export default CheckoutPayment;