import React, { createContext, useContext, useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useAuth } from "./AuthProvider.tsx";
import { useLocation } from "react-router-dom";

export interface PaymentProvider {
  isReady: boolean;
  stripe: Stripe | null;
}

export interface PaymentProviderProps extends React.PropsWithChildren {
}

const defaultContext: PaymentProvider = {
  get isReady() {
    return false;
  },
  get stripe() {
    return null;
  }
};

const Context = createContext<PaymentProvider>({ ...defaultContext });

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const data = useAuth()
  const location = useLocation()

  useEffect(() => {
    /*const stripeKey = document.querySelector("meta[name=\"stripe-key\"]")?.getAttribute("content") || "";*/
    if(data.isAuthenticated && (location.pathname.startsWith("/saldo") || location.pathname.startsWith("/acquisto") || location.pathname.startsWith("/thank-you-page") || location.pathname.startsWith("/acconto") || location.pathname.startsWith("/completa") || location.pathname.startsWith("/opera-bloccata"))) {
      const stripeKey = import.meta.env.VITE_STRIPE_KEY;
      if (!stripeKey) {
        //throw new Error(`No stripe key (${stripeKey})`)
        console.error("No stripe key");
        return;
      }

      loadStripe(stripeKey).then((stripe) => {
        setStripe(stripe);
        setReady(true);
      });
    }
  }, [location.pathname, data.isAuthenticated]);

  const paymentProvider: PaymentProvider = {
    get isReady() {
      return ready;
    },
    get stripe() {
      return stripe;
    }
  };

  //
  return (
    <>
      <Context.Provider value={paymentProvider}>
        <Elements stripe={stripe}>{children}</Elements>
      </Context.Provider>
    </>
  );
};

export const usePayments = () => useContext(Context);

export default PaymentProvider;
