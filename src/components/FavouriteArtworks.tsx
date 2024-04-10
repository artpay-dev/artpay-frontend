import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { ArtworkCardProps } from "./ArtworkCard.tsx";
import { artworksToGalleryItems, getDefaultPaddingX } from "../utils.ts";
import ArtworksGrid from "./ArtworksGrid.tsx";
import Loader from "./Loader.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface FavouriteArtworksProps {
}

const emptyText =
  "Non ci sono opere preferite, clicca sul cuoricino a fianco di ogni opera per salvare in questa sezione le opere che vuoi tenere d'occhio";

const FavouriteArtworks: React.FC<FavouriteArtworksProps> = ({}) => {
  const theme = useTheme();
  const data = useData();
  const snackbar = useSnackbars();

  const [ready, setReady] = useState(false);
  const [favouriteArtworks, setFavouriteArtworks] = useState<ArtworkCardProps[]>([]);

  useEffect(() => {
    data.getFavouriteArtworks().then((ids) => {
      return data.getArtworks(ids).then((resp) => {
        setFavouriteArtworks(artworksToGalleryItems(resp));
        setReady(true);
      });
    }).catch((e) => snackbar.error(e));
  }, [data]);

  const px = getDefaultPaddingX();

  return (
    <Box sx={{ px: px, width: "100%" }}>
      <Box sx={{ maxWidth: theme.breakpoints.values["xl"] }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Le tue opere preferite
        </Typography>
        <Typography variant="body1" sx={{ mb: 6 }}>
          In questa sezione troverai tutte le tue opere salvate
        </Typography>
      </Box>
      {ready ? (
        <ArtworksGrid disablePadding cardSize="medium" items={favouriteArtworks} emptyText={emptyText} />
      ) : (
        <Loader />
      )}
    </Box>
  );
};

export default FavouriteArtworks;
