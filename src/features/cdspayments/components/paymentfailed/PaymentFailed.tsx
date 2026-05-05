import useCdsPaymentStore from '../../stores/paymentStore.ts';
import PaymentProviderCard from '../ui/paymentprovidercard/PaymentProviderCard.tsx';

const PaymentFailed = () => {
  const { orderDetails, setPaymentMethod, setPaymentIntent } = useCdsPaymentStore();

  const handleRetry = () => {
    setPaymentMethod(null);
    setPaymentIntent(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('payment_intent');
    url.searchParams.delete('payment_intent_client_secret');
    url.searchParams.delete('redirect_status');
    window.history.replaceState({}, '', url.toString());
    window.location.reload();
  };

  return (
    <section className="space-y-6">
      <div className="border-t border-secondary mt-12">
        <h3 className="text-secondary py-4.5 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 5a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1zm0 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
              fill="#EC6F7B"
            />
          </svg>
          Pagamento non riuscito
        </h3>
        <PaymentProviderCard backgroundColor="bg-[#FAFAFB]" className="border border-[#EC6F7B]">
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <svg width="20" height="20" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15.5 3.08617V9.26117C15.5 10.9413 14.4783 12.0068 12.8134 12.0068H7.11173L4.55061 14.2768C4.40701 14.4127 4.28374 14.5 4.13056 14.5C3.92659 14.5 3.78724 14.3443 3.78724 14.0939V12.0068H3.18667C1.51667 12.0068 0.5 10.959 0.5 9.26117V3.08617C0.5 1.38313 1.51667 0.333344 3.18667 0.333344H12.8134C14.4783 0.333344 15.5 1.40076 15.5 3.08617ZM7.48377 9.05132C7.48377 9.3288 7.71847 9.57483 8.00451 9.57483C8.28861 9.57483 8.52331 9.33087 8.52331 9.05132C8.52331 8.76341 8.29056 8.52271 8.00451 8.52271C7.7165 8.52271 7.48377 8.76548 7.48377 9.05132ZM7.65951 3.1717L7.71057 7.12341C7.71255 7.33474 7.82564 7.46623 8.00451 7.46623C8.17747 7.46623 8.29056 7.33674 8.29258 7.12341L8.35267 3.17372C8.34956 2.96243 8.21271 2.81386 8.00256 2.81386C7.79039 2.81386 7.65753 2.96041 7.65951 3.1717Z"
                    fill="#EC6F7B"
                  />
                </svg>
                <p className="leading-[125%] font-semibold">
                  Ci dispiace, il pagamento non è andato a buon fine.
                </p>
              </div>
              <p className="leading-[125%] text-secondary">
                Si è verificato un errore durante l'elaborazione del pagamento. Puoi riprovare con lo stesso
                metodo o sceglierne uno diverso.
              </p>
              {orderDetails && (
                <p className="text-sm text-secondary">
                  Ordine: {orderDetails.order_id} — {orderDetails.description}
                </p>
              )}
            </div>
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                className="artpay-button-style bg-primary hover:bg-primary-hover text-white">
                Riprova il pagamento
              </button>
              {orderDetails?.return_url && (
                <a
                  href={orderDetails.return_url}
                  className="artpay-button-style border border-primary text-primary hover:bg-primary/5 block text-center">
                  Torna al sito del venditore
                </a>
              )}
            </div>
          </div>
        </PaymentProviderCard>
      </div>
    </section>
  );
};

export default PaymentFailed;
