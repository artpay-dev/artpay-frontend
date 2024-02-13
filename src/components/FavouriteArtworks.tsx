import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { ArtworkCardProps } from "./ArtworkCard.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import ArtworksGrid from "./ArtworksGrid.tsx";
import Loader from "./Loader.tsx";

export interface FavouriteArtworksProps {}

const FavouriteArtworks: React.FC<FavouriteArtworksProps> = ({}) => {
  const theme = useTheme();
  const data = useData();

  const [ready, setReady] = useState(false);
  const [favouriteArtworks, setFavouriteArtworks] = useState<ArtworkCardProps[]>([]);

  useEffect(() => {
    data.getFavouriteArtworks().then((ids) => {
      data.getArtworks(ids).then((resp) => {
        setFavouriteArtworks(artworksToGalleryItems(resp));
        setReady(true);
      });
    });
  }, [data]);

  return (
    <Box sx={{ px: { xs: 0, sm: 3, md: 6 }, width: "100%" }}>
      <Box sx={{ maxWidth: theme.breakpoints.values["xl"] }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Le tue opere preferite
        </Typography>
        <Typography variant="body1" sx={{ mb: 6 }}>
          In questa sezione troverai tutte le tue opere salvate
        </Typography>
      </Box>
      {ready ? <ArtworksGrid disablePadding cardSize="large" items={favouriteArtworks} /> : <Loader />}
    </Box>
  );
};

export default FavouriteArtworks;
