import React from "react";
import OrderCard from "./OrderCard.tsx";
import { Button, Typography } from "@mui/material";
import DisplayProperty from "./DisplayProperty.tsx";
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
                                                             waitingPayment,
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
      <Typography
        variant="h4"
        sx={{
          mb: 0,
          pb: 0
        }}>
        {title}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1 }} color="textSecondary">
        {subtitle}
      </Typography>
      <Typography sx={{ my: 1 }} variant="subtitle1">{formattePrice}</Typography>
      {/*<DisplayProperty label="Nome galleria" value={galleryName} gap={0} variant="subtitle1" sx={{ my: 1 }} />*/}
      <DisplayProperty label="Data di acquisto" value={purchaseDate} gap={0} variant="subtitle1" sx={{ my: 1 }} />
      <DisplayProperty label="Modalità di acquisto" value={purchaseMode} gap={0} variant="subtitle1" sx={{ my: 1 }} />
      {waitingPayment && <Typography variant="body1">Pagamento non ancora effettuato</Typography>}
    </OrderCard>
  );
};

export default OrderHistoryCard;
