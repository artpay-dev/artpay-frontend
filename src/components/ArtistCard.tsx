import React from "react";
import { Box, Card, CardContent, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Add, Check } from "@mui/icons-material";
import { useNavigate } from "../utils.ts";
import { CardSize } from "../types";

export interface ArtistCardProps {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description?: string;
  artworksCount?: number;
  isFavourite?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  onSetFavourite?: (currentValue: boolean) => void;
  imgUrl?: string;
  mode?: "grid" | "list";
  fitWidth?: boolean;
  size: CardSize;
}

const ArtistCard: React.FC<ArtistCardProps> = ({
                                                 slug,
                                                 title,
                                                 subtitle,
                                                 isFavourite = false,
                                                 isLoading = false,
                                                 imgUrl,
                                                 onClick,
                                                 onSetFavourite,
                                                 size = "large",
                                                 fitWidth = false
                                                 // artworksCount = 0,
                                               }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  //const imgHeight = size === "medium" ? "396px" : "430px";
  const cardWidth = fitWidth ? "100%" : (size === "medium" ? "294px" : "320px");
  const className = fitWidth ? `SwiperCard-fit` : `SwiperCard-${size}`;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSetFavourite = () => {
    if (onSetFavourite) {
      onSetFavourite(isFavourite);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/artisti/${slug}`);
    }
  };

  return (
    <Card elevation={0} className={`w-fit pl-4 lg:pl-0 h-full ${className}`} sx={{ width: cardWidth }}>
      <div className={'w-full rounded-sm overflow-hidden'}>
        <img
          src={imgUrl}
          onClick={handleClick}
          className={'object-cover h-full w-full aspect-square'}
        />
      </div>
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
              {isFavourite ? <Check fontSize="inherit" /> : <Add fontSize="inherit" />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
