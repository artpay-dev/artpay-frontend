import React from "react";
import { Box, Link, Typography } from "@mui/material";
import OrderCard from "./OrderCard.tsx";

export interface OrderLoanCardProps {
  id: string;
  artistName: string;
  title: string;
  slug: string;
  galleryName: string;
  galleryId: string;
  isFavourite?: boolean;
  price?: number;
  imgUrl?: string;
}

const OrderLoanCard: React.FC<OrderLoanCardProps> = ({ title, artistName, galleryName, price, imgUrl }) => {
  return (
    <OrderCard imgSrc={imgUrl}>
      <Typography sx={{ mb: 1 }} variant="h4">
        {title}
      </Typography>
      <Typography sx={{ mb: 2 }} variant="h5" color="textSecondary">
        {artistName}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        Acrylic & ink on paper
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        91,4 x 61 cm
      </Typography>
      <Typography sx={{ mt: 2 }} variant="h6" fontWeight={600}>
        {galleryName}
      </Typography>
      <Typography sx={{ my: 3 }} variant="h5">
        € {price?.toFixed(2)}
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6" color="textSecondary">
          Riepilogo dati personali
        </Typography>
        <Link href="/profile/settings" color="textSecondary" onClick={() => {}}>
          Modifica dati personali
        </Link>
      </Box>
    </OrderCard>
  );
};

export default OrderLoanCard;
