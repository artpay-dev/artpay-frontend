import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { Box } from "@mui/material";
import { artistsToGalleryItems } from "../utils.ts";
import { ArtistCardProps } from "./ArtistCard.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import ListHeader from "./ListHeader.tsx";
import ArtistsGrid from "./ArtistsGrid.tsx";
import Loader from "./Loader.tsx";

export interface FavouriteArtistsProps {
}

const emptyText =
  "Non ci sono artisti seguiti, clicca sul pulsante \"+\" a fianco di ogni artista per salvare in questa sezione gli artisti che vuoi tenere d'occhio";
const FavouriteArtists: React.FC<FavouriteArtistsProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();

  const [favouriteArtists, setFavouriteArtists] = useState<ArtistCardProps[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {

    Promise.all([
      data.getFavouriteArtists().then((ids) => {
        return data.getArtists(ids).then((resp) => {
          setFavouriteArtists(artistsToGalleryItems(resp));
        });
      })
    ])
      .then(() => {
        setReady(true);
      })
      .catch((e) => {
        console.error(e);
        snackbar.error(e, { autoHideDuration: 60000 });
      });
  }, [data]);

  // <Skeleton variant="rectangular" height={520} width={320} animation="pulse" />

  return (
    <Box sx={{ width: "100%" }}>
      <ListHeader
        boxSx={{ width: "100%", marginLeft: "auto", marginRight: "auto" }}
        title="Artisti che segui"
        subtitle="In questa sezione troverai tutti gli artisti che stai tenendo d’occhio"
      />
      {ready ? (
        <ArtistsGrid items={favouriteArtists} emptyText={emptyText} />
      ) : (
        <Loader sx={{ mx: { xs: 0, md: 6 } }} />
      )}
    </Box>
  );
};

export default FavouriteArtists;
