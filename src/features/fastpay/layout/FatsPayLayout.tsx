import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import Logo from "../../../components/icons/Logo.tsx";
import ArrowLeftIcon from "../../../components/icons/ArrowLeftIcon.tsx";
import { Link, Typography } from "@mui/material";
import FastPayDraw from "../components/fast-pay-draw/fast-pay-draw.tsx";

const BackButton: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const navigate = useNavigate();

  if (!isVisible) return <div />;

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="custom-navbar flex p-6 md:p-6 bg-white">
      <button className="underline flex items-center gap-2  cursor-pointer" onClick={handleGoBack} type="button">
        <ArrowLeftIcon color="primary" />
        <span className="hidden md:block">Torna indietro</span>
      </button>
    </div>
  );
};


const Footer :  React.FC<{ isVisible: boolean }> = ({ isVisible }) => {

  if (!isVisible) return <div />;

  return (
    <footer className={"mt-6 space-y-6 pb-6 max-w-lg mx-auto px-6"}>
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
            title="Privacy Policy ">
            Privacy
          </Link>
        </Typography>
        <Typography variant="body2" color="primary">
          <Link
            sx={{ textDecoration: "none" }}
            href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
            title="Cookie Policy ">
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
        <Typography variant="body2"></Typography>
      </div>
    </footer>
  )
}

const FatsPayLayout = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    document.body.classList.add("fast-pay");
    setIsVisible(pathname.endsWith("fastpay"));

    return () => {
      document.body.classList.remove("fast-pay");
    };
  }, [pathname]);

  return (
    <>
      <div className="bg-tertiary min-h-screen w-full flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 pt-6 pb-6 w-full px-6">
          <div className="flex items-center justify-between w-full max-w-lg md:mx-auto">
            <BackButton isVisible={!isVisible} />
            <div className="custom-navbar bg-white p-6 w-fit ">
              <Logo />
            </div>
          </div>
        </nav>
        <div className="pt-20 mt-20 flex-1">
          <Outlet />
        </div>
        <Footer isVisible={isVisible} />
      </div>
      <FastPayDraw />
    </>
  );
};

export default FatsPayLayout;
