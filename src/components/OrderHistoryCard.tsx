import React from "react";
import OrderCard from "./OrderCard.tsx";
import { Button } from "@mui/material";
import { OrderStatus } from "../types/order.ts";
import CountdownTimer from "./CountdownTimer.tsx";

export interface OrderHistoryCardProps {
  id: number;
  title: string;
  subtitle: string;
  galleryName: string;
  orderType?: string;
  formattePrice: string;
  purchaseDate: string;
  dateCreated: string;
  purchaseMode: string;
  waitingPayment: boolean;
  imgSrc: string;
  status: OrderStatus;
  onClick?: (orderId: number) => Promise<void>;
  expiryDate?: string;
  customer_note?: string;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
  id,
  formattePrice,
  purchaseDate,
  dateCreated,
  purchaseMode,
  galleryName,
  title,
  imgSrc,
  onClick,
  orderType,
  status,
  expiryDate,
  customer_note,
}) => {
  const getExpiryDate = (): Date => {
    // Se abbiamo una expiryDate dall'ordine, usala
    if (expiryDate) {
      return new Date(expiryDate);
    }
    // Altrimenti calcola 7 giorni dalla data di creazione dell'ordine
    if (dateCreated) {
      const createdDate = new Date(dateCreated);
      const calculatedExpiry = new Date(createdDate);
      calculatedExpiry.setDate(createdDate.getDate() + 7);
      return calculatedExpiry;
    }
    // Fallback: 7 giorni da ora se non abbiamo nessuna data
    const now = new Date();
    const fallbackExpiry = new Date(now);
    fallbackExpiry.setDate(now.getDate() + 7);
    return fallbackExpiry;
  };

  if (status != "completed")
    return (
      <div className="flex flex-col h-full border border-[#E2E6FC] rounded-lg max-w-md">
        <div className={"card-header flex p-4 gap-3 items-center justify-between border-b border-[#E2E6FC]"}>
          <div className="flex gap-3 items-center">
            <div className={"overflow-hidden size-8 rounded-md"}>
              <img src={imgSrc} alt="Img order" className={"object-cover h-full w-full"} />
            </div>
            <div className={"flex flex-col gap-1"}>
              <span>{title}</span>
            </div>
          </div>
          <div className={"flex flex-col gap-1"}>
            <strong>{formattePrice}</strong>
          </div>
        </div>
        <div className={"card-body flex-1 min-h-20 p-4 flex-col space-y-4"}>
          <div className={"flex flex-col "}>
            <span>Tipo:</span>
            <span className={"text-secondary"}>{orderType}</span>
          </div>

          {purchaseMode.includes("Blocco opera") && (
            <div className={"space-y-1"}>
              <p className={"text-secondary"}>Scadenza della prenotazione</p>
              <CountdownTimer expiryDate={getExpiryDate()} />
            </div>
          )}

          {status !== "failed" ? (
            <div className={"w-full rounded-sm bg-[#FED1824D] p-4 space-y-2 flex flex-col"}>
              {purchaseMode?.includes("Blocco opera") && (
                <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#6576EE] text-white w-fit"}>
                Opera prenotata
              </span>
              )}
              <div className={"flex flex-col gap-1"}>
                <span className={"text-secondary"}>Stato</span>
                <span>{customer_note}</span>
              </div>
            </div>
          ) : (
            <>
              <div className={"w-full rounded-sm bg-[#EC6F7B40] p-4 space-y-2 flex flex-col"}>
                <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#EC6F7B] text-white w-fit"}>
                  Transazione fallita
                </span>
              </div>
            </>
          )}
        </div>

        <div className={"card-footer border-t border-[#E2E6FC] p-4"}>
          {onClick && (
            <Button sx={{ mt: 2, width: "100%" }} onClick={() => onClick(id)} variant="outlined">
              Gestisci transazione
            </Button>
          )}
        </div>
      </div>
    );

  return (
    <OrderCard
      imgSrc={imgSrc}
      orderId={id}
      leftCta={
        onClick && (
          <Button sx={{ mt: 2, width: "100%" }} onClick={() => onClick(id)} variant="outlined">
            Gestisci la transazione
          </Button>
        )
      }>
      <div>
        <ul className={"space-y-2"}>
          <li className={"flex flex-col leading-[125%]"}>
            <span>Tipo</span>
            <span className={" text-secondary"}>{orderType}</span>
          </li>
          <li className={"flex flex-col leading-[125%]"}>
            <span>Data dell'ordine</span>
            <span className={" text-secondary"}>{purchaseDate}</span>
          </li>
          <li className={"flex flex-col leading-[125%]"}>
            <span>Metodo di pagamento</span>
            <span className={" text-secondary"}>{purchaseMode}</span>
          </li>
          <li className={"flex flex-col leading-[125%]"}>
            <span>{title}</span>
            <span className={" text-secondary"}>{galleryName}</span>
          </li>
          <li className={"leading-[125%] text-2xl"}>
            <span>{formattePrice}</span>
          </li>
        </ul>
      </div>
    </OrderCard>
  );
};

export default OrderHistoryCard;
