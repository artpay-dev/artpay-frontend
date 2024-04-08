import React from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import OrderCard from "./OrderCard.tsx";
import { UserProfile } from "../types/user.ts";

export interface OrderLoanCardProps {
  id: string;
  artistName: string;
  title: string;
  slug: string;
  galleryName: string;
  galleryId: string;
  artworkSize: string;
  artworkTechnique?: string;
  reservedUntil?: string;
  isFavourite?: boolean;
  price?: number;
  imgUrl?: string;
  profile?: UserProfile;
  onClick?: () => void;
  showCta?: boolean;
}

const OrderLoanCard: React.FC<OrderLoanCardProps> = ({
                                                       title,
                                                       artistName,
                                                       galleryName,
                                                       price,
                                                       imgUrl,
                                                       profile,
                                                       onClick,
                                                       showCta,
                                                       artworkSize,
                                                       artworkTechnique
                                                     }) => {
  const cta = (
    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
      <Button sx={{ mb: 2 }} onClick={onClick} variant="outlined">
        Blocca l'opera
      </Button>
      <Typography variant="body1" color="textSecondary">
        Non sai come funziona?
      </Typography>
      <Link href="" color="textSecondary" onClick={() => {
      }}>
        Scopri di più!
      </Link>
    </Box>
  );
  return (
    <OrderCard imgSrc={imgUrl} leftCta={showCta ? cta : undefined}>
      <Typography sx={{ mb: 1 }} variant="h4">
        {title}
      </Typography>
      <Typography sx={{ mb: 2 }} variant="h5" color="textSecondary">
        {artistName}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        {artworkTechnique}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        {artworkSize}
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
        <Typography variant="body1">
          {profile?.first_name} {profile?.last_name}
        </Typography>
        <Typography variant="body1">{profile?.email}</Typography>
        {profile?.billing?.phone && <Typography variant="body1">{profile?.billing?.phone}</Typography>}
        <Typography variant="body1">
          {profile?.shipping?.address_1}, {profile?.shipping?.city}
        </Typography>
        <Link href="/profile/settings" sx={{ mt: 1 }} color="textSecondary" onClick={() => {
        }}>
          Modifica dati personali
        </Link>
      </Box>
    </OrderCard>
  );
};

export default OrderLoanCard;
