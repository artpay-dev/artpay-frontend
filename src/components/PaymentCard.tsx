import React from "react";
import { PiCreditCardThin } from "react-icons/pi";
import {   Box } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm.tsx";
import ContentCard from "./ContentCard.tsx";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { useTheme } from "@mui/material";
import { PaymentIntent, StripePaymentElement } from "@stripe/stripe-js";

export interface PaymentCardProps {
  tabTitles: string[]; // Nuova proprietà per i titoli delle tab
  onReady?: (element: StripePaymentElement) => any;
  onCheckout?: () => void;
  onChange?: (payment_method: string) => void;
  checkoutButtonRef?: React.RefObject<HTMLButtonElement>;
  paymentIntent?: PaymentIntent;
  auction?: boolean;
  thankYouPage?: string;
  orderMode: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  paymentIntent,
  onReady,
  onCheckout,
  onChange,
  checkoutButtonRef,
  thankYouPage,
}) => {
  const payments = usePayments();
  const theme = useTheme();


  return (
    <ContentCard
      title="Scegli la soluzione di pagamento che preferisci"
      icon={<PiCreditCardThin size="28px" />}
      contentPadding={0}
      contentPaddingMobile={0}>
      {/* Tabs for switching payment methods */}


      <Box> {paymentIntent && (
              /*<Elements
                stripe={payments.stripe}
                options={{
                  clientSecret: paymentIntent.client_secret || undefined,
                  loader: "always",
                  appearance: {
                    theme: "stripe",
                    variables: {
                      borderRadius: "24px",
                    },
                    rules: {
                      ".AccordionItem": {
                        border: "none",
                        paddingLeft: "24px",
                        paddingRight: "24px",
                      },
                      ".Input:focus": {
                        boxShadow: "none",
                        borderColor: theme.palette.primary.main,
                        borderWidth: "2px",
                      },
                      ".Input:hover": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  },
                }}>*/
              <Elements
                stripe={payments.stripe}
                options={{
                  clientSecret: paymentIntent.client_secret || undefined,
                  loader: "always",
                  appearance: {
                    theme: "flat",
                    variables: {
                      gridColumnSpacing: "24px",
                      colorBackground: "#fff",
                      colorText: "#808791",
                    },
                    rules:{
                      ".AccordionItem": {
                        border: "none",
                        backgroundColor: "#FAFAFB",
                      },
                      ".Input": {
                        border: "1px solid #CDCFD3"
                      },
                      ".Input:focus": {
                        boxShadow: "none",
                        borderColor: theme.palette.primary.main,
                        borderWidth: "2px",
                      },
                      ".Input:hover": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  },
                }}>
                <CheckoutForm
                  ref={checkoutButtonRef}
                  onReady={onReady}
                  onCheckout={onCheckout}
                  onChange={onChange}
                  thankYouPage={thankYouPage}
                />
              </Elements>
            )}
      </Box>
    </ContentCard>
  );
};

export default PaymentCard;
