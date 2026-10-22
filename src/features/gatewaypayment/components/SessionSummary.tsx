import type { GatewaySession } from '../types';

const fmt = (amount: number, currency: string) =>
  (amount / 100).toLocaleString('it-IT', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const parseUtcDate = (s: string) => new Date(s.replace(' ', 'T') + 'Z');

const ExpiryBadge = ({ expiresAt }: { expiresAt: string }) => {
  const minutesLeft = Math.floor((parseUtcDate(expiresAt).getTime() - Date.now()) / 60000);
  if (minutesLeft > 10) return null;
  const label = minutesLeft <= 1 ? 'Scade tra meno di 1 minuto' : `Scade tra ${minutesLeft} minuti`;
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
      {label}
    </span>
  );
};

const SessionSummary = ({ session }: { session: GatewaySession }) => {
  return (
    <div className="space-y-5 mb-8">
      <div className="border-t border-gray-100 pt-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Riferimento ordine</span>
          <span className="text-tertiary font-medium">#{session.order_ref}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="font-semibold text-tertiary">Totale</span>
          <span className="font-semibold text-tertiary">{fmt(session.amount, session.currency)}</span>
        </div>
      </div>
      <ExpiryBadge expiresAt={session.expires_at} />
    </div>
  );
};

export default SessionSummary;