import React, { useEffect, useState } from "react";
import { CardSize } from "../types";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ArtistCard, { ArtistCardProps } from "./ArtistCard.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";

export interface ArtistsGridProps {
  items: ArtistCardProps[];
  title?: string;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  onLoadMore?: () => Promise<void>;
}

const ArtistsGrid: React.FC<ArtistsGridProps> = ({ title, items, onSelect, onLoadMore }) => {
  const navigate = useNavigate();
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
  const handleSelectArtwork = (index: number) => {
    const selectedArtwork = items[index];
    navigate(`/artwork/${selectedArtwork.id}`);
  };
  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };
  return (
    <Box sx={{ px: { xs: 0, md: 6 }, maxWidth: "100%" }}>
      {title && (
        <Typography sx={{ mb: { xs: 3, md: 6 } }} variant="h3">
          {title}
        </Typography>
      )}
      <Box
        gap={3}
        justifyContent="center"
        sx={{
          maxWidth: "100%",
          overflow: "auto",
          px: { xs: 1, sm: 4, md: 0 },
          /*          minHeight: "318px",
                                              flexDirection: { xs: "column", sm: "row" },
                                              { xs: "repeat(1, 1fr);", sm: "repeat(2, 1fr);", md: "repeat(3, 1fr);" }
                                              flexWrap: { xs: "wrap", md: "nowrap" }, ;
                                              justifyContent: { xs: "center", md: "flex-start" },*/
        }}>
        <Box
          display="grid"
          sx={{
            gridTemplateColumns: { xs: `repeat(auto-fill, minmax(320px, 1fr))` },
            justifyItems: "center",
            width: "auto",
          }}
          gap={1}>
          {items.map((item, i) => (
            <ArtistCard
              key={i}
              {...item}
              mode="grid"
              onClick={() => (onSelect ? onSelect(i) : handleSelectArtwork(i))}
              isLoading={isLoading}
              onSetFavourite={(currentValue) => handleSetFavourite(item.id, currentValue)}
              isFavourite={favourites.indexOf(+item.id) !== -1}
            />
          ))}
        </Box>
        <Box display="flex" mt={4} justifyContent="center">
          <Button onClick={handleLoadMore} variant="outlined" color="primary" size="large">
            Mostra più artisti
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ArtistsGrid;
