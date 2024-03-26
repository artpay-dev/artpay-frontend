import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { Box } from "@mui/material";
import { GalleryCardProps } from "./GalleryCard.tsx";
import { galleriesToGalleryItems } from "../utils.ts";
import ListHeader from "./ListHeader.tsx";
import GalleriesGrid from "./GalleriesGrid.tsx";
import Loader from "./Loader.tsx";

export interface FavouriteGalleriesProps {
}

const emptyText =
  "Non ci sono gallerie seguite, clicca sul pulsante \"follow\" a fianco di ogni galleria per salvare in questa sezione le gallerie che vuoi tenere d'occhio";
const FavouriteGalleries: React.FC<FavouriteGalleriesProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();

  const [favouriteGalleries, setFavouriteGalleries] = useState<GalleryCardProps[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      data.getFavouriteGalleries().then((ids) => {
        return data.getGalleries(ids).then((resp) => {
          setFavouriteGalleries(galleriesToGalleryItems(resp));
        });
      })
    ])
      .then(() => {
      })
      .catch((e) => {
        console.log("error!", e);
        return snackbar.error(e, { autoHideDuration: 60000 });
      }).finally(() => {
      setReady(true);
    });
  }, [data]);

  // <Skeleton variant="rectangular" height={520} width={320} animation="pulse" />

  return (
    <Box sx={{ width: "100%" }}>
      <ListHeader
        title="Gallerie che segui"
        subtitle="In questa sezione troverai tutte le gallerie che stai seguendo"
      />
      {ready ? (
        <GalleriesGrid items={favouriteGalleries} emptyText={emptyText} />
      ) : (
        <Loader sx={{ px: { xs: 0, md: 6 } }} />
      )}
    </Box>
  );
};

export default FavouriteGalleries;
