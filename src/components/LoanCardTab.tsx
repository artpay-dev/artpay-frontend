import React from "react";
import SantanderCard from "./SantanderCard.tsx";
import { PaymentIntent } from "@stripe/stripe-js";

type LoanCardTabProps = {
  paymentIntent?: PaymentIntent
}


const LoanCardTab: React.FC<LoanCardTabProps> = ({paymentIntent}) => {
  return (
    <div className={'flex flex-col justify-between py-8'}>
      <div className={'flex flex-col gap-6 px-10 text-tertiary'}>
        <h5 className={'text-3xl'}>
          Scegli tra i nostri partner
        </h5>
        <p className={'leading-5'}>
          Ecco le migliori offerte di prestito provenienti dagli istituti bancari nostri partner. Scegli quella che
          preferisci e prosegui sulla pagina dedicata ad artpay sul sito dell’istituto finanziario selezionato, dove
          potrai personalizzare il prestito in ogni suo aspetto.
        </p>
        <p className={'text-sm text-gray-700'}>
          *la richiesta di prestito non garantisce la prenotazione dell'opera.”
        </p>
      </div>
      <div className={'px-10'}>
        <SantanderCard sx={{ width: "auto", p: 3, px: 5, mt: 3 }} paymentIntent={paymentIntent} isCheckOut={true} />
      </div>
    </div>
  );
};

export default LoanCardTab;
