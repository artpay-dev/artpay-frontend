import CountdownTimer from "../../../../components/CountdownTimer.tsx";
import { Button } from "@mui/material";

interface OfferCardProps {
  sharingButton?: boolean;
}

const OfferCard = ({sharingButton = false}:OfferCardProps) => {

  const getExpiryDate = (date: string): Date => {
    if (date) {
      const createdDate = new Date(date);
      const expiryDate = new Date(createdDate);
      expiryDate.setDate(createdDate.getDate() + 7);
      return expiryDate;
    }
    // Fallback: 7 giorni da ora se non abbiamo la data di creazione
    const now = new Date();
    const fallbackExpiry = new Date(now);
    fallbackExpiry.setDate(now.getDate() + 7);
    return fallbackExpiry;
  };

  return (
    <li className={"border border-[#E2E6FC] rounded-lg space-y-4 max-w-sm"}>
      <div className={"card-header pt-4 px-4"}>
        <span>Offerta N.0000</span>
        <div className="flex items-center gap-3 my-4">
          <img
            src="/images/immagine--galleria.png"
            alt=""
            width={400}
            height={400}
            className="rounded-sm object-cover h-8 w-8 aspect-square"
          />
          <div className={"flex flex-col"}>
            <span>Divinity, 2020</span>
            <span className={"text-secondary text-xs"}>Trudy Benson</span>
          </div>
        </div>
      </div>
      <div className={"card-body px-4"}>
        <span className={"text-secondary block mb-1"}>L'offerta scade tra:</span>
        <CountdownTimer expiryDate={getExpiryDate("2025-09-25T17:37:14")} />
        <ul className={"flex flex-col gap-4 mt-4"}>
          <li className={"flex flex-col gap-1"}>
            <span className={"text-secondary"}>Prezzo</span>
            <span>€ 2.000,00</span>
          </li>
          <li className={"flex flex-col gap-1"}>
            <span className={"text-secondary"}>Sconto</span>
            <span>20&nbsp;%</span>
          </li>
        </ul>
      </div>
      <div className={"card-footer border-t border-[#E2E6FC] text-secondary p-4 flex flex-col gap-4"}>
        {sharingButton ? (
            <Button variant={"contained"}>Condividi</Button>
          ) : (
          <>
            <Button variant={"outlined"}>Vedi dettaglio</Button>
            <Button variant={"text"} color={"inherit"}>
              Elimina offerta
            </Button>
          </>
        )}
      </div>
    </li>
  );
};

export default OfferCard;