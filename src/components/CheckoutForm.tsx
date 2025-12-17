import React, { MutableRefObject, useState } from "react";
import { PaymentElement, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from "@stripe/stripe-js";
import { Alert, AlertTitle, Box, Button, Grid } from "@mui/material";
import { useDirectPurchase } from "../features/directpurchase";
import { useEnvDetector } from "../utils.ts";

type CheckoutFormProps = {
  thankYouPage?: string;
  onReady?: (element: StripePaymentElement) => any;
  onCheckout?: () => void;
  onChange?: (payment_method: string) => void;
  ref?: MutableRefObject<HTMLButtonElement | null>;
  paymentMethod?: string | null;
};


const buttonStyles = {
  card:{
    text: "Completa acquisto",
    style: "!bg-[#181F5D] !text-[#FFF] disabled:opacity-40"
  },
  klarna : {
    text: "Paga la prima rata",
    style: "!bg-[#FEB4C7] !text-[#010F22] disabled:opacity-40"
  }
}



const CheckoutForm = React.forwardRef<HTMLButtonElement, CheckoutFormProps>(
  ({ onReady, onCheckout, onChange, paymentMethod = "card"}, ref) => {
    const stripe = useStripe();
    const elements = useElements();

    const {privacyChecked, pendingOrder, orderMode} = useDirectPurchase()

    const environment = useEnvDetector();

    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);

    // Costruisce il return URL dinamicamente per Vercel o usa URL fissi per altri ambienti
    const getReturnUrl = () => {
      const isVercel = window.location.hostname.includes('vercel.app-artmatch');

      if (isVercel) {
        // Per Vercel, costruisci dinamicamente l'URL basandosi sull'host corrente
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        return orderMode == "loan"
          ? `${baseUrl}/opera-bloccata`
          : `${baseUrl}/acquisto?order=${pendingOrder?.id}`;
      }

      // Per altri ambienti usa gli URL fissi
      const returnUrl: Record<any, any> = {
        local:
          (orderMode == "loan"
            ? "http://localhost:5173/opera-bloccata"
            : "http://localhost:5173/acquisto?order=" + pendingOrder?.id),
        staging:
          (orderMode == "loan"
            ? "https://staging2.artpay.art/opera-bloccata"
            : "https://staging2.artpay.art/acquisto?order=" + pendingOrder?.id),
        production:
          (orderMode == "loan"
            ? "https://artpay.art/opera-bloccata"
            : "https://artpay.art/acquisto?order=" + pendingOrder?.id),
      };

      return environment ? returnUrl[environment] : returnUrl.local;
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
      setError(undefined);
      e.preventDefault();

      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }

      setIsLoading(true);

      // Salva l'order ID nel localStorage PRIMA del redirect di Stripe
      if (pendingOrder) {
        console.log("Setting completed-order in localStorage", pendingOrder.id.toString());
        localStorage.setItem("completed-order", pendingOrder.id.toString());
      }

      // data.clearCachedPaymentIntent({wc_order_key: ''})
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: getReturnUrl(),
        }
      });




      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      switch (error.type) {
        case "card_error":
        case "validation_error":
          setError(error.message);
          break;
        case "invalid_request_error":
          setError(error.message);
          break;
        default:
          setError("Si è verificato un errore");
      }
      if (onCheckout) {
        onCheckout();
      }
      setIsLoading(false);
    };

    // Handler per Express Checkout Element (Google Pay, Apple Pay, etc.)
    const handleExpressCheckoutConfirm = async () => {
      if (!privacyChecked) {
        setError("Devi accettare le condizioni generali d'acquisto");
        return;
      }

      setIsLoading(true);
      setError(undefined);

      // Salva l'order ID nel localStorage PRIMA del redirect di Stripe
      if (pendingOrder) {
        console.log("Setting completed-order in localStorage", pendingOrder.id.toString());
        localStorage.setItem("completed-order", pendingOrder.id.toString());
      }
    };

    return (
      <form id="checkout-form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ width: "100%", my: 2 }}>
            <AlertTitle>Errore</AlertTitle>
            {error}
          </Alert>
        )}

        {paymentMethod === "google_pay" ? (
          // Usa ExpressCheckoutElement solo per Google Pay
          <>
            <Box sx={{ mb: 2 }}>
              <Alert severity="info">
                <AlertTitle>Google Pay</AlertTitle>
                Per utilizzare Google Pay devi:
                <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                  <li>Usare Chrome o un browser compatibile</li>
                  <li>Avere configurato Google Pay sul tuo dispositivo</li>
                  <li>Aggiungere almeno una carta a Google Pay</li>
                </ul>
              </Alert>
            </Box>
            <ExpressCheckoutElement
              onConfirm={handleExpressCheckoutConfirm}
              onReady={(element) => {
                console.log("ExpressCheckoutElement ready - Google Pay available");
                setExpressCheckoutReady(true);
                onReady && onReady(element as any);
              }}
              onClick={() => {
                console.log("Google Pay button clicked");
                if (!privacyChecked) {
                  setError("Devi accettare le condizioni generali d'acquisto");
                  return;
                }
                setError(undefined);
              }}
              onLoadError={(event: any) => {
                console.error("ExpressCheckoutElement load error:", event);
                setError("Google Pay non è disponibile su questo dispositivo. Prova con un altro metodo di pagamento.");
              }}
              options={{
                buttonType: {
                  googlePay: 'buy' as const,
                },
              }}
            />
            {!expressCheckoutReady && (
              <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                Caricamento Google Pay...
              </Box>
            )}
          </>
        ) : (
          // Usa PaymentElement standard per carte, Klarna, PayPal
          <>
            <PaymentElement
              id="payment-element"
              onChange={async (event: StripePaymentElementChangeEvent) => {
                if (onChange) await onChange(event.value.type);
              }}
              options={{
                layout: "accordion"
              }}
              onReady={(element) => {
                onReady && onReady(element);
              }}
              onLoadError={async ({ error }) => {
                setError(error.message);
              }}
            />
            <Grid container>
              <Grid item></Grid>
            </Grid>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              my={2}>
              <Button
                className={`${buttonStyles[paymentMethod as keyof typeof buttonStyles]?.style || buttonStyles.card.style} w-full`}
                variant="contained"
                type="submit"
                ref={ref}
                disabled={isLoading || !stripe || !elements || !privacyChecked}
                id="submit">
                <span id="button-text">{isLoading ? <div className="spinner" id="spinner"></div> : (buttonStyles[paymentMethod as keyof typeof buttonStyles]?.text || buttonStyles.card.text)}</span>
              </Button>
            </Box>
          </>
        )}
      </form>
    );
  }
);

export default CheckoutForm;
