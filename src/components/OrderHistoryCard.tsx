import React from "react";
import OrderCard from "./OrderCard.tsx";
import { Typography } from "@mui/material";
import DisplayProperty from "./DisplayProperty.tsx";

export interface OrderHistoryCardProps {
  title: string;
  subtitle: string;
  galleryName: string;
  formattePrice: string;
  purchaseDate: string;
  purchaseMode: string;
  imgSrc: string;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
  formattePrice,
  galleryName,
  purchaseDate,
  purchaseMode,
  subtitle,
  title,
  imgSrc,
}) => {
  return (
    <OrderCard imgSrc={imgSrc}>
      <Typography
        variant="h2"
        sx={{
          mb: 1,
          pb: 1,
        }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mb: 1 }} color="textSecondary">
        {subtitle}
      </Typography>
      <DisplayProperty label="Nome galleria" value={galleryName} gap={0} variant="h6" sx={{ mt: 1, mb: 3 }} />
      <Typography variant="h5">{formattePrice}</Typography>
      <DisplayProperty label="Data di acquisto" value={purchaseDate} gap={0} variant="h6" sx={{ mt: 2, mb: 0 }} />
      <DisplayProperty label="Modalità di acquisto" value={purchaseMode} gap={0} variant="h6" sx={{ mt: 3, mb: 2 }} />
    </OrderCard>
  );
};

export default OrderHistoryCard;
