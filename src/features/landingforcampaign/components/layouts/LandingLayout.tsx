import { ReactNode } from "react";
import Logo from "../../../../components/icons/Logo.tsx";
import { NavLink } from "react-router-dom";

const LandingLayout = ({ children }: { children: ReactNode }) => {

  return (
    <>
      <div className={"min-h-screen flex flex-col max-w-screen-2xl mx-auto"}>
        <header className={"fixed w-full z-50 top-6 lg:px-6 max-w-screen-2xl"}>
          <nav className={"p-4 custom-navbar flex justify-center w-full bg-white "}>
            <Logo />
          </nav>
        </header>
        <main className={"flex-1 flex flex-col w-full px-6 pt-28 scroll-pt-28 lg:pt-37.5 lg:px-12 lg:flex-row lg:justify-between gap-8 scroll-mt-37.5 min-h-screen"}>
          {children}
        </main>
      </div>
      <footer className={"p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary"}>
        <section className={"max-w-[1344px] mx-auto text-center lg:text-start"}>
          <p>© artpay srl 2024 - Tutti i diritti riservati</p>
          <div className={"flex flex-col items-center gap-4 border-b border-gray-300 py-8 md:flex-row"}>
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
    </>
  );
};

export default LandingLayout;
