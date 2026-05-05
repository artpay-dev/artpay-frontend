import { useState } from 'react';
import { ArrowRight } from '@mui/icons-material';
import PaymentProviderCard from '../paymentprovidercard/PaymentProviderCard.tsx';
import SantanderIcon from '../../../../../components/icons/SantanderIcon.tsx';
import useCdsPaymentStore from '../../../stores/paymentStore.ts';
import { createPaymentIntent, sendBankTransferEmail } from '../../../api.ts';

const Spinner = () => (
  <div className="size-4 border border-white border-b-transparent rounded-full animate-spin" />
);

const SantanderCard = () => {
  const { orderDetails, setPaymentMethod, setPaymentIntent, setLoading, setError } = useCdsPaymentStore();
  const [loading, setLocalLoading] = useState(false);

  if (!orderDetails) return null;

  const baseTotal = Number(orderDetails.base_total);
  const platformFee = Number(orderDetails.platform_fee);
  const grandTotal = Number(orderDetails.grand_total);
  const fmt = (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSantanderLinkClick = () => {
    window.Brevo?.push([
      'track',
      'santander_click',
      {
        id: orderDetails.customer_email,
        username: orderDetails.customer_email,
        event_data: {
          order: orderDetails.order_id,
          user_email: orderDetails.customer_email,
          total: orderDetails.grand_total,
        },
      },
    ]);
  };

  const handleLoanObtained = async () => {
    setLocalLoading(true);
    setLoading(true);
    setError(null);
    try {
      const intent = await createPaymentIntent(orderDetails.order_key, 'bank_transfer');
      setPaymentMethod('bank_transfer');
      setPaymentIntent(intent);

      const bankInstructions = intent.next_action?.display_bank_transfer_instructions;
      if (bankInstructions) {
        sendBankTransferEmail(orderDetails, bankInstructions, intent.amount).catch(console.error);
      }
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione del pagamento');
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <PaymentProviderCard
      cardTitle="Finanziamento con bonifico"
      icon={<SantanderIcon />}
      subtitle="Richiedi un prestito e paga tramite bonifico"
      backgroundColor="bg-[#E2E6FC]"
      button={
        <button
          onClick={handleLoanObtained}
          disabled={loading}
          className="artpay-button-style bg-primary hover:bg-primary-hover text-white disabled:opacity-65">
          {loading ? <Spinner /> : 'Ho ottenuto il prestito'}
        </button>
      }>
      <ol className="list-decimal ps-4 space-y-1 border-t border-zinc-300 pt-4 pb-2">
        <li>Richiedi il finanziamento al tuo istituto</li>
        <li>Ottieni l'approvazione del prestito</li>
        <li>Clicca "Ho ottenuto il prestito" per completare il pagamento</li>
      </ol>

      <ul className="space-y-4 py-4 border-t border-zinc-300">
        <li className="w-full flex justify-between">
          Subtotale: <span>€ {fmt(baseTotal)}</span>
        </li>
        <li className="w-full flex justify-between">
          Commissione Artpay (4%): <span>€ {fmt(platformFee)}</span>
        </li>
        <li className="w-full flex justify-between">
          <strong>Totale:</strong> <strong>€ {fmt(grandTotal)}</strong>
        </li>
      </ul>

      <div className="border-t border-zinc-300 pt-4 space-y-1">
        <h4 className="font-bold leading-[125%] text-tertiary">Calcola la rata</h4>
        <p className="text-sm text-secondary">Avvia la procedura di richiesta prestito con Santander</p>
      </div>
      <a
        href="https://www.santanderconsumer.it/prestito/partner/artpay"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleSantanderLinkClick}
        className="flex gap-2 items-center mt-2 text-tertiary">
        <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#EA1D25" />
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
          <path
            d="M19.6526 10.2795C19.9083 10.6554 20.0362 11.0892 20.0682 11.5229C22.4334 12.0723 24.0315 13.2578 23.9995 14.559C23.9995 16.4675 20.8672 18 16.9998 18C13.1323 18 10 16.4675 10 14.559C10 13.2 11.6301 12.0145 13.9633 11.4651C13.9633 11.9855 14.0912 12.506 14.3788 12.9687L16.5843 16.4096C16.7441 16.6699 16.8719 16.959 16.9358 17.2482L17.0317 17.1036C17.5751 16.2651 17.5751 15.1952 17.0317 14.3566L15.2738 11.6096C14.7304 10.7422 14.7304 9.7012 15.2738 8.86265L15.3697 8.71807C15.4336 9.00723 15.5615 9.29639 15.7213 9.55663L16.7441 11.1759L18.3422 13.6916C18.502 13.9518 18.6298 14.241 18.6938 14.5301L18.7897 14.3855C19.333 13.547 19.333 12.4771 18.7897 11.6386L17.0317 8.89157C16.4884 8.05301 16.4884 6.98313 17.0317 6.14458L17.1276 6C17.1915 6.28916 17.3194 6.57831 17.4792 6.83855L19.6526 10.2795Z"
            fill="white"
          />
        </svg>
        <span>Calcola la rata con Santander</span>
        <ArrowRight fontSize="small" />
      </a>
    </PaymentProviderCard>
  );
};

export default SantanderCard;
