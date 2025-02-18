import React, { useEffect, useState } from "react";
import { CardSize } from "../types";
import { useNavigate } from "../utils.ts";
import { Box, Button, Typography } from "@mui/material";
import ArtistCard, { ArtistCardProps } from "./ArtistCard.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Artist } from "../types/artist.ts";

export interface ArtistsGridProps {
  items: ArtistCardProps[];
  title?: string;
  subtitle?: string;
  emptyText?: string;
  disablePadding?: boolean;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  onLoadMore?: () => Promise<void>;
}

const ArtistsGrid: React.FC<ArtistsGridProps> = ({
                                                   title,
                                                   subtitle,
                                                   emptyText,
                                                   disablePadding,
                                                   items,
                                                   onSelect,
                                                   onLoadMore
                                                 }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const data = useData();

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
  const handleSelectArtwork = (index: number) => {
    const selectedArtwork = items[index];
    navigate(`/artisti/${selectedArtwork.slug}`);
  };
  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };
  return (
    <Box sx={{ px: disablePadding ? 0 : { xs: 0, md: 6 }, maxWidth: "100%" }}>
      {title && (
        <Typography sx={{ mb: subtitle ? 2 : { xs: 3, md: 6 }, px: 0 }} variant="h3">
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body1" sx={{ mb: { xs: 3, md: 6 } }}>
          {subtitle}
        </Typography>
      )}
      <Box
        gap={3}
        justifyContent="center"
        sx={{
          maxWidth: "100%",
          overflow: "auto",
          px: 0
          /*          minHeight: "318px",
                                              flexDirection: { xs: "column", sm: "row" },
                                              { xs: "repeat(1, 1fr);", sm: "repeat(2, 1fr);", md: "repeat(3, 1fr);" }
                                              flexWrap: { xs: "wrap", md: "nowrap" }, ;
                                              justifyContent: { xs: "center", md: "flex-start" },*/
        }}>
        <Box
          display="grid"
          sx={{
            gridTemplateColumns: {
              xs: `repeat(auto-fill, minmax(100%, 1fr))`,
              sm: `repeat(auto-fill, minmax(calc(50% - 24px), 1fr))`,
              md: `repeat(auto-fill, minmax(280px, 1fr))`
            },
            justifyItems: "center",
            width: "auto"
          }}
          gap={{ xs: 1, sm: 3 }}>
          {items.map((item, i) => (
            <ArtistCard
              key={i}
              {...item}
              mode="grid"
              size="medium"
              fitWidth
              onClick={() => (onSelect ? onSelect(i) : handleSelectArtwork(i))}
              isLoading={isLoading}
              onSetFavourite={(currentValue) => handleSetFavourite(item.id, currentValue)}
              isFavourite={favourites.some(artist => (artist.id).toString() === item.id)}
            />
          ))}
        </Box>
        {emptyText && !items.length && (
          <Box>
            <Typography color="textSecondary" variant="subtitle1">{emptyText}</Typography>
          </Box>
        )}
        {onLoadMore && (
          <Box display="flex" mt={4} justifyContent="center">
            <Button onClick={handleLoadMore} variant="outlined" color="primary" size="large">
              Mostra più artisti
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ArtistsGrid;
