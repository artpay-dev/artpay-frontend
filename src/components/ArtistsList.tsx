import React, { useEffect, useState } from "react";
import ArtistCard, { ArtistCardProps } from "./ArtistCard.tsx";
import CardList from "./CardList.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useNavigate } from "../utils.ts";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { CardSize } from "../types";
import { Artist } from "../types/artist.ts";

export interface ArtistsListProps {
  items: ArtistCardProps[];
  maxItems?: number;
  size?: CardSize;
  title?: string;
  onSelect?: (index: number) => void;
  disablePadding?: boolean;
}

const ArtistsList: React.FC<ArtistsListProps> = ({
                                                   items,
                                                   title,
                                                   onSelect,
                                                   disablePadding,
                                                   size = "large",
                                                   maxItems
                                                 }) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();

  const [favourites, setFavourites] = useState<Artist[]>([]);
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
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
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
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const handleClick = (i: number) => {
    if (onSelect) {
      onSelect(i);
    } else {
      navigate(`/artisti/${items[i].slug}`);
    }
  };

  return (
    <CardList title={title} disablePadding={disablePadding} cardSize={size}>
      {items.filter( artist => artist.imgUrl != "")
        .filter((_, i) => !maxItems || i < maxItems)
        .map((item, i) => (
          <ArtistCard
            key={i}
            {...item}
            size={size}
            onClick={() => handleClick(i)}
            isLoading={isLoading}
            onSetFavourite={(currentValue) => handleSetFavourite(item.id, currentValue)}
            isFavourite={favourites.some(artist => `${artist.id}` === item.id)}
          />
        ))}
    </CardList>
  );
};

export default ArtistsList;
