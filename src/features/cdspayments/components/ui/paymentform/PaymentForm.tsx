import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import AgreementCheckBox from "../agreementcheckbox/AgreementCheckBox.tsx";
import { useEnvDetector } from "../../../../../utils.ts";
import usePaymentStore from "../../../stores/paymentStore.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";

type PaymentFormProps = {
  variant?: 'klarna' | 'santander' | 'paypal_paylater' | 'default';
};

const PaymentForm = ({ variant = 'default' }: PaymentFormProps) => {
  const {setPaymentData} = usePaymentStore()

  const data = useData();

  const stripe = useStripe();
  const elements = useElements();
  const {order} = usePaymentStore()

  const environment = useEnvDetector();

  // Extract billing details from order
  const billingEmail = (order as any)?.email || order?.billing_email || '';
  const billingName = order?.billing?.first_name && order?.billing?.last_name
    ? `${order.billing.first_name} ${order.billing.last_name}`
    : '';

  console.log("PaymentForm rendered");
  console.log("PaymentForm - stripe:", stripe);
  console.log("PaymentForm - elements:", elements);
  console.log("PaymentForm - order:", order);
  console.log("PaymentForm - variant:", variant);
  console.log("PaymentForm - billingEmail:", billingEmail);
  console.log("PaymentForm - billingName:", billingName);

  const [message, setMessage] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Variant-specific styling
  const buttonConfig = {
    klarna: {
      className: "artpay-button-style bg-klarna hover:bg-klarna-hover mt-6 disabled:opacity-65 py-3!",
      text: "Paga ora",
    },
    santander: {
      className: "artpay-button-style bg-[#EA1D25] hover:bg-[#c91920] text-white mt-6 disabled:opacity-65 py-3!",
      text: "Completa il pagamento",
    },
    paypal_paylater: {
      className: "artpay-button-style bg-[#009CDE] hover:bg-[#007ab5] text-white mt-6 disabled:opacity-65 py-3!",
      text: "Paga ora",
    },
    default: {
      className: "artpay-button-style bg-primary hover:bg-primary-hover text-white mt-6 disabled:opacity-65 py-3!",
      text: "Paga ora",
    },
  };

  const currentButton = buttonConfig[variant] || buttonConfig.default;

  const returnUrl:Record<any, any> = {
    local: "http://localhost:5173/acquisto-esterno?order=" + order?.order_key,
    staging: "https://staging2.artpay.art/acquisto-esterno?order=" + order?.order_key,
    production: "http://artpay.art/acquisto-esterno?order=" + order?.order_key,
  };

  const handleDeleteOrder = async () => {
    setPaymentData({
      loading: true,
    });
    try {
      if (!order) return;

      // Use numeric order ID for WooCommerce API
      const restoreToOnHold = await data.updateCdsOrder(order?.id, {
        status: "on-hold",
        payment_method: "bnpl",
        customer_note: "",
      });
      if (!restoreToOnHold) throw Error("Error updating order to on-hold");
      console.log("Order restore to on-hold");

      // Preserve email and billing_address from current order
      const preservedEmail = (order as any).email || order.billing_email;
      const preservedBillingAddress = (order as any).billing_address || order.billing;

      if (preservedEmail) {
        (restoreToOnHold as any).email = preservedEmail;
        if (!restoreToOnHold.billing_email) {
          restoreToOnHold.billing_email = preservedEmail;
        }
      }

      if (preservedBillingAddress) {
        (restoreToOnHold as any).billing_address = preservedBillingAddress;
      }

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

    console.log("Confirming payment with billing details:", {
      email: billingEmail,
      name: billingName,
    });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: environment ? returnUrl[environment] : returnUrl.local,
        payment_method_data: {
          billing_details: {
            email: billingEmail,
            name: billingName,
            address: {
              country: order?.billing?.country || 'IT',
            },
          },
        },
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
      {variant === 'santander' && (
        <div className="mb-4 p-4 bg-[#FFF5F5] border border-[#EA1D25]/20 rounded-lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Completa il pagamento con il prestito Santander
            </p>
            <p className="text-xs text-gray-600">
              Inserisci il tuo indirizzo email, riceverai le istruzioni con i dati bancari e l'importo esatto da trasferire per completare il pagamento del tuo ordine.
            </p>
          </div>
        </div>
      )}
      <PaymentElement id="payment-element" options={{ layout: "accordion" }} />
      <div className={'space-y-6'}>
        <button
          disabled={isLoading || !stripe || !elements }
          id="submit"
          className={currentButton.className}>
        <span id="button-text">
          {isLoading ? (
            <div
              className="size-4 border border-white border-b-transparent rounded-full animate-spin"
              id="spinner"></div>
          ) : (
            currentButton.text
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
