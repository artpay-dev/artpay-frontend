import { useState } from 'react';
import PaymentProviderCard from '../ui/paymentprovidercard/PaymentProviderCard.tsx';
import KlarnaIcon from '../ui/paymentprovidercard/KlarnaIcon.tsx';
import SantanderCard from '../ui/santandercard/SantanderCard.tsx';
import useCdsPaymentStore from '../../stores/paymentStore.ts';
import { createPaymentIntent } from '../../api.ts';

const KLARNA_MAX = 2500;
const SANTANDER_MIN = 1500;
const SANTANDER_MAX = 30000;

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

const Spinner = () => (
  <div className="size-4 border border-white border-b-transparent rounded-full animate-spin" />
);

const PaymentMethodsList = () => {
  const { orderDetails, setPaymentMethod, setPaymentIntent, setLoading, setError } = useCdsPaymentStore();
  const [selectingKlarna, setSelectingKlarna] = useState(false);

  if (!orderDetails) return null;

  const grandTotal = Number(orderDetails.grand_total);
  const klarnaFee = grandTotal * 0.05;
  const klarnaTotal = grandTotal + klarnaFee;
  const klarnaQuota = klarnaTotal / 3;

  const showKlarna = grandTotal <= KLARNA_MAX;
  const showSantander = grandTotal >= SANTANDER_MIN && grandTotal <= SANTANDER_MAX;
  const noMethodsAvailable = !showKlarna && !showSantander;

  const fmt = (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSelectKlarna = async () => {
    setSelectingKlarna(true);
    setLoading(true);
    setError(null);
    try {
      const intent = await createPaymentIntent(orderDetails.order_key, 'klarna');
      setPaymentMethod('klarna');
      setPaymentIntent(intent);
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione del pagamento');
    } finally {
      setSelectingKlarna(false);
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-t border-secondary mt-12">
        <h3 className="text-secondary py-4.5 flex items-center gap-2">
          <CreditCardIcon />
          Metodi di pagamento
        </h3>

        {noMethodsAvailable ? (
          <p className="text-sm text-secondary py-2">
            Nessun metodo di pagamento disponibile per questo importo.
          </p>
        ) : (
          <ul className="flex flex-col items-center space-y-6">
            {showSantander && (
              <li className="w-full">
                <SantanderCard />
              </li>
            )}

            {showKlarna && (
              <li className="w-full">
                <PaymentProviderCard
                  cardTitle="Klarna"
                  icon={<KlarnaIcon />}
                  subtitle={`Paga in 3 rate fino a € ${fmt(KLARNA_MAX)}`}
                  backgroundColor="bg-[#FFE9EE]"
                  button={
                    <button
                      onClick={handleSelectKlarna}
                      disabled={selectingKlarna}
                      className="artpay-button-style bg-klarna hover:bg-klarna-hover disabled:opacity-65">
                      {selectingKlarna ? <Spinner /> : `Paga la prima rata da € ${fmt(klarnaQuota)}`}
                    </button>
                  }>
                  <ul className="space-y-4 py-4 border-t border-zinc-300">
                    <li className="w-full flex justify-between">
                      Tre rate senza interessi da: <span>€ {fmt(klarnaQuota)}</span>
                    </li>
                    <li className="w-full flex justify-between">
                      Subtotale: <span>€ {fmt(grandTotal)}</span>
                    </li>
                    <li>
                      <div className="w-full flex justify-between">
                        Commissione Klarna (5%): <span>€ {fmt(klarnaFee)}</span>
                      </div>
                      <p className="text-secondary text-xs">Inclusi costi del finanziamento</p>
                    </li>
                    <li className="w-full flex justify-between">
                      <strong>Totale:</strong> <strong>€ {fmt(klarnaTotal)}</strong>
                    </li>
                  </ul>
                </PaymentProviderCard>
              </li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
};

export default PaymentMethodsList;
