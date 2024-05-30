import React, { useEffect, useState } from "react";
import GalleryCard, { GalleryCardProps } from "./GalleryCard.tsx";
import CardList, { CardListProps } from "./CardList.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useNavigate } from "../utils.ts";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface GalleriesListProps {
  items: GalleryCardProps[];
  title?: string;
  onSelect?: (index: number) => void;
  cardSize?: "small" | "medium" | "large";
}

const GalleriesList: React.FC<GalleriesListProps & Omit<CardListProps, "children">> = ({
                                                                                         items,
                                                                                         title,
                                                                                         onSelect,
                                                                                         cardSize = "large",
                                                                                         ...props
                                                                                       }) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();

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
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
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
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    if (onSelect) {
      onSelect(index);
    } else {
      const item = items[index];
      navigate(`/gallerie/${item.slug}`);
    }
    //
  };

  return (
    <CardList title={title} cardSize={cardSize} {...props}>
      {items.map((item, i) => (
        <GalleryCard
          key={i}
          {...item}
          onClick={() => handleSelect(i)}
          isLoading={isLoading}
          onSetFavourite={(currentValue) => handleSetFavourite(item.id.toString(), currentValue)}
          isFavourite={favourites.indexOf(+item.id) !== -1}
        />
      ))}
    </CardList>
  );
};

export default GalleriesList;
