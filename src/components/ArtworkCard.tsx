import React from "react";
import { Box, Card, CardContent, CardMedia, IconButton, Typography } from "@mui/material";
import FavouriteIcon from "./icons/FavouriteIcon.tsx";
import { CardSize } from "../types";
import FavouriteFilledIcon from "./icons/FavouriteFilledIcon.tsx";
import QrCodeIcon from "./icons/QrCodeIcon.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";

export interface ArtworkCardProps {
  id: string;
  artistName: string;
  title: string;
  slug: string;
  galleryName: string;
  galleryId: string;
  isFavourite?: boolean;
  price?: number;
  size?: CardSize;
  dimensions?: string;
  technique?: string;
  year?: string;
  imgUrl?: string;
  estimatedShippingCost?: string;
  onClick?: () => void;
  onSetFavourite?: (currentValue: boolean) => void;
  mode?: "grid" | "list";
  fitWidth?: boolean;
}

const cardSizes: { [key in CardSize]: string } = {
  small: "180px",
  medium: "294px",
  large: "320px",
};

const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artistName,
  title,
  galleryName,
  price,
  size = "medium",
  imgUrl,
  isFavourite = false,
  onClick,
  onSetFavourite,
  mode = "list",
  slug,
  fitWidth = false,
}) => {
  const dialogs = useDialogs();

  const cardSize = fitWidth ? "100%" : cardSizes[size];
  const cardSizeClass = fitWidth ? `SwiperCard-fit` : `SwiperCard-${size}`;

  const formattedPrice = price
    ? `€ ${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`
    : "";

  const textMaxWidth = size === "large" ? "190px" : "254px";
  const imgMargin = size === "small" ? 1 : 2;

  const handleSetFavourite = () => {
    if (onSetFavourite) {
      onSetFavourite(isFavourite);
    }
  };

  const handleShowQrCode = () => {
    const qrUrl = `${window.location.protocol}//${window.location.host}/opere/${slug}`;
    dialogs.qrCode(qrUrl);
  };

  const cardStyles =
    mode === "list"
      ? {
          height: "100%",
        }
      : {
          height: "auto",
          display: "flex",
          flexDirection: "column",
        };
  return (
    <Card
      elevation={0}
      className={cardSizeClass}
      sx={{
        ...cardStyles,
      }}>
      <CardMedia
        component="img"
        image={imgUrl}
        height={fitWidth ? "auto" : cardSize}
        onClick={onClick}
        className="borderRadius"
        sx={{
          objectFit: "cover",
          // height: cardSize,
          minWidth: mode === "list" ? undefined : "100%",
          width: mode === "list" ? undefined : "auto",
          //backgroundColor: "#D9D9D9",
          cursor: onClick ? "pointer" : "auto",
          aspectRatio: fitWidth ? 1 : undefined,
        }}></CardMedia>
      <CardContent sx={{ p: 0, mt: imgMargin, height: "100%" }}>
        <Box display="flex" sx={{ height: mode === "grid" ? "100%" : undefined }}>
          <Box display="flex" onClick={onClick} sx={{ cursor: "pointer" }} flexDirection="column" flexGrow={1}>
            <Typography variant="body1" color="textSecondary">
              {artistName || "-"}
            </Typography>
            <Typography
              onClick={onClick}
              variant="h4"
              sx={{
                mt: 0.5,
                mb: 1,
                flexGrow: 1,
                maxWidth: textMaxWidth,
                minHeight: mode === "grid" ? "0" : "50px",
                cursor: "pointer",
              }}>
              {title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {galleryName || "-"}
            </Typography>
            {price && (
              <Typography variant="h4" sx={{ mt: 2 }}>
                {formattedPrice}
              </Typography>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="end"
            justifyContent="space-between"
            sx={{ maxWidth: "50px" }}>
            <IconButton onClick={() => handleSetFavourite()} size="small" sx={{ mt: -0.5 }}>
              {isFavourite ? (
                <FavouriteFilledIcon color="primary" fontSize="small" />
              ) : (
                <FavouriteIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton onClick={handleShowQrCode} sx={{ mb: -1 }} size="medium">
              <QrCodeIcon color="primary" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;
