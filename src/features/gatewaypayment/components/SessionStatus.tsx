import type { GatewaySession } from '../types';

type NonPendingStage = 'paid' | 'cancelled' | 'expired' | 'failed';

const CONFIG: Record<NonPendingStage, { title: string; description: string; iconColor: string }> = {
  paid: {
    title: 'Pagamento già ricevuto',
    description: 'Questa sessione di pagamento è già stata completata. Non è necessario effettuare ulteriori azioni.',
    iconColor: '#42B396',
  },
  cancelled: {
    title: 'Pagamento annullato',
    description: 'Questa sessione di pagamento è stata annullata. Contatta il venditore se pensi si tratti di un errore.',
    iconColor: '#EC6F7B',
  },
  expired: {
    title: 'Sessione scaduta',
    description: 'Il tempo disponibile per completare il pagamento è scaduto. Torna al negozio per generare un nuovo ordine.',
    iconColor: '#EC6F7B',
  },
  failed: {
    title: 'Pagamento non riuscito',
    description: 'Si è verificato un errore durante il pagamento. Torna al negozio e riprova.',
    iconColor: '#EC6F7B',
  },
};

const SessionStatus = ({ session, stage }: { session: GatewaySession; stage: NonPendingStage }) => {
  const { title, description, iconColor } = CONFIG[stage];
  const borderColor = stage === 'paid' ? 'border-[#42B396]' : 'border-[#EC6F7B]';
  const bgColor = stage === 'paid' ? 'bg-[#42B39610]' : 'bg-[#FAFAFB]';

  return (
    <section className="space-y-6">
      <div className="border-t border-secondary mt-12">
        <h3 className="text-secondary py-4.5 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 5a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1zm0 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
              fill={iconColor}
            />
          </svg>
          {title}
        </h3>
        <div className={`${bgColor} p-4 rounded-lg w-full border ${borderColor}`}>
          <div className="space-y-6">
            <p className="leading-[125%] text-secondary">{description}</p>
            {session.cancel_url && (
              <a
                href={session.cancel_url}
                className="artpay-button-style bg-primary hover:bg-primary-hover text-white block text-center">
                Torna al negozio
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionStatus;