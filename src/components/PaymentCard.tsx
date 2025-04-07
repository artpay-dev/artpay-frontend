import React, { useState } from "react";
import { PiCreditCardThin } from "react-icons/pi";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm.tsx";
import ContentCard from "./ContentCard.tsx";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { useTheme } from "@mui/material";
import { PaymentIntent, StripePaymentElement } from "@stripe/stripe-js";
import LoanCardTab from "./LoanCardTab.tsx";

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
  tabTitles, // Ricezione dei titoli come prop
  paymentIntent,
  onReady,
  onCheckout,
  onChange,
  checkoutButtonRef,
  thankYouPage,
  orderMode,
  auction = false,
}) => {
  const payments = usePayments();
  const theme = useTheme();

  const [selectedTab, setSelectedTab] = useState(0);
  const KLARNA_FEE = 1.064658

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    if (onChange) {
      onChange("Santander");
    }
  };

  if (auction) {
    return (
      <ContentCard
        title="I nostri partner di pagamento"
        icon={<PiCreditCardThin size="28px" />}
        contentPadding={0}
        contentPaddingMobile={0}>
        {/* Tabs for switching payment methods */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth">
          {auction &&
            paymentIntent &&
            paymentIntent?.amount > 150000 &&
            (paymentIntent?.amount * KLARNA_FEE) <= 250000 &&
            tabTitles.map((title, index) => <Tab key={index} label={title} />)}
          {auction && paymentIntent && paymentIntent?.amount <= 150000 && <Tab label={"Klarna"} />}
          {auction && paymentIntent && (paymentIntent?.amount * KLARNA_FEE)  > 250000 && <Tab label={"Santander"} />}
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {(paymentIntent && paymentIntent?.amount > 150000 && (paymentIntent?.amount * KLARNA_FEE) <= 250000) && (
            <Box sx={{ mt: 3 }}>
              {selectedTab === 0 && (
                <>
                  {paymentIntent && (
                    <Elements
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
                </>
              )}

              {selectedTab === 1 && (
                <Box>
                  <Typography variant="body1">
                    <LoanCardTab paymentIntent={paymentIntent}/>
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          {(paymentIntent && (
            (paymentIntent.amount <= 150000) ||
            (paymentIntent.amount >= 250000 && orderMode === "redeem")
          )) && (
            <Elements
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
              }}
            >
              <CheckoutForm
                ref={checkoutButtonRef}
                onReady={onReady}
                onCheckout={onCheckout}
                onChange={onChange}
                thankYouPage={thankYouPage}
              />
            </Elements>
          )}

          {paymentIntent && (paymentIntent.amount * KLARNA_FEE) > 250000 && orderMode !== "redeem" && (
            <Box>
              <Typography variant="body1">
                <LoanCardTab paymentIntent={paymentIntent} />
              </Typography>
            </Box>
          )}
        </Box>
      </ContentCard>
    );
  }

  return (
    <ContentCard
      title="Metodi di pagamento"
      icon={<PiCreditCardThin size="28px" />}
      contentPadding={0}
      contentPaddingMobile={0}>
      {/* Tabs for switching payment methods */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth">
        {tabTitles.map((title, index) => (
          <Tab key={index} label={title} />
        ))}
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && (
          <>
            {paymentIntent && (
              <Elements
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
          </>
        )}

        {selectedTab === 1 && (
          <Box>
            <Typography variant="body1">
              <LoanCardTab paymentIntent={paymentIntent} />
            </Typography>
          </Box>
        )}
      </Box>
    </ContentCard>
  );
};

export default PaymentCard;
