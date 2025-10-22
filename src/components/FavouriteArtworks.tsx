import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { ArtworkCardProps } from "./ArtworkCard.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import ArtworksGrid from "./ArtworksGrid.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface FavouriteArtworksProps {
}

const Skeleton = () => {
  return (
    <div className={`pl-4 lg:pl-0 h-full min-w-80 `}>
      <div className="w-full rounded-2xl overflow-hidden">
        <div className="bg-gray-300 animate-pulse h-full w-full aspect-square" />
      </div>

      <div className="mt-4 py-4 flex flex-col justify-between">
        <div className="flex">
          <div className="flex flex-col flex-1 h-full min-h-40 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-1/4 mt-4 animate-pulse" />
          </div>
          <div className="flex flex-col items-end justify-between max-w-[50px] ml-4">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FavouriteArtworks: React.FC<FavouriteArtworksProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();

  const [ready, setReady] = useState(false);
  const [favouriteArtworks, setFavouriteArtworks] = useState<ArtworkCardProps[]>([]);

  useEffect(() => {
    data.getFavouriteArtworks().then((ids) => {
      return data.getArtworks(ids).then((resp) => {
        setFavouriteArtworks(artworksToGalleryItems(resp.filter(artwork => artwork.status != 'trash')));
        setReady(true);
      });
    }).catch((e) => snackbar.error(e));
  }, [data]);


  return (
    <div className={'mt-12'}>
      {ready ? (
        <ArtworksGrid disablePadding cardSize="medium" items={favouriteArtworks} />
      ) : (
        <div>
          <div className={"flex gap-8 my-12 overflow-x-hidden"}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i}  />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavouriteArtworks;
