import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import useCdsPaymentStore from './stores/paymentStore.ts';
import { fetchOrderDetails } from './api.ts';
import CdsTransactionLayout from './layouts/cdstransactionlayout/CdsTransactionLayout.tsx';
import OrderSummary from './components/ordersummary/OrderSummary.tsx';
import PaymentMethodsList from './components/paymentmethodslist/PaymentMethodsList.tsx';
import PaymentForm from './components/ui/paymentform/PaymentForm.tsx';
import PaymentComplete from './components/paymentcomplete/PaymentComplete.tsx';
import PaymentFailed from './components/paymentfailed/PaymentFailed.tsx';
import SkeletonOrderDetails from './components/paymentmethodslist/SkeletonOrderDetails.tsx';
import BankTransferInstructions from './components/banktransferinstructions/BankTransferInstructions.tsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

type Stage = 'loading' | 'selection' | 'checkout' | 'bank_transfer' | 'success' | 'failed' | 'error';

const isBankTransferIntent = (intent: { status: string; next_action?: { type: string } } | null) =>
  intent?.status === 'requires_action' &&
  intent?.next_action?.type === 'display_bank_transfer_instructions';

const CdsPayments = () => {
  const [searchParams] = useSearchParams();
  const {
    orderDetails,
    paymentIntent,
    loading,
    error,
    setOrderDetails,
    setLoading,
    setError,
    reset,
  } = useCdsPaymentStore();

  const orderKey = searchParams.get('order_id') ?? searchParams.get('order');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    reset();

    if (!orderKey) {
      setError("Parametro order_key mancante nell'URL");
      return;
    }

    setLoading(true);
    fetchOrderDetails(orderKey)
      .then(setOrderDetails)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderKey]);

  const stage = useMemo((): Stage => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (redirectStatus === 'succeeded') return 'success';
    if (redirectStatus === 'failed') return 'failed';
    if (orderDetails?.status === 'processing' || orderDetails?.status === 'completed') return 'success';
    if (orderDetails?.status === 'failed' || orderDetails?.status === 'cancelled') return 'failed';
    if (paymentIntent) {
      if (isBankTransferIntent(paymentIntent)) return 'bank_transfer';
      return 'checkout';
    }
    return 'selection';
  }, [loading, error, redirectStatus, orderDetails?.status, paymentIntent]);

  const bankTransferInstructions =
    paymentIntent?.next_action?.display_bank_transfer_instructions ?? null;

  return (
    <CdsTransactionLayout>
      {stage === 'loading' && <SkeletonOrderDetails />}

      {stage === 'error' && (
        <div className="space-y-4 py-8 text-center">
          <p className="text-[#EC6F7B] font-medium">{error}</p>
          <p className="text-secondary text-sm">
            Verifica il link ricevuto o contatta il venditore.
          </p>
        </div>
      )}

      {stage === 'success' && (
        <>
          <OrderSummary />
          <PaymentComplete />
        </>
      )}

      {stage === 'failed' && (
        <>
          <OrderSummary />
          <PaymentFailed />
        </>
      )}

      {stage === 'selection' && (
        <>
          <OrderSummary />
          <PaymentMethodsList />
        </>
      )}

      {stage === 'bank_transfer' && bankTransferInstructions && (
        <>
          <OrderSummary />
          <BankTransferInstructions
            instructions={bankTransferInstructions}
            amount={paymentIntent!.amount}
          />
        </>
      )}

      {stage === 'checkout' && paymentIntent && (
        <>
          <OrderSummary />
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentIntent.client_secret,
              loader: 'always',
              appearance: {
                theme: 'flat',
                variables: {
                  colorBackground: '#fff',
                  colorTextSecondary: '#808791',
                },
              },
            }}>
            <PaymentForm orderKey={orderKey!} />
          </Elements>
        </>
      )}
    </CdsTransactionLayout>
  );
};

export default CdsPayments;
