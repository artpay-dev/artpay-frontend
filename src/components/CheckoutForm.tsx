import React, { MutableRefObject, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from "@stripe/stripe-js";
import { Alert, AlertTitle, Box, Button, Grid } from "@mui/material";
import { useDirectPurchase } from "../features/directpurchase";
import { useEnvDetector } from "../utils.ts";
import { useData } from "../hoc/DataProvider.tsx";
import { usePurchaseHandlers } from "../hooks/usePurchaseHandlers.ts";

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

    const {privacyChecked, pendingOrder, orderMode, handlePurchase} = useDirectPurchase()

    const environment = useEnvDetector();

    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const returnUrl: Record<any, any> = {
      local:
        (orderMode == "loan"
          ? "http://localhost:5173/opera-bloccata"
          : "http://localhost:5173/acquisto?order=" + pendingOrder?.id) ,
      staging: "https://staging2.artpay.art/acquisto?order=" + pendingOrder?.id,
      production: "https://artpay.art/acquisto?order=" + pendingOrder?.id,
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
          return_url: environment ? returnUrl[environment] : returnUrl.local,
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

    return (
      <form id="checkout-form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ width: "100%", my: 2 }}>
            <AlertTitle>Errore</AlertTitle>
            {error}
          </Alert>
        )}
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
      </form>
    );
  }
);

export default CheckoutForm;
