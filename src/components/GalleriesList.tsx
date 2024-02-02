import React, { useEffect, useState } from "react";
import GalleryCard, { GalleryCardProps } from "./GalleryCard.tsx";
import CardList from "./CardList.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";

export interface GalleriesListProps {
  items: GalleryCardProps[];
  title?: string;
  onSelect?: (index: number) => void;
}

const GalleriesList: React.FC<GalleriesListProps> = ({ items, title, onSelect }) => {
  const data = useData();

  const [favourites, setFavourites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleFavouritesUpdated = () => {
      data.getFavouriteGalleries().then((resp) => setFavourites(resp));
    };
    handleFavouritesUpdated();
    document.addEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    return () => {
      document.removeEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    };
  }, [data]);

  const handleSetFavourite = async (artistId: string, isFavourite: boolean) => {
    if (artistId) {
      setIsLoading(true);
      try {
        if (isFavourite) {
          await data.removeFavouriteGallery(artistId).then((resp) => {
            setFavourites(resp);
          });
        } else {
          await data.addFavouriteGallery(artistId).then((resp) => {
            setFavourites(resp);
          });
        }
      } catch (e) {
        //TODO: notify error
        console.log(e);
      }
      setIsLoading(false);
    }
  };

  return (
    <CardList title={title} cardSize="large">
      {items.map((item, i) => (
        <GalleryCard
          key={i}
          {...item}
          onClick={() => (onSelect ? onSelect(i) : null)}
          isLoading={isLoading}
          onSetFavourite={(currentValue) => handleSetFavourite(item.id.toString(), currentValue)}
          isFavourite={favourites.indexOf(+item.id) !== -1}
        />
      ))}
    </CardList>
  );
};

export default GalleriesList;
