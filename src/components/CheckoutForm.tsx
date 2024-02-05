import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { StripePaymentElement } from "@stripe/stripe-js";
import { Box, Button } from "@mui/material";

type CheckoutFormProps = {
  onReady?: (element: StripePaymentElement) => any;
};
const CheckoutForm: React.FC<CheckoutFormProps> = ({ onReady }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string>();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
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
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="checkout-form" onSubmit={handleSubmit}>
      <PaymentElement
        id="payment-element"
        onReady={(element) => {
          onReady && onReady(element);
          setIsReady(true);
        }}
      />
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" my={2}>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          disabled={isLoading || !stripe || !elements || !isReady}
          id="submit">
          <span id="button-text">{isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}</span>
        </Button>
        {message && <div id="payment-message">{message}</div>}
      </Box>
    </form>
  );
};

export default CheckoutForm;
