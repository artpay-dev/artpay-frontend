import React, { useEffect, useState } from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import { CardItem, CardSize } from "../types";
import { useNavigate } from "../utils.ts";
import { Box, Button, Typography } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

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
  const snackbar = useSnackbars();

  const [favourites, setFavourites] = useState<number[]>([]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      data.getFavouriteArtworks().then((resp) => {
        console.log(resp)
        setFavourites(resp);
      });
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
          setFavourites(favourites.filter(id => id !== Number(artworkId)));
          await data.removeFavouriteArtwork(artworkId)
        } else {
          setFavourites((prevState) => [...prevState, Number(artworkId)]);
          await data.addFavouriteArtwork(artworkId)
        }
      } catch (e) {
        console.error(e);
        snackbar.error(e);
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
          gap={3}>
          {items.map((item, i) => (
            <ArtworkCard
              key={i}
              {...item}
              size={cardSize}
              fitWidth
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
            <Button onClick={handleLoadMore} variant="outlined" color="primary">
              Vai a tutte le opere
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ArtworksGrid;
