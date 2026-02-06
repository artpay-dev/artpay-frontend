import { Elements } from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import { usePayments } from "../../../hoc/PaymentProvider.tsx";
import PaymentProviderCard from "../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import KlarnaIcon from "../../cdspayments/components/ui/paymentprovidercard/KlarnaIcon.tsx";
import ArtpayIcon from "../../cdspayments/components/ui/paymentprovidercard/ArtpayIcon.tsx";
import AuctionPaymentForm from "./AuctionPaymentForm.tsx";
import { PAYMENT_METHODS } from "../utils/constants.ts";

interface AuctionPaymentCardProps {
  paymentMethod: string;
  paymentIntent: PaymentIntent | null;
}

const AuctionPaymentCard = ({ paymentMethod, paymentIntent }: AuctionPaymentCardProps) => {
  const payments = usePayments();

  if (!paymentIntent) {
    return (
      <PaymentProviderCard
        backgroundColor={"bg-[#F5F5F5]"}
        cardTitle={"Caricamento..."}
        subtitle={"Preparazione form di pagamento..."}>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-300 rounded"></div>
          <div className="h-12 bg-gray-300 rounded"></div>
        </div>
      </PaymentProviderCard>
    );
  }

  const isKlarna = paymentMethod === PAYMENT_METHODS.KLARNA;

  return (
    <PaymentProviderCard
      backgroundColor={isKlarna ? "bg-[#FFE9EE]" : "bg-[#EAF0FF]"}
      cardTitle={isKlarna ? "Klarna" : "Carta di credito"}
      icon={isKlarna ? <KlarnaIcon /> : <ArtpayIcon />}
      subtitle={
        isKlarna
          ? "Paga in 3 rate senza interessi"
          : "Paga con carta di credito o debito"
      }>
      {payments.stripe && (
        <Elements
          stripe={payments.stripe}
          options={{
            clientSecret: paymentIntent.client_secret || undefined,
            loader: "always",
            appearance: {
              theme: "flat",
              variables: {
                colorBackground: "#fff",
                colorTextSecondary: "#808791",
              },
              rules: {
                ".Block": {
                  backgroundColor: isKlarna ? "#FFE9EE" : "#EAF0FF",
                },
              },
            },
          }}>
          <AuctionPaymentForm />
        </Elements>
      )}
    </PaymentProviderCard>
  );
};

export default AuctionPaymentCard;