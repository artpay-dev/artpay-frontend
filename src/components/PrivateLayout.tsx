import React, { useEffect } from "react";
import { useAuth } from "../hoc/AuthProvider.tsx";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";
import DefaultLayout from "./DefaultLayout.tsx";

interface PrivateLayoutProps {
  children: React.ReactNode;
  authRequired?: boolean;
}

const PrivateLayout = ({ authRequired = false, children }: PrivateLayoutProps) => {
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
  }, [openDraw]);

  return (
    <DefaultLayout hasNavBar={true}>
        <div className={"ps-8"}>{children}</div>
    </DefaultLayout>
  );
};

export default PrivateLayout;
