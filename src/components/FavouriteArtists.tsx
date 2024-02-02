import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, useTheme } from "@mui/material";
import { artistsToGalleryItems, galleriesToGalleryItems } from "../utils.ts";
import { ArtistCardProps } from "./ArtistCard.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { isAxiosError } from "axios";
import { GalleryCardProps } from "./GalleryCard.tsx";
import ListHeader from "./ListHeader.tsx";
import ArtistsList from "./ArtistsList.tsx";
import GalleriesList from "./GalleriesList.tsx";

export interface FavouriteArtistsProps {}

const FavouriteArtists: React.FC<FavouriteArtistsProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();
  const theme = useTheme();

  const [favouriteArtists, setFavouriteArtists] = useState<ArtistCardProps[]>([]);
  const [favouriteGalleries, setFavouriteGalleries] = useState<GalleryCardProps[]>([]);

  const showError = async (err?: unknown, text: string = "Si è verificato un errore") => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    return snackbar.error(text, { autoHideDuration: 60000 });
  };

  useEffect(() => {
    Promise.all([
      data.getFavouriteArtists().then((ids) => {
        return data.getArtists(ids).then((resp) => {
          setFavouriteArtists(artistsToGalleryItems(resp));
        });
      }),
      data.getFavouriteGalleries().then((ids) => {
        return data.getGalleries(ids).then((resp) => {
          setFavouriteGalleries(galleriesToGalleryItems(resp));
        });
      }),
    ])
      .then(() => {})
      .catch((e) => {
        console.log("error!", e);
        showError(e);
      });
  }, [data]);

  // <Skeleton variant="rectangular" height={520} width={320} animation="pulse" />

  return (
    <Box sx={{ width: "100%" }}>
      {favouriteArtists?.length ? (
        <ListHeader
          boxSx={{ maxWidth: theme.breakpoints.values.xl, width: "100%", marginLeft: "auto", marginRight: "auto" }}
          title="Artisti che segui"
          subtitle="In questa sezione troverai tutti gli artisti che stai tenendo d’occhio"
        />
      ) : (
        ""
      )}
      <ArtistsList items={favouriteArtists} />
      <ListHeader
        title="Gallerie che segui"
        subtitle="In questa sezione troverai tutte le gallerie che stai seguendo"
      />
      <GalleriesList items={favouriteGalleries} />
    </Box>
  );
};

export default FavouriteArtists;
