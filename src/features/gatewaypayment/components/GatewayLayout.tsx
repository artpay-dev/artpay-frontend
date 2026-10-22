import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import LogoFastArtpay from '../../../components/icons/LogoFastArtpay.tsx';
import type { GatewaySession } from '../types';

const GatewayNavbar = ({ cancelUrl }: { cancelUrl?: string }) => {
  const handleBack = () => {
    if (cancelUrl) {
      window.location.href = cancelUrl;
    } else {
      window.history.back();
    }
  };

  return (
    <header className="fixed w-full z-50 top-6 px-2 max-w-2xl md:px-0">
      <nav className="p-4 custom-navbar flex justify-between items-center w-full bg-white">
        <button
          className="text-tertiary cursor-pointer underline underline-offset-3 leading-[125%]"
          onClick={handleBack}>
          Torna indietro
        </button>
        <LogoFastArtpay />
      </nav>
    </header>
  );
};

const GatewayLayout = ({ children, session }: { children: ReactNode; session: GatewaySession | null }) => {
  return (
    <div
      className="min-h-screen flex flex-col pt-35"
      style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="mx-auto w-full max-w-2xl flex flex-col flex-1">
        <GatewayNavbar cancelUrl={session?.cancel_url} />
        <section className="px-8 pb-6 lg:px-0">
          {session ? (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
              <h3 className="font-semibold text-tertiary text-sm">Pagamento sicuro con artpay</h3>
              <div className="border-t border-gray-100 pt-2">
                <p className="leading-[125%] text-balance text-secondary text-sm">
                  Stai per completare un pagamento tramite artpay. Inserisci i dati della tua carta per procedere in modo sicuro.
                </p>
              </div>
            </div>
          ) : (
            <span className="size-12 my-5 block border-2 border-white border-b-transparent rounded-full animate-spin" />
          )}
        </section>
        <main className="flex-1 bg-white rounded-t-3xl p-8 pb-24">{children}</main>
      </div>
      <footer className="p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary">
        <section className="max-w-2xl mx-auto">
          <p>© artpay srl 2024 - Tutti i diritti riservati</p>
          <div className="flex items-center gap-4 border-b border-gray-300 py-8 flex-wrap">
            <a
              href="https://www.iubenda.com/privacy-policy/71113702"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Privacy Policy">
              Privacy Policy
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Cookie Policy">
              Cookie Policy
            </a>
            <NavLink to="/termini-e-condizioni" className="underline-none text-primary">
              Termini e condizioni
            </NavLink>
            <NavLink to="/condizioni-generali-di-acquisto" className="underline-none text-primary">
              Condizioni generali di acquisto
            </NavLink>
          </div>
          <div className="pt-8">
            <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default GatewayLayout;