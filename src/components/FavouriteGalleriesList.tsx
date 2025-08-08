import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { Box, Skeleton } from "@mui/material";
import { GalleryCardProps } from "./GalleryCard.tsx";
import { galleriesToGalleryItems } from "../utils.ts";
import ListHeader from "./ListHeader.tsx";
import GalleriesList from "./GalleriesList.tsx";

export interface FavouriteGalleriesProps {
  withHeader?: boolean;
}

function GalleryListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="min-w-80 max-w-80 flex flex-col space-y-4">
          <Skeleton variant="rectangular" className="w-full rounded-2xl bg-gray-300!" height={200} />
          <div className="flex ">
            <div className={'flex-col space-y-2 flex-1'}>
              <Skeleton variant="text" width="90%" height={24} className={"bg-gray-300!"} />
              <Skeleton variant="text" width="70%" height={16} className={"bg-gray-300!"} />
            </div>
            <Skeleton variant="circular" width={24} height={24} className={"bg-gray-300!"} />
          </div>
        </li>
      ))}
    </>
  );
}

const emptyText =
  "Non ci sono gallerie seguite, clicca sul pulsante \"follow\" a fianco di ogni galleria per salvare in questa sezione le gallerie che vuoi tenere d'occhio";
const FavouriteGalleriesList : React.FC<FavouriteGalleriesProps> = ({withHeader = false}) => {
  const data = useData();
  const snackbar = useSnackbars();

  const [favouriteGalleries, setFavouriteGalleries] = useState<GalleryCardProps[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      data.getFavouriteGalleries().then((ids) => {
        return data.getGalleries(ids).then((resp) => {
          console.log(resp);
          setFavouriteGalleries(galleriesToGalleryItems(resp));
        });
      })
    ])
      .then(() => {
      })
      .catch((e) => {
        console.error("error!", e);
        return snackbar.error(e, { autoHideDuration: 60000 });
      }).finally(() => {
      setReady(true);
    });
  }, [data]);

  return (
    <Box sx={{ width: "100%" }}>
      {withHeader && (
        <ListHeader
          boxSx={{ px: 0 }}
          title="Gallerie che segui"
          subtitle="In questa sezione troverai tutte le gallerie che stai seguendo"
        />
      )}
      {ready ? (
        <GalleriesList disablePadding items={favouriteGalleries} emptyText={emptyText} />
      ) : (
        <div className={"flex gap-8 my-12 overflow-x-hidden"}>
          <GalleryListSkeleton  />
        </div>
      )}
    </Box>
  );
};

export default FavouriteGalleriesList;
