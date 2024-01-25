import React, { useEffect, useState } from "react";
import ArtistCard, { ArtistCardProps } from "./ArtistCard.tsx";
import CardList from "./CardList.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";

export interface ArtistsListProps {
  items: ArtistCardProps[];
  title?: string;
  onSelect?: (index: number) => void;
}

const ArtistsList: React.FC<ArtistsListProps> = ({ items, title, onSelect }) => {
  const data = useData();

  const [favourites, setFavourites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleFavouritesUpdated = () => {
      data.getFavouriteArtists().then((resp) => setFavourites(resp));
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
          await data.removeFavouriteArtist(artistId).then((resp) => {
            setFavourites(resp);
          });
        } else {
          await data.addFavouriteArtist(artistId).then((resp) => {
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
        <ArtistCard
          key={i}
          {...item}
          onClick={() => (onSelect ? onSelect(i) : null)}
          isLoading={isLoading}
          onSetFavourite={(currentValue) => handleSetFavourite(item.id, currentValue)}
          isFavourite={favourites.indexOf(+item.id) !== -1}
        />
      ))}
    </CardList>
  );
};

export default ArtistsList;
