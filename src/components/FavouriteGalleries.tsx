import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { Box } from "@mui/material";
import { GalleryCardProps } from "./GalleryCard.tsx";
import { galleriesToGalleryItems } from "../utils.ts";
import ListHeader from "./ListHeader.tsx";
import GalleriesGrid from "./GalleriesGrid.tsx";
import Loader from "./Loader.tsx";

export interface FavouriteGalleriesProps {}

const FavouriteGalleries: React.FC<FavouriteGalleriesProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();

  const [favouriteGalleries, setFavouriteGalleries] = useState<GalleryCardProps[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      data.getFavouriteGalleries().then((ids) => {
        console.log("getFavouriteGalleries", ids);
        return data.getGalleries(ids).then((resp) => {
          setFavouriteGalleries(galleriesToGalleryItems(resp));
          setReady(true);
        });
      }),
    ])
      .then(() => {})
      .catch((e) => {
        console.log("error!", e);
        return snackbar.error(e, { autoHideDuration: 60000 });
      });
  }, [data, snackbar]);

  // <Skeleton variant="rectangular" height={520} width={320} animation="pulse" />

  return (
    <Box sx={{ width: "100%" }}>
      <ListHeader
        title="Gallerie che segui"
        subtitle="In questa sezione troverai tutte le gallerie che stai seguendo"
      />
      {ready ? <GalleriesGrid items={favouriteGalleries} /> : <Loader sx={{ px: { xs: 0, md: 6 } }} />}
    </Box>
  );
};

export default FavouriteGalleries;
