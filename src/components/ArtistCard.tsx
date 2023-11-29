import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add, Check } from "@mui/icons-material";

export interface ArtistCardProps {
  title: string;
  subtitle: string;
  isFavourite?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  title,
  subtitle,
  isFavourite = false,
}) => {
  const theme = useTheme();
  const imgHeight = "430px";
  const cardWidth = "320px";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card elevation={0} sx={{ width: cardWidth, minWidth: cardWidth }}>
      <CardMedia
        component="img"
        image="/gallery_example.jpg"
        height={imgHeight}
        sx={{ backgroundColor: "#D9D9D9" }}></CardMedia>
      <CardContent sx={{ p: 0, mt: 2 }}>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Typography variant={isMobile ? "subtitle1" : "h6"}>
              {title}
            </Typography>
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
