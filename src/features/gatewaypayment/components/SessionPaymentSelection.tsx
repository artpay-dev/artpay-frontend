import { useState } from 'react';
import PaymentProviderCard from '../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard';
import KlarnaIcon from '../../cdspayments/components/ui/paymentprovidercard/KlarnaIcon';
import ScalapayIcon from '../../cdspayments/components/ui/paymentprovidercard/ScalapayIcon';
import HeyLightIcon from '../../cdspayments/components/ui/paymentprovidercard/HeyLightIcon';
import { createGatewayPaymentIntent, createGatewayHeylightSession } from '../api';
import useGatewayPaymentStore from '../store';
import type { GatewaySession } from '../types';

const KLARNA_MAX = 2500;
const SCALAPAY_MIN = 40;
const SCALAPAY_MAX = 5000;
const HEYLIGHT_MAX = 5000;

export const gatewayHeylightStorageKey = (sessionKey: string) => `gateway_hl_${sessionKey}`;

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

type Props = { session: GatewaySession; sessionKey: string };

const SessionPaymentSelection = ({ session, sessionKey }: Props) => {
  const { setPaymentMethod, setPaymentIntent, setError } = useGatewayPaymentStore();
  const [selectingCard, setSelectingCard] = useState(false);
  const [selectingKlarna, setSelectingKlarna] = useState(false);
  const [selectingScalapay, setSelectingScalapay] = useState(false);
  const [selectingHeylight, setSelectingHeylight] = useState(false);
  const [heylightForm, setHeylightForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [heylightProductType, setHeylightProductType] = useState<'dilazione' | 'finanziamento'>('dilazione');

  const heylightFormValid =
    heylightForm.firstName.trim() !== '' &&
    heylightForm.lastName.trim() !== '' &&
    heylightForm.phone.trim() !== '' &&
    heylightForm.email.trim() !== '';

  const grandTotal = session.amount / 100;

  const klarnaFee = grandTotal * 0.05;
  const klarnaTotal = grandTotal + klarnaFee;
  const klarnaQuota = klarnaTotal / 3;

  const scalapayFee = grandTotal * 0.05;
  const scalapayTotal = grandTotal + scalapayFee;
  const scalapayQuota = scalapayTotal / 3;

  const showCard = true;
  const showKlarna = grandTotal <= KLARNA_MAX;
  const showScalapay = grandTotal >= SCALAPAY_MIN && grandTotal <= SCALAPAY_MAX;
  const showHeylight = false; // grandTotal <= HEYLIGHT_MAX;

  const fmt = (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSelectCard = async () => {
    setSelectingCard(true);
    setError(null);
    try {
      const intent = await createGatewayPaymentIntent(sessionKey, 'card');
      setPaymentMethod('card');
      setPaymentIntent(intent);
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione del pagamento');
    } finally {
      setSelectingCard(false);
    }
  };

  const handleSelectKlarna = async () => {
    setSelectingKlarna(true);
    setError(null);
    try {
      const intent = await createGatewayPaymentIntent(sessionKey, 'klarna');
      setPaymentMethod('klarna');
      setPaymentIntent(intent);
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione del pagamento');
    } finally {
      setSelectingKlarna(false);
    }
  };

  const handleSelectScalapay = async () => {
    setSelectingScalapay(true);
    setError(null);
    try {
      const intent = await createGatewayPaymentIntent(sessionKey, 'scalapay');
      setPaymentMethod('scalapay');
      setPaymentIntent(intent);
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione del pagamento');
    } finally {
      setSelectingScalapay(false);
    }
  };

  const handleSelectHeylight = async () => {
    setSelectingHeylight(true);
    setError(null);
    try {
      const pageBase = `${window.location.origin}/pay/${encodeURIComponent(sessionKey)}`;
      const hlSession = await createGatewayHeylightSession(sessionKey, {
        success_url: `${pageBase}?heylight_return=success`,
        failure_url: `${pageBase}?heylight_return=failed`,
        product_type: heylightProductType,
        language: 'it',
        allowed_terms: heylightProductType === 'dilazione' ? [3, 6, 12, 24] : [12, 24, 36],
        customer_details: {
          first_name: heylightForm.firstName.trim(),
          last_name: heylightForm.lastName.trim(),
          email_address: heylightForm.email.trim(),
          contact_number: heylightForm.phone.trim(),
        },
      });
      localStorage.setItem(gatewayHeylightStorageKey(sessionKey), hlSession.application_uuid);
      window.location.href = hlSession.redirect_url;
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione della sessione HeyLight');
      setSelectingHeylight(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-t border-secondary mt-12">
        <h3 className="text-secondary py-4.5 flex items-center gap-2">
          <CreditCardIcon />
          Scegli come pagare
        </h3>
        <ul className="flex flex-col items-center space-y-6">
          {showScalapay && (
            <li className="w-full">
              <PaymentProviderCard
                cardTitle="Scalapay"
                icon={<ScalapayIcon />}
                subtitle={`Paga in 3 rate senza interessi da € ${fmt(SCALAPAY_MIN)} a € ${fmt(SCALAPAY_MAX)}`}
                backgroundColor="bg-[#FEF3F4]"
                button={
                  <button
                    onClick={handleSelectScalapay}
                    disabled={selectingScalapay}
                    className="artpay-button-style bg-black hover:bg-zinc-800 text-white disabled:opacity-65">
                    {selectingScalapay ? <Spinner /> : `Paga la prima rata da € ${fmt(scalapayQuota)}`}
                  </button>
                }>
                <ul className="space-y-4 py-4 border-t border-zinc-300">
                  <li className="w-full flex justify-between">
                    Tre rate senza interessi da: <span>€ {fmt(scalapayQuota)}</span>
                  </li>
                  <li className="w-full flex justify-between">
                    Subtotale: <span>€ {fmt(grandTotal)}</span>
                  </li>
                  <li>
                    <div className="w-full flex justify-between">
                      Commissione Scalapay (5%): <span>€ {fmt(scalapayFee)}</span>
                    </div>
                    <p className="text-secondary text-xs">Inclusi costi del finanziamento</p>
                  </li>
                  <li className="w-full flex justify-between">
                    <strong>Totale:</strong> <strong>€ {fmt(scalapayTotal)}</strong>
                  </li>
                </ul>
              </PaymentProviderCard>
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

          {showHeylight && (
            <li className="w-full">
              <PaymentProviderCard
                cardTitle="HeyLight"
                icon={<HeyLightIcon />}
                subtitle={`Paga a rate fino a € ${fmt(HEYLIGHT_MAX)}`}
                backgroundColor="bg-[#FFF0EE]"
                button={
                  <button
                    onClick={handleSelectHeylight}
                    disabled={selectingHeylight || !heylightFormValid}
                    className="artpay-button-style bg-[#ea1c00] hover:bg-[#c41800] text-white disabled:opacity-65">
                    {selectingHeylight ? <Spinner /> : 'Procedi con HeyLight'}
                  </button>
                }>
                <div className="flex gap-3 py-4 border-t border-zinc-300">
                  <button
                    type="button"
                    onClick={() => setHeylightProductType('dilazione')}
                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                      heylightProductType === 'dilazione'
                        ? 'border-[#ea1c00] bg-[#FFF0EE]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}>
                    <p className={`text-sm font-semibold ${heylightProductType === 'dilazione' ? 'text-[#ea1c00]' : 'text-zinc-800'}`}>
                      Dilazione
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">3 – 24 rate · Tasso 0%</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeylightProductType('finanziamento')}
                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                      heylightProductType === 'finanziamento'
                        ? 'border-[#ea1c00] bg-[#FFF0EE]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}>
                    <p className={`text-sm font-semibold ${heylightProductType === 'finanziamento' ? 'text-[#ea1c00]' : 'text-zinc-800'}`}>
                      Finanziamento
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">3 – 24 rate · con interessi</p>
                  </button>
                </div>
                <ul className="space-y-4 py-4 border-t border-zinc-300">
                  <li className="w-full flex justify-between">
                    Subtotale: <span>€ {fmt(grandTotal)}</span>
                  </li>
                  <li>
                    {heylightProductType === 'dilazione' ? (
                      <>
                        <div className="w-full flex justify-between">Rate da 3 a 24 mesi</div>
                        <p className="text-secondary text-xs">Senza interessi · Tasso 0%</p>
                      </>
                    ) : (
                      <>
                        <div className="w-full flex justify-between">
                          Da 3 rate (5,36%) fino a 24 rate (13,36%)
                        </div>
                        <p className="text-secondary text-xs">Inclusi costi del finanziamento</p>
                      </>
                    )}
                  </li>
                  <li className="w-full flex justify-between">
                    <strong>Totale:</strong> <strong>€ {fmt(grandTotal)}</strong>
                  </li>
                </ul>
                <div className="space-y-3 pt-4 border-t border-zinc-300">
                  <p className="text-sm font-medium text-tertiary">I tuoi dati</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Nome *"
                      value={heylightForm.firstName}
                      onChange={(e) => setHeylightForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Cognome *"
                      value={heylightForm.lastName}
                      onChange={(e) => setHeylightForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email *"
                    value={heylightForm.email}
                    onChange={(e) => setHeylightForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Telefono *"
                    value={heylightForm.phone}
                    onChange={(e) => setHeylightForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                  />
                </div>
              </PaymentProviderCard>
            </li>
          )}

          {showCard && (
            <li className="w-full">
              <PaymentProviderCard
                cardTitle="Carta di credito / debito"
                subtitle="Visa, Mastercard, American Express"
                button={
                  <button
                    onClick={handleSelectCard}
                    disabled={selectingCard}
                    className="artpay-button-style bg-primary hover:bg-primary-hover text-white disabled:opacity-65">
                    {selectingCard ? <Spinner /> : `Paga € ${fmt(grandTotal)}`}
                  </button>
                }
              />
            </li>
          )}
        </ul>

        {session.cancel_url && (
          <a
            href={session.cancel_url}
            className="artpay-button-style text-secondary border border-gray-300 bg-white hover:bg-gray-50 block text-center mt-6">
            Annulla e torna al negozio
          </a>
        )}
      </div>
    </section>
  );
};

export default SessionPaymentSelection;