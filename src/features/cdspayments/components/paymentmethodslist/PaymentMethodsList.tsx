import { useState } from 'react';
import PaymentProviderCard from '../ui/paymentprovidercard/PaymentProviderCard.tsx';
import KlarnaIcon from '../ui/paymentprovidercard/KlarnaIcon.tsx';
import ScalapayIcon from '../ui/paymentprovidercard/ScalapayIcon.tsx';
import HeyLightIcon from '../ui/paymentprovidercard/HeyLightIcon.tsx';
import SantanderCard from '../ui/santandercard/SantanderCard.tsx';
import useCdsPaymentStore from '../../stores/paymentStore.ts';
import { createPaymentIntent, createHeylightSession } from '../../api.ts';
import { heylightStorageKey } from '../heylight/heylightStorage.ts';
import { track } from '../../lib/pillarAnalytics.ts';

const KLARNA_MAX = 2500;
const SANTANDER_MIN = 1500;
const SANTANDER_MAX = 30000;
const SCALAPAY_MIN = 40;
const SCALAPAY_MAX = 5000;
const HEYLIGHT_MAX = 5000;

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
  const [selectingScalapay, setSelectingScalapay] = useState(false);
  const [selectingHeylight, setSelectingHeylight] = useState(false);
  const [heylightForm, setHeylightForm] = useState({ firstName: '', lastName: '', phone: '' });

  const heylightFormValid = heylightForm.firstName.trim() !== '' && heylightForm.lastName.trim() !== '';

  if (!orderDetails) return null;

  const grandTotal = Number(orderDetails.grand_total);
  const klarnaFee = grandTotal * 0.05;
  const klarnaTotal = grandTotal + klarnaFee;
  const klarnaQuota = klarnaTotal / 3;

  const showKlarna = grandTotal <= KLARNA_MAX;
  const showSantander = grandTotal >= SANTANDER_MIN && grandTotal <= SANTANDER_MAX;
  const showScalapay = grandTotal >= SCALAPAY_MIN && grandTotal <= SCALAPAY_MAX;
  const showHeylight = grandTotal <= HEYLIGHT_MAX;
  const scalapayFee = grandTotal * 0.05;
  const scalapayTotal = grandTotal + scalapayFee;
  const scalapayQuota = scalapayTotal / 3;
  const heylightFee = grandTotal * 0.06;
  const heylightTotal = grandTotal + heylightFee;
  const noMethodsAvailable = !showKlarna && !showSantander && !showScalapay && !showHeylight;

  const fmt = (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSelectKlarna = async () => {
    track('klarna_selected', {
      email: orderDetails.customer_email,
      order: orderDetails.order_id,
      total: orderDetails.grand_total,
    });
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

  const handleSelectHeylight = async () => {
    track('heylight_selected', {
      email: orderDetails.customer_email,
      order: orderDetails.order_id,
      total: orderDetails.grand_total,
    });
    setSelectingHeylight(true);
    setLoading(true);
    setError(null);
    try {
      const pageBase = `${window.location.origin}${window.location.pathname}`;
      const returnBase = `${pageBase}?order_id=${encodeURIComponent(orderDetails.order_key)}`;
      const session = await createHeylightSession({
        wc_order_id: orderDetails.order_id,
        success_url: `${returnBase}&heylight_return=success`,
        failure_url: `${returnBase}&heylight_return=failed`,
        language: 'it',
        product_type: 'dilazione',
        allowed_terms: [3, 6, 12],
        first_name: heylightForm.firstName.trim(),
        last_name: heylightForm.lastName.trim(),
        ...(heylightForm.phone.trim() && { phone: heylightForm.phone.trim() }),
      });
      localStorage.setItem(heylightStorageKey(orderDetails.order_key), session.application_uuid);
      window.location.href = session.redirect_url;
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione della sessione Heylight');
      setSelectingHeylight(false);
      setLoading(false);
    }
  };

  const handleSelectScalapay = async () => {
    track('scalapay_selected', {
      email: orderDetails.customer_email,
      order: orderDetails.order_id,
      total: orderDetails.grand_total,
    });
    setSelectingScalapay(true);
    setLoading(true);
    setError(null);
    try {
      const intent = await createPaymentIntent(orderDetails.order_key, 'scalapay');
      setPaymentMethod('scalapay');
      setPaymentIntent(intent);
    } catch (e: any) {
      setError(e.message ?? 'Errore nella creazione del pagamento');
    } finally {
      setSelectingScalapay(false);
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-t border-secondary mt-12">
        <h3 className="text-secondary py-4.5 flex items-center gap-2">
          <CreditCardIcon />
          I nostri partner finanziari
        </h3>

        {noMethodsAvailable ? (
          <p className="text-sm text-secondary py-2">
            Nessun metodo di pagamento disponibile per questo importo.
          </p>
        ) : (
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
                  <ul className="space-y-4 py-4 border-t border-zinc-300">
                    <li className="w-full flex justify-between">
                      Subtotale: <span>€ {fmt(grandTotal)}</span>
                    </li>
                    <li>
                      <div className="w-full flex justify-between">
                        Commissione HeyLight (6%): <span>€ {fmt(heylightFee)}</span>
                      </div>
                      <p className="text-secondary text-xs">Inclusi costi del finanziamento</p>
                    </li>
                    <li className="w-full flex justify-between">
                      <strong>Totale:</strong> <strong>€ {fmt(heylightTotal)}</strong>
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
                      type="tel"
                      placeholder="Telefono (opzionale)"
                      value={heylightForm.phone}
                      onChange={(e) => setHeylightForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ea1c00] transition-colors"
                    />
                  </div>
                </PaymentProviderCard>
              </li>
            )}

            {showSantander && (
              <li className="w-full">
                <SantanderCard />
              </li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
};

export default PaymentMethodsList;
