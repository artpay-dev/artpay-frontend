import React from "react";
import OrderCard from "./OrderCard.tsx";
import { Button } from "@mui/material";
import { OrderStatus } from "../types/order.ts";

export interface OrderHistoryCardProps {
  id: number;
  title: string;
  subtitle: string;
  galleryName: string;
  formattePrice: string;
  purchaseDate: string;
  purchaseMode: string;
  waitingPayment: boolean;
  imgSrc: string;
  status: OrderStatus;
  onClick?: (orderId: number) => Promise<void>;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
                                                             id,
                                                             formattePrice,
                                                             purchaseDate,
                                                             purchaseMode,
                                                             subtitle,
                                                             title,
                                                             imgSrc,
                                                             onClick
                                                           }) => {


  return (
    <OrderCard imgSrc={imgSrc}
               leftCta={onClick &&
                 <Button sx={{ mt: 2, width: "100%" }} onClick={() => onClick(id)} variant="contained">
                   Compra ora</Button>
               }>
      <div>
        <ul className={'space-y-2'}>
          <li>
            <span className={'leading-[125%]'}>N. Ordine {id}</span>
          </li>
          <li className={'flex flex-col leading-[125%]'}>
            <span>Data dell'ordine</span>
            <span className={' text-secondary'}>{purchaseDate}</span>
          </li>
          <li className={'flex flex-col leading-[125%]'}>
            <span>Metodo di pagamento</span>
            <span className={' text-secondary'}>{purchaseMode}</span>
          </li>
          <li className={'flex flex-col leading-[125%]'}>
            <span>{title}</span>
            <span className={' text-secondary'}>{subtitle}</span>
          </li>
          <li className={'leading-[125%] text-2xl'}>
            <span>{formattePrice}</span>
          </li>
        </ul>
      </div>
    </OrderCard>
  );
};

export default OrderHistoryCard;
