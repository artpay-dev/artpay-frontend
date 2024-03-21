import React from "react";
import { PiCreditCardThin } from "react-icons/pi";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm.tsx";
import ContentCard from "./ContentCard.tsx";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { useTheme } from "@mui/material";
import { PaymentIntent, StripePaymentElement } from "@stripe/stripe-js";

export interface PaymentCardProps {
  onReady?: (element: StripePaymentElement) => any;
  onCheckout?: () => void;
  checkoutButtonRef?: React.RefObject<HTMLButtonElement>;
  paymentIntent?: PaymentIntent;
  thankYouPage?: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
                                                   paymentIntent,
                                                   onReady,
                                                   onCheckout,
                                                   checkoutButtonRef,
                                                   thankYouPage
                                                 }) => {
  const payments = usePayments();
  const theme = useTheme();

  return (
    <ContentCard
      title="Metodo di pagamento"
      icon={<PiCreditCardThin size="28px" />}
      contentPadding={0}
      contentPaddingMobile={0}>
      {paymentIntent && (
        <Elements
          stripe={payments.stripe}
          options={{
            clientSecret: paymentIntent.client_secret || undefined,
            loader: "always",
            appearance: {
              theme: "stripe",
              variables: {
                borderRadius: "24px"
              },
              rules: {
                ".AccordionItem": {
                  border: "none",
                  paddingLeft: "24px",
                  paddingRight: "24px"
                },
                ".Input:focus": {
                  boxShadow: "none",
                  borderColor: theme.palette.primary.main,
                  borderWidth: "2px"
                },
                ".Input:hover": {
                  borderColor: theme.palette.primary.main
                }
              }
            }
          }}>
          <CheckoutForm ref={checkoutButtonRef} onReady={onReady} onCheckout={onCheckout} thankYouPage={thankYouPage} />
        </Elements>
      )}
    </ContentCard>
  );
};

export default PaymentCard;
