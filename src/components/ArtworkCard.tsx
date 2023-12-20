import React from "react";
import { Box, Card, CardContent, CardMedia, IconButton, Typography } from "@mui/material";
import FavouriteIcon from "./icons/FavouriteIcon.tsx";
import QrCodeIcon from "./icons/QrCodeIcon.tsx";
import { CardSize } from "../types";

export interface ArtworkCardProps {
  id: string;
  artistName: string;
  title: string;
  slug: string;
  galleryName: string;
  price?: number;
  size?: CardSize;
  imgUrl?: string;
  onClick?: () => void;
  mode?: "grid" | "list";
}

const cardSizes: { [key in CardSize]: string } = {
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
  imgUrl,
  onClick,
  mode = "list",
}) => {
  const cardSize = cardSizes[size];
  const cardSizeClass = `SwiperCard-${size}`;
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
    <Card elevation={0} className={cardSizeClass} sx={{ height: mode === "list" ? "100%" : "auto" }}>
      <CardMedia
        component="img"
        image={imgUrl}
        height={cardSize}
        onClick={onClick}
        className="borderRadius"
        sx={{
          objectFit: "contain",
          //backgroundColor: "#D9D9D9",
          cursor: onClick ? "pointer" : "auto",
        }}></CardMedia>
      <CardContent sx={{ p: 0, mt: imgMargin, height: "100%" }}>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Typography variant="body2" color="textSecondary">
              {artistName || "-"}
            </Typography>
            <Typography
              variant={titleVariant}
              sx={{
                mt: 0.5,
                mb: 1,
                maxWidth: textMaxWidth,
                minHeight: "50px",
              }}>
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {galleryName || "-"}
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
