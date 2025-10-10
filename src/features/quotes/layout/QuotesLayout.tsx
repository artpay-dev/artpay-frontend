import { Outlet } from "react-router-dom";
import React, { useEffect } from "react";
import Logo from "../../../components/icons/Logo.tsx";
import { Typography, Link } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <footer className="mt-6 space-y-6 pb-6 max-w-lg mx-auto px-6">
      <div>
        <Typography variant="body2" color="textSecondary">
          © artpay srl 2024 - Tutti i diritti riservati
        </Typography>
      </div>
      <div className="flex flex-wrap gap-4">
        <Typography variant="body2" color="primary">
          <Link
            sx={{ textDecoration: "none" }}
            href="https://www.iubenda.com/privacy-policy/71113702"
            title="Privacy Policy">
            Privacy
          </Link>
        </Typography>
        <Typography variant="body2" color="primary">
          <Link
            sx={{ textDecoration: "none" }}
            href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
            title="Cookie Policy">
            Informativa sui cookie
          </Link>
        </Typography>
        <Typography variant="body2" color="primary">
          <Link sx={{ textDecoration: "none" }} href="/termini-e-condizioni">
            Termini e condizioni
          </Link>
        </Typography>
        <Typography variant="body2" color="primary">
          <Link sx={{ textDecoration: "none" }} href="/condizioni-generali-di-acquisto">
            Condizioni generali di acquisto
          </Link>
        </Typography>
      </div>
    </footer>
  );
};

const QuotesLayout = () => {
  useEffect(() => {
    document.body.classList.add("quotes-page");

    return () => {
      document.body.classList.remove("quotes-page");
    };
  }, []);

  return (
    <>
      <div className="bg-tertiary min-h-screen w-full flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 pt-6 pb-6 w-full px-6">
          <div className="flex items-center justify-center w-full max-w-lg md:mx-auto">
            <div className="custom-navbar bg-white p-6 w-fit">
              <Logo />
            </div>
          </div>
        </nav>
        <div className="pt-20 mt-20 flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default QuotesLayout;