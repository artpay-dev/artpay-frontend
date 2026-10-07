import { useEffect } from 'react';
import useCdsPaymentStore from '../../stores/paymentStore.ts';
import { getHeylightSession } from '../../api.ts';
import PaymentProviderCard from '../ui/paymentprovidercard/PaymentProviderCard.tsx';
import { heylightStorageKey } from './heylightStorage.ts';

const HL_POLL_INTERVAL_MS = 3000;
const HL_POLL_MAX_ATTEMPTS = 10;

const Spinner = () => (
  <div className="size-8 border-2 border-[#ea1c00] border-b-transparent rounded-full animate-spin" />
);

type Props = { uuid: string; orderKey: string };

const HeyLightPolling = ({ uuid, orderKey }: Props) => {
  const { heylightStatus, setHeylightStatus, setError } = useCdsPaymentStore();

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      for (let i = 0; i < HL_POLL_MAX_ATTEMPTS; i++) {
        if (cancelled) return;

        try {
          const data = await getHeylightSession(uuid);
          if (cancelled) return;

          if (data.status === 'success') {
            localStorage.removeItem(heylightStorageKey(orderKey));
            setHeylightStatus('success');
            return;
          }
          if (data.status === 'cancelled') {
            setHeylightStatus('cancelled');
            return;
          }
          if (data.status === 'awaiting_confirmation') {
            setHeylightStatus('awaiting_confirmation');
            return;
          }
        } catch {
          // network error — keep trying
        }

        if (i < HL_POLL_MAX_ATTEMPTS - 1) {
          await new Promise((r) => setTimeout(r, HL_POLL_INTERVAL_MS));
        }
      }

      if (!cancelled) {
        setError('Verifica del pagamento scaduta. Ricarica la pagina o contatta il supporto.');
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [uuid, orderKey, setHeylightStatus, setError]);

  if (heylightStatus === 'awaiting_confirmation') {
    return (
      <section className="space-y-6">
        <div className="border-t border-secondary mt-12">
          <h3 className="text-secondary py-4.5 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.293a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2.5-2.5a1 1 0 1 1 1.414-1.414L11 13.586l4.293-4.293a1 1 0 0 1 1.414 0z"
                fill="#ea1c00"
              />
            </svg>
            Approvato! In attesa di conferma finale
          </h3>
          <PaymentProviderCard backgroundColor="bg-[#FFF0EE]">
            <div className="space-y-4 py-4 text-center">
              <p className="font-semibold leading-[125%]">La tua richiesta è stata approvata da HeyLight.</p>
              <p className="text-secondary text-sm leading-[125%]">
                Il pagamento non è ancora completato — stiamo aspettando la conferma finale. Riceverai una notifica a
                breve. Non è necessaria alcuna azione da parte tua.
              </p>
            </div>
          </PaymentProviderCard>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="border-t border-secondary mt-12">
        <h3 className="text-secondary py-4.5">Pagamento in corso…</h3>
        <PaymentProviderCard backgroundColor="bg-[#F8F8F8]">
          <div className="flex flex-col items-center gap-4 py-8">
            <Spinner />
            <p className="text-secondary text-sm">Stiamo verificando il tuo pagamento, attendere.</p>
          </div>
        </PaymentProviderCard>
      </div>
    </section>
  );
};

export default HeyLightPolling;