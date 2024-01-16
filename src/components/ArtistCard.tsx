import React from "react";
import { Box, Card, CardContent, CardMedia, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Add, Check } from "@mui/icons-material";

export interface ArtistCardProps {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  artworksCount?: number;
  isFavourite?: boolean;
  onClick?: () => void;
  imgUrl?: string;
  mode?: "grid" | "list";
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  title,
  subtitle,
  isFavourite = false,
  imgUrl,
  mode = "list",
  onClick,
  // artworksCount = 0,
}) => {
  const theme = useTheme();
  const imgHeight = "430px";
  const cardWidth = "320px";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card elevation={0} className="SwiperCard-large" sx={{ minWidth: cardWidth }}>
      <CardMedia
        component="img"
        image={imgUrl}
        height={isMobile && mode === "grid" ? "auto" : imgHeight}
        className="borderRadius"
        onClick={onClick}
        sx={{
          objectFit: mode === "list" ? "conver" : "contain",
          minHeight: "100px",
          backgroundColor: imgUrl ? "" : "#D9D9D9",
          cursor: onClick ? "pointer" : "auto",
        }}></CardMedia>
      <CardContent sx={{ p: 0, mt: 2 }}>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Typography variant={isMobile ? "subtitle1" : "h6"}>{title}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {subtitle}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            {isFavourite ? (
              <IconButton color="primary" variant="outlined" size="small">
                <Add />
              </IconButton>
            ) : (
              <IconButton color="primary" variant="contained" size="small">
                <Check />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
