import React from "react";
import { Box, Card, CardContent, CardMedia, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Add, Check } from "@mui/icons-material";

export interface GalleryCardProps {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  isFavourite?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  onSetFavourite?: (currentValue: boolean) => void;
  imgUrl?: string;
  logoUrl?: string;
  mode?: "grid" | "list";
  fitWidth?: boolean;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
                                                   title,
                                                   subtitle,
                                                   isFavourite = false,
                                                   isLoading = false,
                                                   imgUrl,
                                                   mode = "list",
                                                   onClick,
                                                   onSetFavourite,
                                                   fitWidth = false
                                                   // artworksCount = 0,
                                                 }) => {
  const theme = useTheme();
  const imgHeight = fitWidth ? "auto" : "230px";
  const cardWidth = fitWidth ? "100%" : "294px";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSetFavourite = () => {
    if (onSetFavourite) {
      onSetFavourite(isFavourite);
    }
  };

  return (
    <Card elevation={0} className={fitWidth ? "SwiperCard-fit" : "SwiperCard-medium"} sx={{ minWidth: cardWidth }}>
      <CardMedia
        component="img"
        image={imgUrl}
        height={isMobile && mode === "grid" ? "auto" : imgHeight}
        className="rounded-2xl"
        onClick={onClick}
        sx={{
          objectFit: "cover",
          minHeight: "100px",
          maxHeight: "214px",
          borderRadius: "16px",
          backgroundColor: imgUrl ? "" : "#D9D9D9",
          cursor: onClick ? "pointer" : "auto",
          aspectRatio: fitWidth ? 1.28 : undefined
        }}></CardMedia>
      <CardContent sx={{ p: 0, mt: 2 }}>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Typography onClick={onClick} sx={{ cursor: "pointer" }} variant={isMobile ? "subtitle1" : "h6"}>
              {title}
            </Typography>
            <Typography onClick={onClick} sx={{ cursor: "pointer" }} variant="subtitle1" color="textSecondary">
              {subtitle}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            <IconButton
              color="primary"
              disabled={isLoading}
              onClick={() => handleSetFavourite()}
              variant={isFavourite ? "contained" : "outlined"}
              size="small">
              {isFavourite ? <Check /> : <Add />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GalleryCard;
