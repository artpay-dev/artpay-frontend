import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import AgreementCheckBox from "../agreementcheckbox/AgreementCheckBox.tsx";
import { useEnvDetector } from "../../../../../utils.ts";
import usePaymentStore from "../../../stores/paymentStore.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";

const PaymentForm = () => {
  const {setPaymentData} = usePaymentStore()

  const data = useData();

  const stripe = useStripe();
  const elements = useElements();
  const {order} = usePaymentStore()

  const environment = useEnvDetector();

  const [message, setMessage] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const returnUrl:Record<any, any> = {
    local: "http://localhost:5173/acquisto-esterno?order=" + order?.id,
    staging: "https://staging2.artpay.art/acquisto-esterno?order=" + order?.id,
    production: "http://artpay.art/acquisto-esterno?order=" + order?.id,
  };

  const handleDeleteOrder = async () => {
    setPaymentData({
      loading: true,
    });
    try {
      if (!order) return;

      const restoreToOnHold = await data.updateOrder(order?.id, {
        status: "on-hold",
        payment_method: "bnpl",
        customer_note: "",
      });
      if (!restoreToOnHold) throw Error("Error updating order to on-hold");
      console.log("Order restore to on-hold");

      setPaymentData({
        order: restoreToOnHold,
        paymentStatus: "on-hold",
        paymentMethod: "bnpl",
        orderNote: "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: environment ? returnUrl[environment] : returnUrl.local,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
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
      <AgreementCheckBox isChecked={isChecked} handleChange={handleCheckBox} />
      <div className={'space-y-6'}>
        <button
          disabled={isLoading || !stripe || !elements || !isChecked}
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
        <button className={"text-secondary artpay-button-style"} onClick={handleDeleteOrder}>
          Annulla
        </button>
      </div>
      {/* Show any error or success messages */}
      {message && <div id="payment-message " className={'text-red-500 text-sm mt-4'}>*{message}</div>}
    </form>
  );
};

export default PaymentForm;
