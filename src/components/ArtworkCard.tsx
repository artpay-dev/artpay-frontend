import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import FavouriteIcon from "./icons/FavouriteIcon.tsx";
import QrCodeIcon from "./icons/QrCodeIcon.tsx";

export type ArtworkCardSize = "small" | "medium" | "large";
export interface ArtworkCardProps {
  artistName: string;
  title: string;
  galleryName: string;
  price?: number;
  size?: ArtworkCardSize;
}

const cardSizes: { [key in ArtworkCardSize]: string } = {
  small: "180px",
  medium: "230px",
  large: "320px",
};

const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artistName,
  title,
  galleryName,
  price,
  size = "medium",
}) => {
  const cardSize = cardSizes[size];
  const formattedPrice = price
    ? `€ ${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`
    : "";
  const titleVariant = size === "large" ? "h6" : "subtitle1";
  const priceVariant = size === "large" ? "subtitle1" : "subtitle2";
  const textMaxWidth = size === "large" ? "190px" : "152px";
  const imgMargin = size === "small" ? 1 : 2;
  return (
    <Card elevation={0} sx={{ width: cardSize, minWidth: cardSize }}>
      <CardMedia
        component="img"
        image="/gallery_example.jpg"
        height={cardSize}
        sx={{ backgroundColor: "#D9D9D9" }}></CardMedia>
      <CardContent sx={{ p: 0, mt: imgMargin }}>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Typography variant="body2" color="textSecondary">
              {artistName}
            </Typography>
            <Typography
              variant={titleVariant}
              sx={{ mt: 0.5, mb: 1, maxWidth: textMaxWidth }}>
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {galleryName}
            </Typography>
            {price && (
              <Typography variant={priceVariant} sx={{ mt: 2 }}>
                {formattedPrice}
              </Typography>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="end"
            justifyContent="space-between"
            sx={{ maxWidth: "20px" }}>
            <IconButton size="small" sx={{ mt: -0.5 }}>
              <FavouriteIcon fontSize="small" />
            </IconButton>
            <IconButton sx={{ mb: -1 }} size="medium">
              <QrCodeIcon color="primary" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;
