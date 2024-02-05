import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, Skeleton, useTheme } from "@mui/material";
import { artistsToGalleryItems } from "../utils.ts";
import { ArtistCardProps } from "./ArtistCard.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { isAxiosError } from "axios";
import ListHeader from "./ListHeader.tsx";
import ArtistsGrid from "./ArtistsGrid.tsx";

export interface FavouriteArtistsProps {}

const FavouriteArtists: React.FC<FavouriteArtistsProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();
  const theme = useTheme();

  const [favouriteArtists, setFavouriteArtists] = useState<ArtistCardProps[]>([]);

  useEffect(() => {
    const showError = async (err?: unknown, text: string = "Si è verificato un errore") => {
      if (isAxiosError(err) && err.response?.data?.message) {
        text = err.response?.data?.message;
      }
      return snackbar.error(text, { autoHideDuration: 60000 });
    };

    Promise.all([
      data.getFavouriteArtists().then((ids) => {
        return data.getArtists(ids).then((resp) => {
          setFavouriteArtists(artistsToGalleryItems(resp));
        });
      }),
    ])
      .then(() => {})
      .catch((e) => {
        console.log("error!", e);
        showError(e);
      });
  }, [data, snackbar]);

  // <Skeleton variant="rectangular" height={520} width={320} animation="pulse" />

  return (
    <Box sx={{ width: "100%" }}>
      <ListHeader
        boxSx={{ maxWidth: theme.breakpoints.values.xl, width: "100%", marginLeft: "auto", marginRight: "auto" }}
        title="Artisti che segui"
        subtitle="In questa sezione troverai tutti gli artisti che stai tenendo d’occhio"
      />
      {favouriteArtists?.length ? (
        <ArtistsGrid items={favouriteArtists} />
      ) : (
        <Skeleton
          sx={{ borderRadius: "5px", mx: { xs: 0, md: 6 } }}
          variant="rectangular"
          height={430}
          width={320}
          animation="pulse"
        />
      )}
    </Box>
  );
};

export default FavouriteArtists;
