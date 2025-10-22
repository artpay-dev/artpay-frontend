import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { Box, Skeleton } from "@mui/material";
import { GalleryCardProps } from "./GalleryCard.tsx";
import { galleriesToGalleryItems } from "../utils.ts";
import GalleriesList from "./GalleriesList.tsx";
import { NavLink } from "react-router-dom";


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
const FavouriteGalleriesList : React.FC = () => {
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

      {ready ? (
          <>
            <div className={"flex justify-between pe-8 md:pe-0 mb-12"}>
              <h3 className={"ps-8 md:px-0 text-3xl leading-[105%] font-normal max-w-lg text-balance"}>Shop seguiti</h3>
              <NavLink
                to={"/profile/seguiti"}
                className={
                  "cursor-pointer border border-primary py-2 px-4 text-primary rounded-full hover:bg-primary hover:text-white transition-all hidden md:block"
                }>
                Vedi tutte
              </NavLink>
            </div>
            <GalleriesList disablePadding items={favouriteGalleries} emptyText={emptyText} />
          </>
      ) : (
        <>
          <div className={"flex justify-between pe-8 md:pe-0"}>
            <div className="ps-8 md:ps-0 animate-pulse">
              <div className="h-9 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse hidden md:block">
              <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className={"flex gap-8 my-12 overflow-x-hidden mb-24"}>
            <ul className={'flex gap-8'}>
              <GalleryListSkeleton  />
            </ul>
          </div>
        </>
      )}
    </Box>
  );
};

export default FavouriteGalleriesList;
