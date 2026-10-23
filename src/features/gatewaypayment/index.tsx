import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import useGatewayPaymentStore from './store';
import { fetchGatewaySession, confirmGatewaySession } from './api';
import GatewayLayout from './components/GatewayLayout';
import SessionSummary from './components/SessionSummary';
import SessionPaymentSelection, { gatewayHeylightStorageKey } from './components/SessionPaymentSelection';
import SessionPaymentForm from './components/SessionPaymentForm';
import SessionComplete from './components/SessionComplete';
import SessionStatus from './components/SessionStatus';
import GatewayHeyLightPolling from './components/GatewayHeyLightPolling';
import SkeletonOrderDetails from '../cdspayments/components/paymentmethodslist/SkeletonOrderDetails';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

type Stage =
  | 'loading'
  | 'selection'
  | 'checkout'
  | 'heylight_polling'
  | 'success'
  | 'paid'
  | 'cancelled'
  | 'expired'
  | 'failed'
  | 'error';

// WordPress returns timestamps without timezone offset (UTC). Appending 'Z' prevents
// browsers from misinterpreting them as local time, which causes false expiry on UTC+N clients.
const parseUtcDate = (s: string) => new Date(s.replace(' ', 'T') + 'Z');

const GatewayPayment = () => {
  const { sessionKey } = useParams<{ sessionKey: string }>();
  const [searchParams] = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status');
  const heylightReturn = searchParams.get('heylight_return');

  const {
    session, paymentIntent, heylightStatus, successUrl,
    loading, error,
    setSession, setSuccessUrl, setLoading, setError, reset,
  } = useGatewayPaymentStore();

  const heylightUuid = heylightReturn && sessionKey
    ? localStorage.getItem(gatewayHeylightStorageKey(sessionKey))
    : null;

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
        // Klarna/Scalapay redirect back here — call /confirm, then show success screen
        if (redirectStatus === 'succeeded') {
          const { success_url } = await confirmGatewaySession(sessionKey);
          setSuccessUrl(success_url);
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionKey]);

  const stage = useMemo((): Stage => {
    if (loading) return 'loading';
    if (error) return 'error';

    if (heylightReturn && heylightUuid) {
      if (heylightStatus === 'success') return 'success';
      if (heylightStatus === 'cancelled') return 'failed';
      return 'heylight_polling';
    }

    if (successUrl) return 'success';
    if (redirectStatus === 'succeeded') return 'loading'; // waiting for /confirm to resolve
    if (redirectStatus === 'failed') return 'failed';
    if (!session) return 'loading';
    if (session.status === 'paid') return 'paid';
    if (session.status === 'cancelled') return 'cancelled';
    if (session.status === 'expired') return 'expired';
    if (parseUtcDate(session.expires_at) < new Date()) return 'expired';
    if (paymentIntent) return 'checkout';
    return 'selection';
  }, [loading, error, session, paymentIntent, redirectStatus, heylightReturn, heylightUuid, heylightStatus, successUrl]);

  return (
    <GatewayLayout session={session}>
      {stage === 'loading' && <SkeletonOrderDetails />}

      {stage === 'error' && (
        <div className="space-y-4 py-8 text-center">
          <p className="text-[#EC6F7B] font-medium">{error}</p>
          <p className="text-secondary text-sm">Verifica il link ricevuto o contatta il venditore.</p>
        </div>
      )}

      {stage === 'success' && session && (
        <SessionComplete session={session} successUrl={successUrl ?? session.success_url} />
      )}

      {(stage === 'paid' || stage === 'cancelled' || stage === 'expired' || stage === 'failed') && session && (
        <SessionStatus session={session} stage={stage} />
      )}

      {stage === 'selection' && session && sessionKey && (
        <>
          <SessionSummary session={session} />
          <SessionPaymentSelection session={session} sessionKey={sessionKey} />
        </>
      )}

      {stage === 'heylight_polling' && heylightUuid && sessionKey && (
        <>
          <SessionSummary session={session!} />
          <GatewayHeyLightPolling uuid={heylightUuid} sessionKey={sessionKey} />
        </>
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