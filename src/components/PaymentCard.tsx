import React from "react";
import { PiCreditCardThin } from "react-icons/pi";
import { Box } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm.tsx";
import ContentCard from "./ContentCard.tsx";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { useTheme } from "@mui/material";
import { PaymentIntent, StripePaymentElement } from "@stripe/stripe-js";
import StripePaymentSkeleton from "./StripePaymentSkeleton.tsx";

export interface PaymentCardProps {
  tabTitles?: string[]; // Nuova proprietà per i titoli delle tab
  onReady?: (element: StripePaymentElement) => any;
  onCheckout?: () => void;
  onChange?: (payment_method: string) => void;
  checkoutButtonRef?: React.RefObject<HTMLButtonElement>;
  paymentIntent?: PaymentIntent;
  auction?: boolean;
  thankYouPage?: string;
  orderMode: string;
  paymentMethod: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  paymentIntent,
  onReady,
  onCheckout,
  onChange,
  checkoutButtonRef,
  thankYouPage,
  paymentMethod,
}) => {
  const payments = usePayments();
  const theme = useTheme();

  if (!paymentIntent) return <StripePaymentSkeleton />;


  return (
    <ContentCard
      title="Scegli la soluzione di pagamento che preferisci"
      icon={<PiCreditCardThin size="28px" />}
      contentPadding={0}
      contentPaddingMobile={0}>
      {/* Tabs for switching payment methods */}


      <Box>
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
      </Box>
      <div>
        <div
          className="bg-[#FAFAFB] rounded-lg p-4 cursor-pointer transition-colors "
          onClick={() => {}}
        >
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              name="payment-method"
              value="Santander"
              className="w-4 h-4 text-blue-600 border-[#CDCFD3] focus:ring-blue-500 cursor-pointer"
              checked={paymentMethod === "Santander"}
              onChange={(e) => onChange?.(e.target.value)}
            />
            <label className={`${paymentMethod === "Santander" ? "text-[#007AFF]" : "text-[#808791] "} text-sm font-semibold cursor-pointer flex space-x-5 flex items-center`}>
              <svg width="24" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#EA1D25" />
                <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
                <path
                  d="M19.6526 10.2795C19.9083 10.6554 20.0362 11.0892 20.0682 11.5229C22.4334 12.0723 24.0315 13.2578 23.9995 14.559C23.9995 16.4675 20.8672 18 16.9998 18C13.1323 18 10 16.4675 10 14.559C10 13.2 11.6301 12.0145 13.9633 11.4651C13.9633 11.9855 14.0912 12.506 14.3788 12.9687L16.5843 16.4096C16.7441 16.6699 16.8719 16.959 16.9358 17.2482L17.0317 17.1036C17.5751 16.2651 17.5751 15.1952 17.0317 14.3566L15.2738 11.6096C14.7304 10.7422 14.7304 9.7012 15.2738 8.86265L15.3697 8.71807C15.4336 9.00723 15.5615 9.29639 15.7213 9.55663L16.7441 11.1759L18.3422 13.6916C18.502 13.9518 18.6298 14.241 18.6938 14.5301L18.7897 14.3855C19.333 13.547 19.333 12.4771 18.7897 11.6386L17.0317 8.89157C16.4884 8.05301 16.4884 6.98313 17.0317 6.14458L17.1276 6C17.1915 6.28916 17.3194 6.57831 17.4792 6.83855L19.6526 10.2795Z"
                  fill="white"
                />
              </svg>
             <span> Santander</span>
            </label>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

export default PaymentCard;
