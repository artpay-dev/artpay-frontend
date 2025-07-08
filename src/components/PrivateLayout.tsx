import React, { useEffect } from "react";
import Footer from "./Footer.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import usePaymentStore from "../features/cdspayments/stores/paymentStore.ts";
import DashboardNavbar from "./DashboardNavbar.tsx";
import Logo from "./icons/Logo.tsx";
import { NavLink, useLocation } from "react-router-dom";

interface PrivateLayoutProps {
  children: React.ReactNode;
  authRequired?: boolean;
}

const PrivateLayout = ({ authRequired = false, children }: PrivateLayoutProps) => {
  const { pathname } = useLocation();
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
    <div className={"min-h-screen flex flex-col"}>
      <DashboardNavbar />
      <aside className={"absolute left-0 top-0 z-50 custom-sidebar ps-6 bg-white min-h-screen pt-12 min-w-[270px] max-w-[270px]"}>
        <div className={"mb-12"}>
          <Logo />
        </div>
        <ul className={"space-y-8"}>
          <li className={"leading-[125%]"}>
            <NavLink
              to={"/dashboard"}
              className={`px-4 py-2 transition-all  hover:text-primary  ${
                pathname === "/dashboard" ? "text-primary bg-[#F5F5F5] rounded-full" : "text-tertiary"
              }`}>
              Dashboard
            </NavLink>
          </li>
          <li className={"leading-[125%]"}>
            <NavLink
              to={"/opere"}
              className={`px-4 py-2 transition-all  hover:text-primary  ${
                pathname === "/opere" ? "text-primary bg-[#F5F5F5] rounded-full" : "text-tertiary"
              }`}>
              Opere
            </NavLink>
          </li>
          <li className={"leading-[125%]"}>
            <NavLink
              to={"/guide"}
              className={`px-4 py-2 transition-all  hover:text-primary  ${
                pathname.includes("/guide") ? "text-primary bg-[#F5F5F5] rounded-full" : "text-tertiary"
              }`}>
              Guide
            </NavLink>
          </li>
          <li className={"leading-[125%]"}>
            <NavLink
              to={"/contatti"}
              className={`px-4 py-2 transition-all  hover:text-primary  ${
                pathname === "/contatti" ? "text-primary bg-[#F5F5F5] rounded-full" : "text-tertiary"
              }`}>
              Contatti
            </NavLink>
          </li>
          <li className={"leading-[125%]"}>
            <NavLink
              to={"/faq"}
              className={`px-4 py-2 transition-all  hover:text-primary  ${
                pathname === "/faq" ? "text-primary bg-[#F5F5F5] rounded-full" : "text-tertiary"
              }`}>
              Faq
            </NavLink>
          </li>
        </ul>
      </aside>
      <main className={"flex-1 pt-32 w-full ps-68"}>
        <div className={"ps-8"}>{children}</div>
      </main>
      <Footer />
      {openDraw && <div className={"overlay fixed z-20 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"}></div>}
    </div>
  );
};

export default PrivateLayout;
