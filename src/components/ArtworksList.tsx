import React, { useEffect, useState } from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import CardList from "./CardList.tsx";
import { CardSize } from "../types";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useNavigate } from "react-router-dom";

export interface ArtworksListProps {
  items: ArtworkCardProps[];
  title?: string;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  showEmpty?: boolean;
}

const ArtworksList: React.FC<ArtworksListProps> = ({ title, items, cardSize, onSelect, showEmpty }) => {
  const data = useData();
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
    data.getGallery(item.galleryId).then((gallery) => {
      navigate(`/gallerie/${gallery.shop?.slug}/opere/${item.slug}`);
    });
  };

  const handleSetFavourite = async (artworkId: string, isFavourite: boolean) => {
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
        console.log(e);
      }
    }
  };

  return (
    <CardList title={title} cardSize={cardSize} showEmpty={showEmpty}>
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
