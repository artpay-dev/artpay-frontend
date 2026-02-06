import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import AgreementCheckBox from "../../cdspayments/components/ui/agreementcheckbox/AgreementCheckBox.tsx";
import { useEnvDetector } from "../../../utils.ts";
import { useAuctionCheckout } from "../contexts/AuctionCheckoutContext.tsx";

const AuctionPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const environment = useEnvDetector();

  const {
    order,
    privacyChecked,
    updateState,
    onCancelPaymentMethod,
  } = useAuctionCheckout();

  const [message, setMessage] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);

  const returnUrl: Record<string, string> = {
    local: "http://localhost:5173/landing?order_id=" + order?.order_key,
    staging: "https://staging2.artpay.art/landing?order_id=" + order?.order_key,
    production: "https://artpay.art/landing?order_id=" + order?.order_key,
  };

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ privacyChecked: e.target.checked });
  };

  const handleCancel = async () => {
    await onCancelPaymentMethod();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: environment ? returnUrl[environment] : returnUrl.local,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error?.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "accordion" }} />
      <AgreementCheckBox isChecked={privacyChecked} handleChange={handleCheckBox} />
      <div className={"space-y-6"}>
        <button
          disabled={isLoading || !stripe || !elements || !privacyChecked}
          id="submit"
          className={"artpay-button-style bg-klarna hover:bg-klarna-hover mt-6 disabled:opacity-65"}>
          <span id="button-text">
            {isLoading ? (
              <div
                className="size-4 border border-tertiary border-b-transparent rounded-full animate-spin"
                id="spinner"></div>
            ) : (
              "Paga ora"
            )}
          </span>
        </button>
        <button
          type="button"
          className={"text-secondary artpay-button-style"}
          onClick={handleCancel}>
          Annulla
        </button>
      </div>
      {message && (
        <div id="payment-message" className={"text-red-500 text-sm mt-4"}>
          *{message}
        </div>
      )}
    </form>
  );
};

export default AuctionPaymentForm;