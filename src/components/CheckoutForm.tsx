import React, { MutableRefObject, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from "@stripe/stripe-js";
import { Alert, AlertTitle, Box, Button, Grid } from "@mui/material";

type CheckoutFormProps = {
  thankYouPage?: string;
  onReady?: (element: StripePaymentElement) => any;
  onCheckout?: () => void;
  onChange?: (payment_method: string) => void;
  ref?: MutableRefObject<HTMLButtonElement | null>;
};
const CheckoutForm = React.forwardRef<HTMLButtonElement, CheckoutFormProps>(
  ({ onReady, thankYouPage = "/thank-you-page", onCheckout, onChange}, ref) => {
    const stripe = useStripe();
    const elements = useElements();

    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e: { preventDefault: () => void }) => {
      setError(undefined);
      e.preventDefault();

      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }

      setIsLoading(true);

      // data.clearCachedPaymentIntent({wc_order_key: ''})
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: window.location.origin + thankYouPage
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
          sx={{ height: 0, overflow: "hidden" }}
          my={2}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            ref={ref}
            disabled={isLoading || !stripe || !elements}
            id="submit">
            <span id="button-text">{isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}</span>
          </Button>
        </Box>
      </form>
    );
  }
);

export default CheckoutForm;
