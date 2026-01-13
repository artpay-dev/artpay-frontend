import React from "react";
import OrderCard from "./OrderCard.tsx";
import { OrderStatus } from "../types/order.ts";
import TransactionCard from "../features/directpurchase/components/transaction-card.tsx";

export interface OrderHistoryCardProps {
  id: number;
  title: string;
  subtitle?: string;
  galleryName: string;
  orderType?: string;
  formattePrice: string;
  purchaseDate: string;
  dateCreated: string;
  purchaseMode: string;
  waitingPayment?: boolean;
  imgSrc: string;
  status: OrderStatus;
  onClick?: (orderId: number) => Promise<void>;
  expiryDate?: string;
  customer_note?: string;
  quoteNotes?: string;
  quoteConditions?: string;
  orderKey?: string;
  email?: string;
  onQuoteAccepted?: () => void;
  onQuoteRejected?: () => void;
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
  customer_note,
  expiryDate,
  quoteConditions,
  quoteNotes,
  orderKey,
  email,
}) => {
  if (status != "completed")
    return (
      <TransactionCard
        orderType={orderType}
        customer_note={customer_note}
        id={id}
        title={title}
        galleryName={galleryName}
        formattePrice={formattePrice}
        purchaseDate={purchaseDate}
        dateCreated={dateCreated}
        purchaseMode={purchaseMode}
        imgSrc={imgSrc}
        status={status}
        expiryDate={expiryDate}
        onClick={onClick}
        quoteNotes={quoteNotes}
        quoteConditions={quoteConditions}
        orderKey={orderKey}
        email={email}
      />
    );

  return (
    <OrderCard
      imgSrc={imgSrc}
      orderId={id}
      onClick={onClick ? () => onClick(id) : undefined}>
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
