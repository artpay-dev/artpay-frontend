import React, { useEffect } from "react";
import Footer from "./Footer.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";
import DashboardNavbar from "./DashboardNavbar.tsx";

interface PrivateLayoutProps {
  children: React.ReactNode;
  authRequired?: boolean;
}

const PrivateLayout = ({authRequired = false, children } : PrivateLayoutProps)  => {
  const auth = useAuth();


  const { openDraw } = usePaymentStore();

  useEffect(() => {
    if (authRequired && !auth.isAuthenticated) {
      auth.login();
    }
  }, [auth, auth.isAuthenticated, authRequired]);


  useEffect(() => {
    document.body.style.setProperty("--background", "none");

    if (openDraw) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

  }, [ openDraw]);


  return (
    <div className={'min-h-screen flex flex-col mx-auto max-w-screen-2xl'}>
      <DashboardNavbar />
      <main className={'flex-1 pt-32'}>

        {children}
      </main>
      <Footer />
      {openDraw && <div className={"overlay fixed z-20 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"}></div>}
    </div>
  );
};

export default PrivateLayout;
