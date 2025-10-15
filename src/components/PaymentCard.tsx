import React, { useState } from "react";
import { PiCreditCardThin } from "react-icons/pi";
import { Box, Typography, Button } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm.tsx";
import ContentCard from "./ContentCard.tsx";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { useTheme } from "@mui/material";
import { PaymentIntent, StripePaymentElement } from "@stripe/stripe-js";
import StripePaymentSkeleton from "./StripePaymentSkeleton.tsx";
import PaymentProviderCard from "../features/cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import Checkbox from "./Checkbox.tsx";
import { Link } from "react-router-dom";
import { useDirectPurchase } from "../features/directpurchase";
import { useDirectPurchaseUtils } from "../features/directpurchase/hooks/useDirectPurchaseUtils";
import { useData } from "../hoc/DataProvider.tsx";

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

const providerCardStyles = {
  card: {
    style: "!bg-[#EAF0FF] ",
    bgColor: "#EAF0FF",
  },
  klarna: {
    style: "!bg-[#FFE9EE] ",
    bgcolor: "#FFE9EE",
  },
};

const PaymentCard: React.FC<PaymentCardProps> = ({
  paymentIntent,
  onReady,
  onCheckout,
  onChange,
  checkoutButtonRef,
  thankYouPage,
  paymentMethod = "",
}) => {
  const payments = usePayments();
  const theme = useTheme();
  const data = useData();

  const { privacyChecked, updateState, isSaving, pendingOrder, orderMode, updatePageData } = useDirectPurchase();
  const { onCancelPaymentMethod } = useDirectPurchaseUtils();

  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplying, setIsCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Inserisci un codice coupon");
      return;
    }

    if (!pendingOrder?.id) {
      setCouponError("Ordine non trovato");
      return;
    }

    setIsCouponApplying(true);
    setCouponError("");

    try {
      // Applica il coupon all'ordine
      const updatedOrder = await data.updateOrder(pendingOrder.id, {
        coupon_lines: [{ code: couponCode.trim() }],
      });

      // Aggiorna il payment intent con il nuovo totale se esiste già un payment method
      if (pendingOrder.order_key && paymentMethod) {
        const updatedPaymentIntent = await data.updatePaymentIntent({
          wc_order_key: pendingOrder.order_key,
          payment_method: paymentMethod,
        });
        updatePageData({ paymentIntent: updatedPaymentIntent });
      }

      // Aggiorna lo stato locale
      updatePageData({ pendingOrder: updatedOrder });
      setAppliedCoupon(couponCode);
      setCouponCode("");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || "Coupon non valido";
      setCouponError(errorMessage);
      setAppliedCoupon(null);
    } finally {
      setIsCouponApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!pendingOrder?.id) {
      return;
    }

    setIsCouponApplying(true);
    try {
      // Rimuovi il coupon dall'ordine
      const updatedOrder = await data.updateOrder(pendingOrder.id, {
        coupon_lines: [],
      });

      // Aggiorna il payment intent con il totale originale se esiste già un payment method
      if (pendingOrder.order_key && paymentMethod) {
        const updatedPaymentIntent = await data.updatePaymentIntent({
          wc_order_key: pendingOrder.order_key,
          payment_method: paymentMethod,
        });
        updatePageData({ paymentIntent: updatedPaymentIntent });
      }

      // Aggiorna lo stato locale
      updatePageData({ pendingOrder: updatedOrder });
      setAppliedCoupon(null);
      setCouponError("");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || "Errore nella rimozione del coupon";
      setCouponError(errorMessage);
    } finally {
      setIsCouponApplying(false);
    }
  };

  if (!paymentIntent) return <StripePaymentSkeleton />;

  return (
    <ContentCard title="Pagamento" icon={<PiCreditCardThin size="28px" />} contentPadding={0} contentPaddingMobile={0}>
      {/* Tabs for switching payment methods */}

      <PaymentProviderCard
        cardTitle={paymentMethod == "card" ? "Carta di credito" : "Klarna"}
        backgroundColor={providerCardStyles[paymentMethod as keyof typeof providerCardStyles]?.style}
        icon={
          paymentMethod == "card" ? (
            <>
              <svg width="160" height="24" viewBox="0 0 160 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="42.5" y="0.5" width="33" height="23" rx="3.5" fill="white" />
                <rect x="42.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
                <path
                  d="M63.5771 5.02997C67.322 5.02997 70.3584 8.02986 70.3584 11.7302C70.3583 15.4304 67.322 18.4304 63.5771 18.4304C61.8982 18.4303 60.3629 17.8256 59.1787 16.8268C57.9945 17.8254 56.4591 18.4304 54.7803 18.4304C51.0357 18.4301 48.0001 15.4302 48 11.7302C48 8.02999 51.0356 5.03019 54.7803 5.02997C56.459 5.02997 57.9945 5.63405 59.1787 6.63251C60.3628 5.63388 61.8984 5.03007 63.5771 5.02997Z"
                  fill="#ED0006"
                />
                <path
                  d="M63.5771 5.02997C67.322 5.02997 70.3584 8.02986 70.3584 11.7302C70.3583 15.4304 67.322 18.4304 63.5771 18.4304C61.8985 18.4303 60.3638 17.8253 59.1797 16.8268C60.6369 15.598 61.5624 13.7715 61.5625 11.7302C61.5625 9.6886 60.6371 7.86141 59.1797 6.63251C60.3637 5.63417 61.8986 5.03007 63.5771 5.02997Z"
                  fill="#F9A000"
                />
                <path
                  d="M59.1787 6.63251C60.6362 7.86141 61.5615 9.6886 61.5615 11.7302C61.5615 13.7715 60.636 15.598 59.1787 16.8268C57.7217 15.598 56.7969 13.7713 56.7969 11.7302C56.7969 9.68882 57.7215 7.8614 59.1787 6.63251Z"
                  fill="#FF5E00"
                />
                <rect x="84.5" y="0.5" width="33" height="23" rx="3.5" fill="#1F72CD" />
                <rect x="84.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M90.0952 8.5L86.9141 15.7467H90.7223L91.1944 14.5913H92.2735L92.7457 15.7467H96.9375V14.8649L97.311 15.7467H99.4793L99.8528 14.8462V15.7467H108.571L109.631 14.6213L110.623 15.7467L115.101 15.7561L111.91 12.1436L115.101 8.5H110.693L109.661 9.60463L108.699 8.5H99.2156L98.4013 10.3704L97.5678 8.5H93.7675V9.35186L93.3447 8.5H90.0952ZM90.8324 9.52905H92.6887L94.7987 14.4431V9.52905H96.8322L98.462 13.0524L99.964 9.52905H101.987V14.7291H100.756L100.746 10.6544L98.9512 14.7291H97.8499L96.0449 10.6544V14.7291H93.5121L93.032 13.5633H90.4378L89.9586 14.728H88.6016L90.8324 9.52905ZM108.12 9.52905H103.113V14.726H108.042L109.631 13.0036L111.162 14.726H112.762L110.436 12.1426L112.762 9.52905H111.231L109.651 11.2316L108.12 9.52905ZM91.7355 10.4089L90.8809 12.4857H92.5892L91.7355 10.4089ZM104.35 11.555V10.6057V10.6048H107.473L108.836 12.1229L107.413 13.6493H104.35V12.613H107.081V11.555H104.35Z"
                  fill="white"
                />
                <rect x="126.5" y="0.5" width="33" height="23" rx="3.5" fill="white" />
                <rect x="126.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M136.751 15.8582H134.691L133.147 9.79235C133.073 9.51332 132.918 9.26664 132.689 9.15038C132.117 8.85821 131.488 8.62568 130.801 8.50841V8.27487H134.119C134.577 8.27487 134.92 8.62568 134.978 9.0331L135.779 13.4086L137.838 8.27487H139.84L136.751 15.8582ZM140.985 15.8581H139.04L140.642 8.27478H142.587L140.985 15.8581ZM145.103 10.3757C145.161 9.96725 145.504 9.73372 145.905 9.73372C146.535 9.67508 147.22 9.79235 147.793 10.0835L148.136 8.45079C147.564 8.21725 146.934 8.09998 146.363 8.09998C144.475 8.09998 143.101 9.15038 143.101 10.6082C143.101 11.7173 144.074 12.2996 144.761 12.6504C145.504 13.0002 145.79 13.2337 145.733 13.5835C145.733 14.1082 145.161 14.3418 144.589 14.3418C143.902 14.3418 143.215 14.1669 142.587 13.8747L142.243 15.5084C142.93 15.7996 143.673 15.9169 144.36 15.9169C146.477 15.9745 147.793 14.9251 147.793 13.35C147.793 11.3664 145.103 11.2502 145.103 10.3757ZM154.6 15.8581L153.056 8.27478H151.397C151.053 8.27478 150.71 8.50832 150.595 8.85812L147.735 15.8581H149.738L150.138 14.7501H152.598L152.827 15.8581H154.6ZM151.684 10.317L152.255 13.1751H150.653L151.684 10.317Z"
                  fill="#172B85"
                />
                <defs>
                  <clipPath id="clip0_935_2">
                    <rect width="16" height="16" fill="white" transform="translate(9 4)" />
                  </clipPath>
                </defs>
              </svg>
            </>
          ) : (
            <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#FEB4C7" />
              <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
              <path
                d="M13.6396 10.8447C14.0986 10.8447 14.5244 10.9945 14.877 11.249V10.9668H16.125V15.3779H14.877V15.0957C14.5244 15.3502 14.0986 15.5 13.6396 15.5C12.4252 15.5 11.4406 14.4581 11.4404 13.1729C11.4404 11.8874 12.425 10.8448 13.6396 10.8447ZM26.8047 10.8447C27.2637 10.8447 27.6895 10.9945 28.042 11.249V10.9668H29.29V15.3779H28.042V15.0957C27.6895 15.3502 27.2637 15.5 26.8047 15.5C25.5902 15.5 24.6057 14.4581 24.6055 13.1729C24.6055 11.8874 25.5901 10.8448 26.8047 10.8447ZM30.6143 13.8135C31.0466 13.8137 31.3975 14.185 31.3975 14.6426C31.3972 15.0999 31.0464 15.4705 30.6143 15.4707C30.1819 15.4707 29.8313 15.1 29.8311 14.6426C29.8311 14.1848 30.1818 13.8135 30.6143 13.8135ZM5.26855 9V15.3799H3.88477V9H5.26855ZM8.72266 9C8.72266 10.3811 8.21382 11.6661 7.30762 12.6211L9.21973 15.3799H7.51172L5.43359 12.3818L5.96973 11.957C6.85897 11.2521 7.36914 10.174 7.36914 9H8.72266ZM10.9287 15.3779H9.62207V9.00098H10.9287V15.3779ZM18.0547 11.542C18.3048 11.1974 18.7716 10.9678 19.2783 10.9678V12.251C19.2733 12.2509 19.2677 12.25 19.2627 12.25C18.769 12.2502 18.0577 12.6239 18.0576 13.3184V15.3779H16.7773V10.9668H18.0547V11.542ZM22.3877 10.8486C23.3929 10.8487 24.1641 11.5468 24.1641 12.5732V15.3779H22.918V13.0508C22.918 12.4074 22.6021 12.0605 22.0537 12.0605C21.5421 12.0606 21.1173 12.3891 21.1172 13.0596V15.3779H19.8594V10.9668H21.1016V11.4639C21.417 11.012 21.8892 10.8486 22.3877 10.8486ZM13.7422 12.0381C13.1177 12.0381 12.6113 12.5461 12.6113 13.1729C12.6115 13.7995 13.1179 14.3076 13.7422 14.3076C14.3666 14.3076 14.8729 13.7995 14.873 13.1729C14.873 12.5461 14.3667 12.0381 13.7422 12.0381ZM26.9072 12.0381C26.2827 12.0381 25.7764 12.5461 25.7764 13.1729C25.7766 13.7995 26.2828 14.3076 26.9072 14.3076C27.5316 14.3076 28.0379 13.7995 28.0381 13.1729C28.0381 12.5461 27.5317 12.0381 26.9072 12.0381Z"
                fill="#17120F"
              />
            </svg>
          )
        }>
        <div className={"space-y-4 py-6 border-t border-b border-gray-950/20"}>
          <div className="flex items-center justify-between">
            <span className={"font-semibold"}>
              <span>Prezzo</span>
              <br />
              <span className={"text-secondary text-sm font-light"}>Incluse commissioni artpay</span>
            </span>
            <span>
              €&nbsp;
              {paymentMethod == "klarna"
                ? (
                    +(pendingOrder?.total || 0) -
                    +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total || 0) -
                    +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total_tax || 0)
                  ).toFixed(2)
                : (Number(pendingOrder?.total) || 0).toLocaleString("it-IT", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </span>
          </div>
          {orderMode == "loan" && (
            <>
              <div className="flex items-center justify-between">
                <span className={"font-semibold"}>
                  <span>Caparra</span>
                </span>
                <span>5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={"font-semibold"}>
                  <span>Totale da pagare ora</span>
                </span>
                <span>
                  €&nbsp;
                  {paymentMethod == "klarna"
                    ? (
                        +(pendingOrder?.total || 0) -
                        +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total || 0) -
                        +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total_tax || 0)
                      ).toFixed(2)
                    : ((Number(paymentIntent?.amount) || 0) / 100).toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </span>
              </div>
            </>
          )}
          {paymentMethod == "klarna" && (
            <>
              <div className="flex items-center justify-between">
                <span>Commissione klarna</span>
                <span>
                  €&nbsp;
                  {(
                    +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total || 0) +
                    +(pendingOrder?.fee_lines.find((fee) => fee.name === "payment-gateway-fee")?.total_tax || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={"font-bold"}>Totale</span>
                <span>€&nbsp;{((paymentIntent?.amount || 0) / 100).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Coupon Section */}
        <div className="py-4 px-6 border-b border-gray-950/20">
          {!appliedCoupon ? (
            <div className="space-y-2">
              <Typography variant="body2" color="textSecondary">
                Hai un coupon?
              </Typography>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Inserisci codice"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    disabled={isCouponApplying || isSaving}
                    className={`w-full px-3 py-2.5 border ${
                      couponError
                        ? "border-red-500"
                        : "border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2"
                    } bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors`}
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                      borderRadius: "12px",
                    }}
                  />
                  {couponError && <p className="text-xs text-red-500 mt-1 ml-1">{couponError}</p>}
                </div>
                <Button
                  variant="contained"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isCouponApplying || isSaving}
                  sx={{
                    minWidth: "100px",
                    textTransform: "none",
                    height: "42px",
                  }}>
                  {isCouponApplying ? "Applica..." : "Applica"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Typography variant="body2" className="font-semibold">
                  Coupon applicato:
                </Typography>
                <Typography variant="body2" className="text-green-600 font-mono">
                  {appliedCoupon}
                </Typography>
              </div>
              <button
                onClick={handleRemoveCoupon}
                disabled={isCouponApplying || isSaving}
                className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                Rimuovi
              </button>
            </div>
          )}
        </div>

        <Box>
          <Elements
            stripe={payments.stripe}
            options={{
              clientSecret: paymentIntent?.client_secret || undefined,
              loader: "always",
              appearance: {
                theme: "flat",
                variables: {
                  gridColumnSpacing: "24px",
                  colorBackground: "#fff",
                  colorText: "#808791",
                },
                rules: {
                  ".StripeElement": {
                    border: "none",
                    backgroundColor: paymentMethod == "klarna" ? "#FFE9EE" : "#EAF0FF",
                  },
                  ".AccordionItem": {
                    border: "none",
                    backgroundColor: paymentMethod == "klarna" ? "#FFE9EE" : "#EAF0FF",
                    padding: "24px",
                  },
                  ".Input": {
                    border: "1px solid #CDCFD3",
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
              paymentMethod={paymentMethod}
              ref={checkoutButtonRef}
              onReady={onReady}
              onCheckout={onCheckout}
              onChange={onChange}
              thankYouPage={thankYouPage}
            />
          </Elements>
        </Box>
        <div className={"w-full flex flex-col items-center gap-"}>
          <button
            className={"cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 mb-4"}
            onClick={onCancelPaymentMethod}
            disabled={isSaving}>
            Annulla
          </button>
          <Checkbox
            disabled={isSaving}
            checked={privacyChecked}
            onChange={(e) => updateState({ privacyChecked: e.target.checked })}
            label={
              <Typography variant="body1">
                Accetto le{" "}
                <Link to="/condizioni-generali-di-acquisto" target="_blank" className={'underline'}>
                  condizioni generali d'acquisto
                </Link>
              </Typography>
            }
          />
        </div>
      </PaymentProviderCard>
    </ContentCard>
  );
};

export default PaymentCard;
