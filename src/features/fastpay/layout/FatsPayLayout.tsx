import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import Logo from "../../../components/icons/Logo.tsx";
import FastPayDraw from "../components/fast-pay-draw/fast-pay-draw.tsx";
import { LogoutSharp } from "@mui/icons-material";

const FatsPayLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const isRoot = pathname.endsWith("fastpay");

  useEffect(() => {
    document.body.classList.add("fast-pay");
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("vendor-user"));
    checkAuth();
    window.addEventListener("vendor-login-success", checkAuth);
    window.addEventListener("vendor-logout", checkAuth);

    return () => {
      document.body.classList.remove("fast-pay");
      window.removeEventListener("vendor-login-success", checkAuth);
      window.removeEventListener("vendor-logout", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vendor-user");
    window.dispatchEvent(new Event("vendor-logout"));
  };

  return (
    <>
      <div className="min-h-screen flex flex-col pt-35" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="mx-auto w-full max-w-lg flex flex-col flex-1">
          <header className="fixed top-6 left-0 right-0 z-50 px-2">
            <nav className={`p-4 custom-navbar flex items-center bg-white max-w-lg mx-auto ${isRoot ? "justify-center" : "justify-between"}`}>
              {!isRoot && (
                <button
                  className="text-tertiary cursor-pointer underline underline-offset-3 leading-[125%]"
                  onClick={() => navigate(-1)}>
                  Torna indietro
                </button>
              )}
              <Logo />
            </nav>
          </header>
          <main className="flex-1 bg-white rounded-t-3xl p-8 pb-24">
            <Outlet />
          </main>
        </div>
        <footer className="p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary">
          <section className="max-w-lg mx-auto">
            {isLoggedIn && (
              <div className="mb-6">
                <button
                  className="flex gap-2 items-center text-secondary cursor-pointer"
                  onClick={handleLogout}>
                  Esci
                  <LogoutSharp fontSize="small" />
                </button>
              </div>
            )}
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
            </div>
            <div className="pt-8">
              <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
            </div>
          </section>
        </footer>
      </div>
      <FastPayDraw />
    </>
  );
};

export default FatsPayLayout;