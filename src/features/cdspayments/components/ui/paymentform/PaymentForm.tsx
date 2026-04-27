import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import useCdsPaymentStore from '../../../stores/paymentStore.ts';

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.375 7C3.375 6.10254 4.10254 5.375 5 5.375H19C19.8975 5.375 20.625 6.10254 20.625 7V8.625H3.375V7ZM3.375 17V11.375H20.625V17C20.625 17.8975 19.8975 18.625 19 18.625H5C4.10254 18.625 3.375 17.8975 3.375 17ZM5 4.625C3.68832 4.625 2.625 5.68832 2.625 7V17C2.625 18.3117 3.68832 19.375 5 19.375H19C20.3117 19.375 21.375 18.3117 21.375 17V7C21.375 5.68832 20.3117 4.625 19 4.625H5Z"
      fill="#CDCFD3"
    />
  </svg>
);

type PaymentFormProps = {
  orderKey: string;
};

const PaymentForm = ({ orderKey }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { setPaymentMethod, setPaymentIntent } = useCdsPaymentStore();
  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const returnUrl = `${window.location.origin}${window.location.pathname}?order=${orderKey}`;

  const handleBack = () => {
    setPaymentMethod(null);
    setPaymentIntent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(undefined);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (error?.type === 'card_error' || error?.type === 'validation_error') {
      setMessage(error.message);
    } else if (error) {
      setMessage('Si è verificato un errore imprevisto. Riprova.');
    }

    setIsLoading(false);
  };

  return (
    <section className="border-t border-secondary mt-12">
      <h3 className="text-secondary py-4.5 flex items-center gap-2">
        <CreditCardIcon />
        Completa il pagamento
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement options={{ layout: 'accordion' }} />
        {message && <p className="text-red-500 text-sm">*{message}</p>}
        <button
          disabled={isLoading || !stripe || !elements}
          className="artpay-button-style bg-primary hover:bg-primary-hover text-white mt-6 disabled:opacity-65">
          {isLoading ? (
            <div className="size-4 border border-white border-b-transparent rounded-full animate-spin" />
          ) : (
            'Paga ora'
          )}
        </button>
        <button
          type="button"
          onClick={handleBack}
          className="artpay-button-style text-secondary border border-gray-300 bg-white hover:bg-gray-50">
          Cambia metodo di pagamento
        </button>
      </form>
    </section>
  );
};

export default PaymentForm;
