import React, { useEffect, useState } from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import CardList from "./CardList.tsx";
import { CardSize } from "../types";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface ArtworksListProps {
  items: ArtworkCardProps[];
  title?: string;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  showEmpty?: boolean;
  disablePadding?: boolean;
  maxItems?: number;
}

const ArtworksList: React.FC<ArtworksListProps> = ({
                                                     title,
                                                     items,
                                                     cardSize,
                                                     onSelect,
                                                     showEmpty,
                                                     disablePadding,
                                                     maxItems
                                                   }) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();

  const [favourites, setFavourites] = useState<number[]>([]);

  useEffect(() => {
    const handleFavouritesUpdated = () => {
      data.getFavouriteArtworks().then((resp) => setFavourites(resp));
    };
    handleFavouritesUpdated();
    document.addEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    return () => {
      document.removeEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    };
  }, [data]);

  const handleSelect = (item: ArtworkCardProps) => {
    navigate(`/opere/${item.slug}`);
  };

  const handleSetFavourite = async (artworkId: string, isFavourite: boolean) => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (artworkId) {
      try {
        if (isFavourite) {
          await data.removeFavouriteArtwork(artworkId).then((resp) => {
            setFavourites(resp);
          });
        } else {
          await data.addFavouriteArtwork(artworkId).then((resp) => {
            setFavourites(resp);
          });
        }
      } catch (e) {
        //TODO: notify error
        console.error(e);
      }
    }
  };

  return (
    <CardList title={title} cardSize={cardSize} showEmpty={showEmpty} disablePadding={disablePadding}
              maxItems={maxItems}>
      {items.map((item, i) => (
        <ArtworkCard
          key={i}
          {...item}
          size={cardSize}
          onClick={() => (onSelect ? onSelect(i) : handleSelect(items[i]))}
          onSetFavourite={(currentValue) => handleSetFavourite(item.id, currentValue)}
          isFavourite={favourites.indexOf(+item.id) !== -1}
        />
      ))}
    </CardList>
  );
};

export default ArtworksList;
