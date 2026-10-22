import { useState } from 'react';
import PaymentProviderCard from '../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard';
import type { GatewaySession } from '../types';

const CardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.375 7C3.375 6.10254 4.10254 5.375 5 5.375H19C19.8975 5.375 20.625 6.10254 20.625 7V8.625H3.375V7ZM3.375 17V11.375H20.625V17C20.625 17.8975 19.8975 18.625 19 18.625H5C4.10254 18.625 3.375 17.8975 3.375 17ZM5 4.625C3.68832 4.625 2.625 5.68832 2.625 7V17C2.625 18.3117 3.68832 19.375 5 19.375H19C20.3117 19.375 21.375 18.3117 21.375 17V7C21.375 5.68832 20.3117 4.625 19 4.625H5Z"
      fill="#3E4EEC"
    />
  </svg>
);

type Props = {
  session: GatewaySession;
  onSelectCard: () => Promise<void>;
};

const SessionPaymentSelection = ({ session, onSelectCard }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const fmt = (amount: number) =>
    (amount / 100).toLocaleString('it-IT', {
      style: 'currency',
      currency: session.currency.toUpperCase(),
      minimumFractionDigits: 2,
    });

  const handleCard = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await onSelectCard();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-t border-secondary mt-12">
      <h3 className="text-secondary py-4.5">Scegli come pagare</h3>
      <div className="space-y-3">
        <PaymentProviderCard
          cardTitle="Carta di credito / debito"
          subtitle="Visa, Mastercard, American Express"
          icon={<CardIcon />}
          button={
            <button
              onClick={handleCard}
              disabled={loading}
              className="artpay-button-style bg-primary hover:bg-primary-hover text-white disabled:opacity-65">
              {loading ? (
                <div className="size-4 border border-white border-b-transparent rounded-full animate-spin" />
              ) : (
                `Paga ${fmt(session.amount)}`
              )}
            </button>
          }
        />

        {error && <p className="text-red-500 text-sm">*{error}</p>}

        {session.cancel_url && (
          <a
            href={session.cancel_url}
            className="artpay-button-style text-secondary border border-gray-300 bg-white hover:bg-gray-50 block text-center">
            Annulla e torna al negozio
          </a>
        )}
      </div>
    </section>
  );
};

export default SessionPaymentSelection;