import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { Box } from "@mui/material";
import { GalleryCardProps } from "./GalleryCard.tsx";
import { isAxiosError } from "axios";
import { galleriesToGalleryItems } from "../utils.ts";
import ListHeader from "./ListHeader.tsx";
import GalleriesGrid from "./GalleriesGrid.tsx";

export interface FavouriteGalleriesProps {}

const FavouriteGalleries: React.FC<FavouriteGalleriesProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();

  const [favouriteGalleries, setFavouriteGalleries] = useState<GalleryCardProps[]>([]);

  const showError = async (err?: unknown, text: string = "Si è verificato un errore") => {
    if (isAxiosError(err) && err.response?.data?.message) {
      text = err.response?.data?.message;
    }
    return snackbar.error(text, { autoHideDuration: 60000 });
  };

  useEffect(() => {
    Promise.all([
      data.getFavouriteGalleries().then((ids) => {
        return data.getGalleries(ids).then((resp) => {
          setFavouriteGalleries(galleriesToGalleryItems(resp));
        });
      }),
    ])
      .then(() => {})
      .catch((e) => {
        console.log("error!", e);
        return showError(e);
      });
  }, [data, showError]);

  // <Skeleton variant="rectangular" height={520} width={320} animation="pulse" />

  return (
    <Box sx={{ width: "100%" }}>
      <ListHeader
        title="Gallerie che segui"
        subtitle="In questa sezione troverai tutte le gallerie che stai seguendo"
      />
      <GalleriesGrid items={favouriteGalleries} />
    </Box>
  );
};

export default FavouriteGalleries;
