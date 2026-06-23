import { useState } from 'react';
import useCdsPaymentStore from '../../stores/paymentStore.ts';
import { track } from '../../lib/pillarAnalytics.ts';

const REASONS = [
  'Voglio pagare in modo diverso',
  'Non riesco a completare il pagamento',
  'Commissione del servizio elevata',
  'Altro',
];

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
};

const AbandonCartModal = ({ open, onClose, onConfirmLeave }: Props) => {
  const { orderDetails } = useCdsPaymentStore();
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    const reason = selected === 'Altro' && detail ? detail : selected;

    track('cart_abandoned', {
      email: orderDetails?.customer_email,
      order: orderDetails?.order_id,
      total: orderDetails?.grand_total,
      reason,
    });

    setSending(true);
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/wp-json/api/v1/cds/abandon-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderDetails?.order_id,
          email: orderDetails?.customer_email,
          reason: reason || null,
        }),
      });
    } catch {
      // mostra comunque il ringraziamento
    } finally {
      setSending(false);
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={!sent ? onClose : undefined} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl px-6 pt-6 pb-8 shadow-xl">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />

        {sent ? (
          <>
            <div className="text-center mb-6">
              <div className="text-3xl mb-3">🙏</div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Grazie per il feedback!</h2>
              <p className="text-sm text-gray-500">
                Il tuo messaggio ci aiuterà a migliorare il servizio.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={onConfirmLeave}
                className="artpay-button-style text-secondary border border-gray-200 bg-white hover:bg-gray-50">
                Esci dalla pagina
              </button>
              <button
                onClick={onClose}
                className="artpay-button-style bg-primary hover:bg-primary-hover text-white">
                Continua con Artpay
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Prima di andare...</h2>
            <p className="text-sm text-gray-500 mb-5">
              Puoi dirci perché stai lasciando? Ci aiuta a migliorare il servizio.
            </p>

            <div className="space-y-3 mb-6">
              {REASONS.map((r) => (
                <label key={r} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="abandon-reason"
                    value={r}
                    checked={selected === r}
                    onChange={() => setSelected(r)}
                    className="mt-0.5 accent-[#3E4EEC]"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{r}</span>
                </label>
              ))}
              {selected === 'Altro' && (
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Raccontaci..."
                  rows={2}
                  className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3E4EEC] resize-none"
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="artpay-button-style text-secondary border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-65">
                {sending ? 'Invio...' : 'Invia'}
              </button>
              <button
                onClick={onClose}
                className="artpay-button-style bg-primary hover:bg-primary-hover text-white">
                Continua con Artpay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AbandonCartModal;