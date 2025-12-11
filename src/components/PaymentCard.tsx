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
import { useNavigate } from "react-router-dom";
import useDirectPurchaseStore from "../features/directpurchase/stores/directPurchaseStore.ts";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";
import { useDialogs } from "../hoc/DialogProvider.tsx";

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
  paypal: {
    style: "!bg-[#E8F4FD] ",
    bgcolor: "#E8F4FD",
  },
  revolut_pay: {
    style: "!bg-[#E3F2FF] ",
    bgcolor: "#E3F2FF",
  },
  google_pay: {
    style: "!bg-[#F0F0F0] ",
    bgcolor: "#F0F0F0",
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
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const { reset } = useDirectPurchaseStore();
  const { refreshOrders } = usePaymentStore();

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

  const handleCancelTransaction = async () => {
    if (!pendingOrder?.id) return;

    const confirmed = await dialogs.yesNo(
      "Annulla transazione",
      "Vuoi davvero uscire? L'opera non rimarrà nel tuo carrello e la transazione verrà annullata.",
      {
        txtYes: "Annulla",
        txtNo: "Resta"
      }
    );

    if (!confirmed) return;

    try {
      updateState({ isSaving: true });

      // Cancella l'ordine
      await data.setOrderStatus(pendingOrder.id, "cancelled");

      // Pulisce il localStorage
      if (pendingOrder?.order_key) {
        const paymentIntentKeys = [
          `payment-intents-${pendingOrder.order_key}`,
          `payment-intents-cds-${pendingOrder.order_key}`,
          `payment-intents-redeem-${pendingOrder.order_key}`,
          `payment-intents-block-${pendingOrder.order_key}`,
          "completed-order"
        ];
        paymentIntentKeys.forEach(key => localStorage.removeItem(key));
      }

      // Resetta lo store
      reset();

      // Refresh ordini
      refreshOrders();

      // Naviga alla dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error cancelling order:", error);
      // Naviga comunque
      navigate("/dashboard");
    } finally {
      updateState({ isSaving: false });
    }
  };

  if (!paymentIntent) return <StripePaymentSkeleton />;

  return (
    <ContentCard title="Pagamento" icon={<PiCreditCardThin size="28px" />} contentPadding={0} contentPaddingMobile={0}>
      {/* Tabs for switching payment methods */}

      <PaymentProviderCard
        cardTitle={
          paymentMethod == "card"
            ? "Carta di credito"
            : paymentMethod == "klarna"
            ? "Klarna"
            : paymentMethod == "paypal"
            ? "PayPal"
            : paymentMethod == "revolut_pay"
            ? "Revolut Pay"
            : paymentMethod == "google_pay"
            ? "Google Pay"
            : "Pagamento"
        }
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
          ) : paymentMethod == "klarna" ? (
            <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#FEB4C7" />
              <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
              <path
                d="M13.6396 10.8447C14.0986 10.8447 14.5244 10.9945 14.877 11.249V10.9668H16.125V15.3779H14.877V15.0957C14.5244 15.3502 14.0986 15.5 13.6396 15.5C12.4252 15.5 11.4406 14.4581 11.4404 13.1729C11.4404 11.8874 12.425 10.8448 13.6396 10.8447ZM26.8047 10.8447C27.2637 10.8447 27.6895 10.9945 28.042 11.249V10.9668H29.29V15.3779H28.042V15.0957C27.6895 15.3502 27.2637 15.5 26.8047 15.5C25.5902 15.5 24.6057 14.4581 24.6055 13.1729C24.6055 11.8874 25.5901 10.8448 26.8047 10.8447ZM30.6143 13.8135C31.0466 13.8137 31.3975 14.185 31.3975 14.6426C31.3972 15.0999 31.0464 15.4705 30.6143 15.4707C30.1819 15.4707 29.8313 15.1 29.8311 14.6426C29.8311 14.1848 30.1818 13.8135 30.6143 13.8135ZM5.26855 9V15.3799H3.88477V9H5.26855ZM8.72266 9C8.72266 10.3811 8.21382 11.6661 7.30762 12.6211L9.21973 15.3799H7.51172L5.43359 12.3818L5.96973 11.957C6.85897 11.2521 7.36914 10.174 7.36914 9H8.72266ZM10.9287 15.3779H9.62207V9.00098H10.9287V15.3779ZM18.0547 11.542C18.3048 11.1974 18.7716 10.9678 19.2783 10.9678V12.251C19.2733 12.2509 19.2677 12.25 19.2627 12.25C18.769 12.2502 18.0577 12.6239 18.0576 13.3184V15.3779H16.7773V10.9668H18.0547V11.542ZM22.3877 10.8486C23.3929 10.8487 24.1641 11.5468 24.1641 12.5732V15.3779H22.918V13.0508C22.918 12.4074 22.6021 12.0605 22.0537 12.0605C21.5421 12.0606 21.1173 12.3891 21.1172 13.0596V15.3779H19.8594V10.9668H21.1016V11.4639C21.417 11.012 21.8892 10.8486 22.3877 10.8486ZM13.7422 12.0381C13.1177 12.0381 12.6113 12.5461 12.6113 13.1729C12.6115 13.7995 13.1179 14.3076 13.7422 14.3076C14.3666 14.3076 14.8729 13.7995 14.873 13.1729C14.873 12.5461 14.3667 12.0381 13.7422 12.0381ZM26.9072 12.0381C26.2827 12.0381 25.7764 12.5461 25.7764 13.1729C25.7766 13.7995 26.2828 14.3076 26.9072 14.3076C27.5316 14.3076 28.0379 13.7995 28.0381 13.1729C28.0381 12.5461 27.5317 12.0381 26.9072 12.0381Z"
                fill="#17120F"
              />
            </svg>
          ) : paymentMethod == "paypal" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 -139.5 750 750" version="1.1" className="size-10">
              <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="paypal" fillRule="nonzero">
                  <path
                    d="M697.115385,0 L52.8846154,0 C23.7240385,0 0,23.1955749 0,51.7065868 L0,419.293413 C0,447.804425 23.7240385,471 52.8846154,471 L697.115385,471 C726.274038,471 750,447.804425 750,419.293413 L750,51.7065868 C750,23.1955749 726.274038,0 697.115385,0 Z"
                    id="Shape"
                    fill="#FFFFFF"></path>
                  <g id="Group" transform="translate(54.000000, 150.000000)">
                    <path
                      d="M109.272795,8.45777679 C101.24875,2.94154464 90.7780357,0.176741071 77.8606518,0.176741071 L27.8515268,0.176741071 C23.8915714,0.176741071 21.7038036,2.15719643 21.2882232,6.11333036 L0.972553571,133.638223 C0.761419643,134.890696 1.07477679,136.03617 1.90975893,137.077509 C2.73996429,138.120759 3.78416964,138.639518 5.03473214,138.639518 L28.7887321,138.639518 C32.9550446,138.639518 35.2450357,136.663839 35.6653929,132.701973 L41.2905357,98.3224911 C41.4959375,96.6563482 42.2286964,95.3016518 43.4792589,94.2584018 C44.7288661,93.2170625 46.2918304,92.5358929 48.1671964,92.2234911 C50.0425625,91.9139554 51.8109286,91.7582321 53.4808929,91.7582321 C55.1460804,91.7582321 57.124625,91.8633214 59.4203482,92.0706339 C61.7103393,92.2789018 63.170125,92.3801696 63.7958839,92.3801696 C81.7145625,92.3801696 95.7793304,87.3311071 105.991143,77.2224732 C116.198179,67.1176607 121.307429,53.1054375 121.307429,35.1829375 C121.307429,22.8903571 117.293018,13.9826071 109.272795,8.45777679 Z M83.4877054,46.7484911 C82.4425446,54.0426429 79.7369732,58.8328036 75.3614375,61.1256607 C70.9849464,63.4213839 64.7340446,64.5620804 56.6087321,64.5620804 L46.2937411,64.8754375 L51.6083929,31.43125 C52.0230179,29.1412589 53.3767589,27.9948304 55.6705714,27.9948304 L61.6109821,27.9948304 C69.9416964,27.9948304 75.9881518,29.1957143 79.7388839,31.5879286 C83.4877054,33.985875 84.7382679,39.041625 83.4877054,46.7484911 Z"
                      id="Shape"
                      fill="#003087"></path>
                    <path
                      d="M637.026411,0.176741071 L613.899125,0.176741071 C611.601491,0.176741071 610.248705,1.32316964 609.835991,3.61507143 L589.518411,133.638223 L589.205054,134.263027 C589.205054,135.310098 589.622545,136.295071 590.457527,137.233232 C591.286777,138.169482 592.332893,138.638562 593.581545,138.638562 L614.212482,138.638562 C618.16575,138.638562 620.354473,136.662884 620.776741,132.701018 L641.092411,4.86276786 L641.092411,4.55227679 C641.091455,1.63557143 639.732938,0.176741071 637.026411,0.176741071 Z"
                      id="Shape"
                      fill="#009CDE"></path>
                    <path
                      d="M357.599732,50.4973125 C357.599732,49.4578839 357.18033,48.4662232 356.352036,47.5299732 C355.516098,46.5927679 354.576982,46.1217768 353.538509,46.1217768 L329.471152,46.1217768 C327.174473,46.1217768 325.300063,47.1688482 323.845054,49.24675 L290.714223,98.0081786 L276.962812,51.1240268 C275.916696,47.7917411 273.62575,46.1217768 270.086152,46.1217768 L246.641687,46.1217768 C245.597482,46.1217768 244.659321,46.5918125 243.831027,47.5299732 C242.995089,48.4662232 242.580464,49.4588393 242.580464,50.4973125 C242.580464,50.9176696 244.612509,57.0615714 248.674687,68.9385714 C252.736866,80.8174821 257.113357,93.6326429 261.80225,107.38692 C266.491143,121.137375 268.936857,128.434393 269.147036,129.262688 C252.059518,152.602063 243.51767,165.104821 243.51767,166.769054 C243.51767,169.480357 244.871411,170.833143 247.580804,170.833143 L271.648161,170.833143 C273.940062,170.833143 275.814473,169.793714 277.274259,167.709125 L356.976839,52.6850804 C357.391464,52.2704554 357.599732,51.5443839 357.599732,50.4973125 Z"
                      id="Shape"
                      fill="#003087"></path>
                    <path
                      d="M581.704545,46.1217768 L557.948634,46.1217768 C555.030018,46.1217768 553.263562,49.5601071 552.638759,56.4367679 C547.215196,48.1060536 537.323429,43.9330536 522.943393,43.9330536 C507.940464,43.9330536 495.174982,49.5601071 484.655545,60.8123036 C474.13133,72.0654554 468.872089,85.2990625 468.872089,100.508348 C468.872089,112.80475 472.465187,122.597161 479.653295,129.887491 C486.842357,137.185464 496.479045,140.827286 508.568134,140.827286 C514.608857,140.827286 520.755625,139.574813 527.006527,137.076554 C533.258384,134.576384 538.150768,131.244098 541.698964,127.07492 C541.698964,127.284143 541.486875,128.220393 541.073205,129.886536 C540.652848,131.5565 540.447446,132.808973 540.447446,133.637268 C540.447446,136.975286 541.798321,138.637607 544.511536,138.637607 L566.079679,138.637607 C570.032946,138.637607 572.32867,136.661929 572.952518,132.700063 L585.768634,51.1230714 C585.974036,49.8725089 585.661634,48.7279911 584.830473,47.6847411 C583.994536,46.6443571 582.955107,46.1217768 581.704545,46.1217768 Z M540.916527,107.696455 C535.60283,112.906018 529.196205,115.509366 521.694741,115.509366 C515.649241,115.509366 510.756857,113.845134 507.004214,110.509027 C503.252527,107.180563 501.377161,102.595804 501.377161,96.7566607 C501.377161,89.0517054 503.981464,82.5361696 509.191982,77.2224732 C514.395812,71.9087768 520.860714,69.2519286 528.571402,69.2519286 C534.400036,69.2519286 539.245607,70.9715714 543.104295,74.4089464 C546.956295,77.8472768 548.888027,82.5896696 548.888027,88.6323036 C548.887071,96.1328125 546.229268,102.489759 540.916527,107.696455 Z"
                      id="Shape"
                      fill="#009CDE"></path>
                    <path
                      d="M226.639375,46.1217768 L202.885375,46.1217768 C199.963893,46.1217768 198.196482,49.5601071 197.570723,56.4367679 C191.944625,48.1060536 182.04617,43.9330536 167.877268,43.9330536 C152.874339,43.9330536 140.109813,49.5601071 129.588464,60.8123036 C119.06425,72.0654554 113.805009,85.2990625 113.805009,100.508348 C113.805009,112.80475 117.400018,122.597161 124.58908,129.887491 C131.778143,137.185464 141.41292,140.827286 153.500098,140.827286 C159.331598,140.827286 165.378054,139.574813 171.628,137.076554 C177.878902,134.576384 182.880196,131.244098 186.630929,127.07492 C185.794991,129.575089 185.380366,131.763813 185.380366,133.637268 C185.380366,136.975286 186.734107,138.637607 189.4435,138.637607 L211.009732,138.637607 C214.965866,138.637607 217.260634,136.661929 217.886393,132.700063 L230.700598,51.1230714 C230.906,49.8725089 230.593598,48.7279911 229.763393,47.6847411 C228.929366,46.6443571 227.888982,46.1217768 226.639375,46.1217768 Z M185.850402,107.851223 C180.53575,112.962384 174.02117,115.509366 166.316214,115.509366 C160.269759,115.509366 155.425143,113.845134 151.781411,110.509027 C148.132902,107.180563 146.311036,102.595804 146.311036,96.7566607 C146.311036,89.0517054 148.914384,82.5361696 154.125857,77.2224732 C159.331598,71.9087768 165.791723,69.2519286 173.504321,69.2519286 C179.335821,69.2519286 184.180437,70.9715714 188.039125,74.4089464 C191.891125,77.8472768 193.820946,82.5896696 193.820946,88.6323036 C193.820946,96.3420357 191.164098,102.751527 185.850402,107.851223 Z"
                      id="Shape"
                      fill="#003087"></path>
                    <path
                      d="M464.337964,8.45777679 C456.314875,2.94154464 445.846071,0.176741071 432.926777,0.176741071 L383.230054,0.176741071 C379.05992,0.176741071 376.767062,2.15719643 376.353393,6.11333036 L356.037723,133.637268 C355.826589,134.889741 356.138991,136.035214 356.974929,137.076554 C357.802268,138.119804 358.849339,138.638563 360.099902,138.638563 L385.728312,138.638563 C388.228482,138.638563 389.894625,137.285777 390.729607,134.576384 L396.356661,98.3215357 C396.563018,96.6553929 397.292911,95.3006964 398.544429,94.2574464 C399.794991,93.2161071 401.356045,92.5349375 403.233321,92.2225357 C405.107732,91.913 406.876098,91.7572768 408.547018,91.7572768 C410.212205,91.7572768 412.19075,91.8623661 414.483607,92.0696786 C416.775509,92.2779464 418.238161,92.3792143 418.859143,92.3792143 C436.780687,92.3792143 450.843545,87.3301518 461.055357,77.2215179 C471.265259,67.1167054 476.370687,53.1044821 476.370687,35.1819821 C476.371643,22.8903571 472.358187,13.9826071 464.337964,8.45777679 Z M432.301018,59.8750982 C427.716259,63.0000714 420.839598,64.5620804 411.672946,64.5620804 L401.670357,64.8754375 L406.985009,31.43125 C407.397723,29.1412589 408.751464,27.9948304 411.047187,27.9948304 L416.671375,27.9948304 C421.254223,27.9948304 424.900821,28.2030982 427.614036,28.6186786 C430.318652,29.0390357 432.926777,30.3373661 435.426946,32.5251339 C437.929027,34.7138571 439.177679,37.8923304 439.177679,42.0595982 C439.177679,50.8106696 436.882911,56.7482143 432.301018,59.8750982 Z"
                      id="Shape"
                      fill="#009CDE"></path>
                  </g>
                </g>
              </g>
            </svg>
          ) : paymentMethod == "revolut_pay" ? (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-10">
              <rect width="40" height="40" rx="8" fill="#0075EB"/>
              <path d="M14 28V12H20.5C23.5376 12 26 14.4624 26 17.5C26 19.5913 24.7402 21.3846 22.9688 22.1719L26.5 28H23.5L20.5 22.5H17V28H14ZM17 19.5H20.5C21.8807 19.5 23 18.3807 23 17C23 15.6193 21.8807 14.5 20.5 14.5H17V19.5Z" fill="white"/>
            </svg>
          ) : paymentMethod == "google_pay" ? (
            <svg width="40" height="17" viewBox="0 0 40 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-10">
              <path d="M19.0909 8.51136V12.9886H17.5455V0H21.7045C22.7424 0 23.6439 0.369318 24.4091 1.10795C25.1932 1.84659 25.5852 2.72727 25.5852 3.75C25.5852 4.79261 25.1932 5.67329 24.4091 6.39205C23.6439 7.11079 22.7424 7.47011 21.7045 7.47011H19.0909V8.51136ZM19.0909 1.42045V6.04966H21.7424C22.3902 6.04966 22.9432 5.83523 23.4015 5.40625C23.8598 4.95739 24.089 4.40341 24.089 3.74432C24.089 3.10511 23.8598 2.56107 23.4015 2.11222C22.9432 1.66335 22.3902 1.43892 21.7424 1.43892H19.0909V1.42045Z" fill="#5F6368"/>
              <path d="M29.2424 5.03409C30.4924 5.03409 31.4621 5.42614 32.1515 6.21023C32.8409 6.97443 33.1856 8.01989 33.1856 9.34659V12.9886H31.697V12.017H31.6402C30.9508 12.9318 30.0682 13.3892 28.9924 13.3892C28.0227 13.3892 27.197 13.0852 26.5152 12.4773C25.8523 11.8693 25.5208 11.1307 25.5208 10.2614C25.5208 9.35227 25.8712 8.61364 26.572 8.04545C27.2727 7.47727 28.1742 7.19318 29.2765 7.19318C30.2083 7.19318 30.9924 7.38068 31.6288 7.75568V7.35227C31.6288 6.80682 31.4053 6.33523 30.9583 5.9375C30.5303 5.52841 30.0076 5.32386 29.3902 5.32386C28.4394 5.32386 27.697 5.73864 27.1629 6.56818L25.7879 5.73864C26.5341 4.58523 27.6932 4.00852 29.2652 4.00852L29.2424 5.03409ZM27.197 10.3295C27.197 10.7216 27.3636 11.0625 27.697 11.3523C28.0492 11.642 28.4621 11.7869 28.9356 11.7869C29.6061 11.7869 30.2235 11.5114 30.7879 10.9602C31.3712 10.3977 31.6629 9.75 31.6629 9.01705C31.1288 8.60227 30.4205 8.39489 29.5379 8.39489C28.8864 8.39489 28.3333 8.56818 27.8788 8.91477C27.4242 9.26136 27.197 9.72727 27.197 10.3125V10.3295Z" fill="#5F6368"/>
              <path d="M40 5.23864L35.0379 16.7898H33.4659L35.1894 13.1591L31.9697 5.23864H33.6553L36.0985 11.3636H36.1174L38.4697 5.23864H40Z" fill="#5F6368"/>
              <path d="M11.7424 6.73864C11.7424 7.18182 11.7045 7.625 11.6288 8.06818H4.87121C4.96591 8.89773 5.31818 9.58523 5.92803 10.1307C6.53788 10.6761 7.27652 10.9489 8.14394 10.9489C9.25758 10.9489 10.1629 10.5227 10.8523 9.67045L12.0909 10.7102C11.1212 11.8636 9.77651 12.4403 8.04924 12.4403C6.68561 12.4403 5.53788 11.9943 4.60606 11.1023C3.67424 10.2102 3.20833 9.08523 3.20833 7.72727C3.20833 6.38636 3.65909 5.26705 4.56061 4.36932C5.46212 3.47159 6.56818 3.02273 7.87879 3.02273C9.17045 3.02273 10.25 3.46023 11.1136 4.33523C11.9773 5.19034 12.4091 6.30398 12.4091 7.67614C12.4091 7.9375 12.3902 8.20455 12.3523 8.47727L11.7424 6.73864ZM5.09848 6.78977H10.0227C9.90909 6.16477 9.63636 5.65341 9.20454 5.25568C8.69697 4.78977 8.09848 4.55682 7.40909 4.55682C6.73864 4.55682 6.15909 4.78977 5.67045 5.25568C5.23864 5.66477 4.96591 6.17614 4.87121 6.78977H5.09848Z" fill="#5F6368"/>
              <path d="M13.803 8.23864C13.803 6.77841 14.2917 5.54545 15.2689 4.53977C16.2462 3.53409 17.4394 3.03125 18.8485 3.03125C20.2576 3.03125 21.4508 3.53409 22.4281 4.53977C23.4053 5.54545 23.894 6.77841 23.894 8.23864C23.894 9.69886 23.4053 10.9318 22.4281 11.9375C21.4508 12.9432 20.2576 13.446 18.8485 13.446C17.4394 13.446 16.2462 12.9432 15.2689 11.9375C14.2917 10.9318 13.803 9.69886 13.803 8.23864ZM15.4091 8.23864C15.4091 9.21023 15.7538 10.0398 16.4432 10.7273C17.1326 11.4148 17.9318 11.7585 18.8485 11.7585C19.7652 11.7585 20.5644 11.4148 21.2538 10.7273C21.9432 10.0398 22.2879 9.21023 22.2879 8.23864C22.2879 7.26705 21.9432 6.4375 21.2538 5.75C20.5644 5.0625 19.7652 4.71875 18.8485 4.71875C17.9318 4.71875 17.1326 5.0625 16.4432 5.75C15.7538 6.4375 15.4091 7.26705 15.4091 8.23864Z" fill="#5F6368"/>
              <path d="M6.12121 8.23864C6.12121 6.77841 6.60985 5.54545 7.58712 4.53977C8.56439 3.53409 9.75758 3.03125 11.1667 3.03125C12.5758 3.03125 13.7689 3.53409 14.7462 4.53977C15.7235 5.54545 16.2121 6.77841 16.2121 8.23864C16.2121 9.69886 15.7235 10.9318 14.7462 11.9375C13.7689 12.9432 12.5758 13.446 11.1667 13.446C9.75758 13.446 8.56439 12.9432 7.58712 11.9375C6.60985 10.9318 6.12121 9.69886 6.12121 8.23864ZM7.72727 8.23864C7.72727 9.21023 8.07197 10.0398 8.76136 10.7273C9.45076 11.4148 10.25 11.7585 11.1667 11.7585C12.0833 11.7585 12.8826 11.4148 13.572 10.7273C14.2614 10.0398 14.6061 9.21023 14.6061 8.23864C14.6061 7.26705 14.2614 6.4375 13.572 5.75C12.8826 5.0625 12.0833 4.71875 11.1667 4.71875C10.25 4.71875 9.45076 5.0625 8.76136 5.75C8.07197 6.4375 7.72727 7.26705 7.72727 8.23864Z" fill="#5F6368"/>
            </svg>
          ) : null
        }>
        <div className={"space-y-4 py-6 border-t border-gray-950/20"}>
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
                  ).toLocaleString("it-IT", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
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
        {orderMode != "loan" && (
          <div className="pb-4 border-b border-gray-950/20">
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
        )}

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
                    backgroundColor:
                      paymentMethod == "klarna" ? "#FFE9EE" :
                      paymentMethod == "paypal" ? "#E8F4FD" :
                      paymentMethod == "revolut_pay" ? "#E3F2FF" :
                      paymentMethod == "google_pay" ? "#F0F0F0" :
                      "#EAF0FF",
                  },
                  ".AccordionItem": {
                    border: "none",
                    backgroundColor:
                      paymentMethod == "klarna" ? "#FFE9EE" :
                      paymentMethod == "paypal" ? "#E8F4FD" :
                      paymentMethod == "revolut_pay" ? "#E3F2FF" :
                      paymentMethod == "google_pay" ? "#F0F0F0" :
                      "#EAF0FF",
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
            onClick={orderMode === "loan" ? handleCancelTransaction : onCancelPaymentMethod}
            disabled={isSaving}>
            {orderMode === "loan" ? "Annulla transazione" : "Scegli un'altro metodo"}
          </button>
          <Checkbox
            disabled={isSaving}
            checked={privacyChecked}
            onChange={(e) => updateState({ privacyChecked: e.target.checked })}
            label={
              <Typography variant="body1">
                Accetto le{" "}
                <Link to="/condizioni-generali-di-acquisto" target="_blank" className={'underline text-primary'}>
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
