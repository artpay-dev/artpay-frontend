import React, { MutableRefObject, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { StripePaymentElement } from "@stripe/stripe-js";
import { Alert, AlertTitle, Box, Button, Grid } from "@mui/material";

type CheckoutFormProps = {
  onReady?: (element: StripePaymentElement) => any;
  ref?: MutableRefObject<HTMLFormElement | null>;
};
const CheckoutForm = React.forwardRef<HTMLFormElement, CheckoutFormProps>(({ onReady }, ref) => {
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.origin + "/thank-you-page", //TODO: thank you page pagamenti
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setError(error.message);
    } else {
      setError("Si è verificato un errore");
    }

    setIsLoading(false);
  };

  return (
    <form id="checkout-form" ref={ref} onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ width: "100%", my: 2 }}>
          <AlertTitle>Errore</AlertTitle>
          {error}
        </Alert>
      )}
      <PaymentElement
        id="payment-element"
        options={{
          layout: "accordion",
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
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" my={2}>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          disabled={isLoading || !stripe || !elements}
          id="submit">
          <span id="button-text">{isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}</span>
        </Button>
      </Box>
    </form>
  );
});

export default CheckoutForm;
