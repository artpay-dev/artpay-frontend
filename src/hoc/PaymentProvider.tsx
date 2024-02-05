import React, { createContext, useContext, useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

export interface PaymentProvider {
  isReady: boolean;
  stripe: Stripe | null;
}

export interface PaymentProviderProps extends React.PropsWithChildren {}

const defaultContext: PaymentProvider = {
  get isReady() {
    return false;
  },
  get stripe() {
    return null;
  },
};

const Context = createContext<PaymentProvider>({ ...defaultContext });

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    const stripeKey = document.querySelector('meta[name="stripe-key"]')?.getAttribute("content") || "...";
    if (!stripeKey) {
      //throw new Error(`No stripe key (${stripeKey})`)
      console.error("No stripe key");
      return;
    }
    loadStripe(stripeKey).then((stripe) => {
      setStripe(stripe);
      setReady(true);
    });
  }, []);

  const paymentProvider: PaymentProvider = {
    get isReady() {
      return ready;
    },
    get stripe() {
      return stripe;
    },
  };
  //
  return (
    <>
      <Context.Provider value={paymentProvider}>{children}</Context.Provider>
    </>
  );
};

export const usePayments = () => useContext(Context);

export default PaymentProvider;
