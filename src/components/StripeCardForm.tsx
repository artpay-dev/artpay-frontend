import React, { MutableRefObject, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from "@stripe/stripe-js";
import { Alert, AlertTitle, Box, Button, Grid } from "@mui/material";

type StripeCardFormProps = {
  thankYouPage?: string;
  onReady?: (element: StripePaymentElement) => any;
  onCheckout?: () => void;
  onChange?: (payment_method: string) => void;
  ref?: MutableRefObject<HTMLButtonElement | null>;
};

const StripeCardForm = React.forwardRef<HTMLButtonElement, StripeCardFormProps>(
  ({ onReady, thankYouPage = "/thank-you-page", onCheckout, onChange}, ref) => {
    const stripe = useStripe();
    const elements = useElements();

    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void }) => {
      setError(undefined);
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setIsLoading(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + thankYouPage
        }
      });

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
      <form id="stripe-card-form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ width: "100%", my: 2 }}>
            <AlertTitle>Errore</AlertTitle>
            {error}
          </Alert>
        )}
        <PaymentElement
          id="payment-element-card"
          onChange={async (event: StripePaymentElementChangeEvent) => {
            if (onChange) await onChange(event.value.type);
          }}
          options={{
            layout: "accordion",
            wallets: {
              applePay: 'never',
              googlePay: 'never'
            },
            fields: {
              billingDetails: 'auto'
            },
            paymentMethodOrder: ['card', 'sepa_debit']
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
            id="submit-card">
            <span id="button-text">{isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}</span>
          </Button>
        </Box>
      </form>
    );
  }
);

export default StripeCardForm;