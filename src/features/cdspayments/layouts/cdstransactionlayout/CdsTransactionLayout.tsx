import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from '../../components/ui/navbar/Navbar.tsx';
import useCdsPaymentStore from '../../stores/paymentStore.ts';

const CdsTransactionLayout = ({ children }: { children: ReactNode }) => {
  const { orderDetails } = useCdsPaymentStore();

  return (
    <div className="min-h-screen flex flex-col bg-primary pt-35">
      <div className="mx-auto w-full max-w-2xl flex flex-col flex-1">
        <Navbar returnUrl={orderDetails?.return_url ?? undefined} />
        <section className="px-8 pb-6 lg:px-0">
          <h2 className="text-4xl text-white font-normal">
            {orderDetails ? (
              <>
                Ordine <br /> N.{orderDetails.order_id}
              </>
            ) : (
              <span className="size-12 my-5 block border-2 border-white border-b-transparent rounded-full animate-spin" />
            )}
          </h2>
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

export default CdsTransactionLayout;
