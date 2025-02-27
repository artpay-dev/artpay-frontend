import React from "react";
import SantanderCard from "./SantanderCard.tsx";
import { Artwork } from "../types/artwork.ts";

type LoanCardProp = {
  artwork?: Partial<Artwork>
}

const LoanCard: React.FC<LoanCardProp> = ({artwork}) => {
  return (
    <div className={'rounded-3xl bg-primary-dark flex flex-col justify-between py-8 lg:flex-row lg:items-center'}>
      <div className={'flex flex-col gap-6 px-10'}>
        <h5 className={'text-3xl text-white'}>
          Richiedi un prestito
        </h5>
        <p className={'text-white leading-5'}>
          Ecco le migliori offerte di prestito provenienti dagli istituti bancari nostri partner. Scegli quella che
          preferisci e prosegui sulla pagina dedicata ad artpay sul sito dell’istituto finanziario selezionato, dove
          potrai personalizzare il prestito in ogni suo aspetto.
        </p>
        <p className={'text-sm text-gray-300'}>
          *la richiesta di prestito non garantisce la prenotazione dell'opera.”
        </p>
      </div>
      <div className={'px-10'}>
        <SantanderCard sx={{ width: "auto", p: 3, px: 5, mt: 3 }} artwork={artwork}/>
      </div>
    </div>
  );
};

export default LoanCard;
