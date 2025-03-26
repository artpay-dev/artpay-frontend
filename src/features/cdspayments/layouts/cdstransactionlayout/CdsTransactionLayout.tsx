import { ReactNode } from "react";
import Navbar from "../../../../components/navbar/Navbar.tsx";
import { NavLink } from "react-router-dom";
import usePaymentStore from "../../store.ts";
import SkeletonOrderDetails from "../../components/paymentmethodslist/SkeletonOrderDetails.tsx";
import OrderSummary from "../../components/ordersummary/OrderSummary.tsx";
import VendorDetails from "../../components/vendordetails/VendorDetails.tsx";
import CdsTransactionsProvider from "../../hoc/cdstransactionsprovider/CdsTransactionsProvider.tsx";

const CdsTransactionLayout = ({ children }: { children: ReactNode }) => {
  const { order, vendor } = usePaymentStore();

  return (
    <CdsTransactionsProvider>
      <div className="min-h-screen flex flex-col bg-primary pt-35">
        <div className="mx-auto container md:max-w-xl lg:max-w-4xl">
          <Navbar />
          <section className="px-8 mb-6 container lg:px-0">
            <h2 className="text-4xl text-white font-normal">
              {order ? (
                <>
                  Ordine <br /> N.{order.id}
                </>
              ) : (
                <span className="size-12 my-5 block border-2 border-white border-b-transparent rounded-full animate-spin"></span>
              )}
            </h2>
          </section>
          <main className="flex-1 bg-white rounded-t-3xl p-8 pb-24">
            {!order ? <SkeletonOrderDetails /> : <OrderSummary vendor={vendor} order={order} />}
            {children}
            {vendor && <VendorDetails vendor={vendor} />}
          </main>
        </div>
        <footer className={"p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary"}>
          <section className={"md:max-w-xl lg:max-w-4xl mx-auto"}>
            <p>© artpay srl 2024 - Tutti i diritti riservati</p>
            <div className={"flex items-center gap-4 border-b border-gray-300 py-8 flex-wrap"}>
              <a
                href="https://www.iubenda.com/privacy-policy/71113702"
                className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
                title="Privacy Policy ">
                Privacy Policy
              </a>
              <a
                href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
                className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
                title="Cookie Policy ">
                Cookie Policy
              </a>
              <NavLink to="/termini-e-condizioni" className={"underline-none text-primary"}>
                Termini e condizioni
              </NavLink>

              <NavLink to="/condizioni-generali-di-acquisto" className={"underline-none text-primary"}>
                Condizioni generali di acquisto
              </NavLink>
            </div>
            <div className={"pt-8"}>
              <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
            </div>
          </section>
        </footer>
      </div>
    </CdsTransactionsProvider>
  );
};

export default CdsTransactionLayout;
