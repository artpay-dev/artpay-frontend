import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Logo from "../../../components/icons/Logo.tsx";
import { NavLink } from "react-router-dom";

const QuotesLayout = () => {
  useEffect(() => {
    document.body.classList.add("quotes-page");
    return () => {
      document.body.classList.remove("quotes-page");
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col pt-35" style={{ backgroundColor: "var(--color-primary)" }}>
      <div className="mx-auto w-full max-w-lg flex flex-col flex-1">
        <header className="fixed top-6 left-0 right-0 z-50 px-2">
          <nav className="p-4 custom-navbar flex items-center justify-center bg-white max-w-lg mx-auto">
            <Logo />
          </nav>
        </header>
        <main className="flex-1 bg-white rounded-t-3xl p-8 pb-24">
          <Outlet />
        </main>
      </div>
      <footer className="p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary">
        <section className="max-w-lg mx-auto">
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

export default QuotesLayout;