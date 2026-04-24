import { useState } from 'react';
import PaymentProviderCard from '../ui/paymentprovidercard/PaymentProviderCard.tsx';
import useCdsPaymentStore from '../../stores/paymentStore.ts';
import type { BankTransferInstructions as BankTransferInstructionsType } from '../../types.ts';

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CopyableField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <li className="flex flex-col gap-1">
      <span className="text-secondary text-sm">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <span className="text-tertiary font-medium font-mono text-sm break-all">{value}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 text-primary hover:text-primary-hover transition-colors p-1"
          title="Copia">
          {copied ? (
            <span className="text-xs text-green-600 font-medium">Copiato!</span>
          ) : (
            <CopyIcon />
          )}
        </button>
      </div>
    </li>
  );
};

type BankTransferInstructionsProps = {
  instructions: BankTransferInstructionsType;
  amount: number;
};

const BankTransferInstructions = ({ instructions, amount }: BankTransferInstructionsProps) => {
  const { setPaymentMethod, setPaymentIntent } = useCdsPaymentStore();
  const ibanAddress = instructions.financial_addresses.find((fa) => fa.type === 'iban' && fa.iban);
  const iban = ibanAddress?.iban;
  const amountFormatted = (amount / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleBack = () => {
    setPaymentMethod(null);
    setPaymentIntent(null);
  };

  return (
    <section className="border-t border-secondary mt-12 space-y-6">
      <h3 className="text-secondary py-4.5 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd" clipRule="evenodd"
            d="M3.375 7C3.375 6.10254 4.10254 5.375 5 5.375H19C19.8975 5.375 20.625 6.10254 20.625 7V8.625H3.375V7ZM3.375 17V11.375H20.625V17C20.625 17.8975 19.8975 18.625 19 18.625H5C4.10254 18.625 3.375 17.8975 3.375 17ZM5 4.625C3.68832 4.625 2.625 5.68832 2.625 7V17C2.625 18.3117 3.68832 19.375 5 19.375H19C20.3117 19.375 21.375 18.3117 21.375 17V7C21.375 5.68832 20.3117 4.625 19 4.625H5Z"
            fill="#CDCFD3"
          />
        </svg>
        Istruzioni per il bonifico
      </h3>

      <PaymentProviderCard backgroundColor="bg-[#42B39640]">
        <div className="space-y-2">
          <p className="font-medium text-tertiary">Il pagamento si auto-conferma</p>
          <p className="text-secondary text-sm leading-relaxed">
            Non devi fare nulla dopo aver effettuato il bonifico. Quando i fondi arriveranno, l'ordine
            verrà confermato automaticamente.
          </p>
        </div>
      </PaymentProviderCard>

      <PaymentProviderCard backgroundColor="bg-[#FAFAFB]">
        <ul className="space-y-5">
          {iban && (
            <>
              <CopyableField label="Intestatario" value={iban.account_holder_name} />
              <CopyableField label="IBAN" value={iban.iban} />
              {iban.bic && <CopyableField label="BIC / SWIFT" value={iban.bic} />}
              {iban.bank_name && (
                <li className="flex flex-col gap-1">
                  <span className="text-secondary text-sm">Banca</span>
                  <span className="text-tertiary">{iban.bank_name}</span>
                </li>
              )}
            </>
          )}
          {instructions.reference && (
            <CopyableField label="Causale" value={instructions.reference} />
          )}
          <CopyableField label="Importo da versare" value={`€ ${amountFormatted}`} />
        </ul>
      </PaymentProviderCard>

      {instructions.hosted_instructions_url && (
        <a
          href={instructions.hosted_instructions_url}
          target="_blank"
          rel="noopener noreferrer"
          className="artpay-button-style border border-primary text-primary hover:bg-primary/5 block text-center">
          Visualizza istruzioni complete
        </a>
      )}

      <button
        type="button"
        onClick={handleBack}
        className="artpay-button-style text-secondary border border-gray-300 bg-white hover:bg-gray-50">
        Cambia metodo di pagamento
      </button>
    </section>
  );
};

export default BankTransferInstructions;
