import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import useGatewayPaymentStore from './store';
import { fetchGatewaySession, createGatewayPaymentIntent } from './api';
import GatewayLayout from './components/GatewayLayout';
import SessionSummary from './components/SessionSummary';
import SessionPaymentForm from './components/SessionPaymentForm';
import SessionComplete from './components/SessionComplete';
import SessionStatus from './components/SessionStatus';
import SkeletonOrderDetails from '../cdspayments/components/paymentmethodslist/SkeletonOrderDetails';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

type Stage = 'loading' | 'checkout' | 'success' | 'paid' | 'cancelled' | 'expired' | 'failed' | 'error';

// WordPress returns timestamps without timezone offset (UTC). Appending 'Z' prevents
// browsers from misinterpreting them as local time, which causes false expiry on UTC+N clients.
const parseUtcDate = (s: string) => new Date(s.replace(' ', 'T') + 'Z');

const GatewayPayment = () => {
  const { sessionKey } = useParams<{ sessionKey: string }>();
  const [searchParams] = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status');

  const { session, paymentIntent, loading, error, setSession, setPaymentIntent, setLoading, setError, reset } =
    useGatewayPaymentStore();

  useEffect(() => {
    reset();

    if (!sessionKey) {
      setError("Chiave sessione mancante nell'URL");
      return;
    }

    setLoading(true);
    fetchGatewaySession(sessionKey)
      .then(async (data) => {
        setSession(data);

        // Only create a payment intent if the session is pending and we are not returning from a Stripe redirect
        if (data.status === 'pending' && !redirectStatus) {
          const isExpired = parseUtcDate(data.expires_at) < new Date();
          if (!isExpired) {
            try {
              const intent = await createGatewayPaymentIntent(sessionKey);
              setPaymentIntent(intent);
            } catch (e) {
              setError((e as Error).message);
            }
          }
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionKey]);

  const stage = useMemo((): Stage => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (redirectStatus === 'succeeded') return 'success';
    if (redirectStatus === 'failed') return 'failed';
    if (!session) return 'loading';
    if (session.status === 'paid') return 'paid';
    if (session.status === 'cancelled') return 'cancelled';
    if (session.status === 'expired') return 'expired';
    const isExpired = parseUtcDate(session.expires_at) < new Date();
    if (isExpired) return 'expired';
    if (session.status === 'pending' && paymentIntent) return 'checkout';
    return 'loading';
  }, [loading, error, session, paymentIntent, redirectStatus]);

  return (
    <GatewayLayout session={session}>
      {stage === 'loading' && <SkeletonOrderDetails />}

      {stage === 'error' && (
        <div className="space-y-4 py-8 text-center">
          <p className="text-[#EC6F7B] font-medium">{error}</p>
          <p className="text-secondary text-sm">Verifica il link ricevuto o contatta il venditore.</p>
        </div>
      )}

      {stage === 'success' && session && <SessionComplete session={session} />}

      {(stage === 'paid' || stage === 'cancelled' || stage === 'expired' || stage === 'failed') && session && (
        <SessionStatus session={session} stage={stage} />
      )}

      {stage === 'checkout' && paymentIntent && session && (
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
          <SessionSummary session={session} />
          <SessionPaymentForm sessionKey={sessionKey!} session={session} />
        </Elements>
      )}
    </GatewayLayout>
  );
};

export default GatewayPayment;