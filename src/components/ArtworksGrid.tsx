import React, { useEffect, useState } from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import { CardItem, CardSize } from "../types";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface ArtworksGridProps {
  items: ArtworkCardProps[];
  title?: string;
  emptyText?: string;
  cardSize?: CardSize;
  onSelect?: (item: CardItem) => void;
  onLoadMore?: () => Promise<void>;
  disablePadding?: boolean;
}

const ArtworksGrid: React.FC<ArtworksGridProps> = ({
                                                     title,
                                                     items,
                                                     emptyText,
                                                     cardSize,
                                                     onSelect,
                                                     onLoadMore,
                                                     disablePadding = false
                                                   }) => {
  const navigate = useNavigate();
  const data = useData();
  const auth = useAuth();

  const [favourites, setFavourites] = useState<number[]>([]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      data.getFavouriteArtworks().then((resp) => setFavourites(resp));
    } else {
      setFavourites([]);
    }
  }, [data, auth.isAuthenticated]);
  const handleSelect = (item: ArtworkCardProps) => {
    navigate(`/opere/${item.slug}`);
  };
  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    }
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
    <Box sx={{ px: disablePadding ? 0 : { xs: 0, md: 6 }, maxWidth: "100%" }}>
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
          px: { xs: 1, sm: 4, md: 0 }
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
            width: "auto"
          }}
          gap={1}>
          {items.map((item, i) => (
            <ArtworkCard
              key={i}
              {...item}
              size={cardSize}
              mode="grid"
              onClick={() => (onSelect ? onSelect({ ...item }) : handleSelect({ ...item }))}
              onSetFavourite={(currentValue) => handleSetFavourite(item.id, currentValue)}
              isFavourite={favourites.indexOf(+item.id) !== -1}
            />
          ))}
        </Box>
        {emptyText && !items.length && (
          <Box>
            <Typography variant="subtitle1">{emptyText}</Typography>
          </Box>
        )}
        {onLoadMore && (
          <Box display="flex" mt={4} justifyContent="center">
            <Button onClick={handleLoadMore} variant="outlined" color="primary" size="large">
              Mostra più opere
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ArtworksGrid;
