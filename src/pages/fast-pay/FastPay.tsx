import { useEffect, useState } from "react";
import useListDrawStore from "../../features/fastpay/stores/listDrawStore.tsx";
import LoginComponent from "../../features/fastpay/components/login-component.tsx";

const FastPay = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setOpenListDraw } = useListDrawStore();

  useEffect(() => {
    const vendorUser = localStorage.getItem("vendor-user");
    setIsAuthenticated(!!vendorUser);
    setIsLoading(false);

    const handleLoginSuccess = () => {
      setIsAuthenticated(true);
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener("vendor-login-success", handleLoginSuccess);
    window.addEventListener("vendor-logout", handleLogout);

    return () => {
      window.removeEventListener("vendor-login-success", handleLoginSuccess);
      window.removeEventListener("vendor-logout", handleLogout);
    };
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginComponent />;
  }

  return (
    <main className="text-white text-2xl flex flex-col h-full mx-auto max-w-lg px-6">
      <h1 className={"text-secondary "}>Menu FastPay</h1>
      <ul className={"mt-6 space-y-6"}>
        <li>
          <button onClick={() => setOpenListDraw({ openListDraw: true })}>Lista offerte/ Crea offerta</button>
        </li>
        <li className={"opacity-10"}>Lista contatti/ Aggiungi</li>
        <li className={"opacity-10"}>Lista leads</li>
        <li className={"opacity-10"}>Libretto</li>
        <li className={"opacity-10"}>Form Contatto</li>
      </ul>
    </main>
  );
};

export default FastPay;