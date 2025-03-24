import React, { useEffect, useState } from "react";
import { CardSize } from "../types";
import { useNavigate } from "../utils.ts";
import { Box, Typography } from "@mui/material";
import GalleryCard, { GalleryCardProps } from "./GalleryCard.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface GaleriesGridProps {
  items: GalleryCardProps[];
  title?: string;
  subtitle?: string;
  disablePadding?: boolean;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  emptyText?: string;
  onLoadMore?: () => Promise<void>;
}

const GaleriesGrid: React.FC<GaleriesGridProps> = ({
                                                     title,
                                                     subtitle,
                                                     disablePadding = false,
                                                     emptyText,
                                                     items,
                                                     onSelect
                                                   }) => {
  const navigate = useNavigate();
  const data = useData();
  const auth = useAuth();
  const snackbars = useSnackbars()

  const [favourites, setFavourites] = useState<number[]>([]);

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

  const handleSetFavourite = async (galleryId: string, isFavourite: boolean) => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (galleryId) {
      try {
        if (isFavourite) {
          setFavourites(favourites.filter(id => id !== Number(galleryId)));
          await data.removeFavouriteGallery(galleryId).then((resp) => {
            setFavourites(resp);
          });
        } else {
          setFavourites([...favourites, Number(galleryId)]);
          await data.addFavouriteGallery(galleryId).then((resp) => {
            setFavourites(resp);
          });
        }
      } catch (e) {
        //TODO: notify error
        console.error(e);
        snackbars.error(e)
      }
    }
  };
  const handleSelectGallery = (index: number) => {
    const selectedGallery = items[index];
    navigate(`/gallerie/${selectedGallery.slug}`);
  };

  return (
    <Box sx={{ px: disablePadding ? 0 : { xs: 0, md: 6 }, maxWidth: "100%" }}>
      {title && (
        <Typography sx={{ mb: subtitle ? 2 : { xs: 3, md: 6 } }} variant="h3">
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
        }}>
        <Box
          display="grid"
          sx={{
            gridTemplateColumns: {
              xs: `repeat(auto-fill, minmax(100%, 1fr))`,
              sm: `repeat(auto-fill, minmax(calc(50% - 24px), 1fr))`,
              md: `repeat(auto-fill, minmax(280px, 1fr))`
            },
            justifyItems: "flex-start",
            width: "auto"
          }}
          gap={3}>
          {items.map((item, i) => (
            <GalleryCard
              fitWidth
              key={i}
              {...item}
              mode="grid"
              onClick={() => (onSelect ? onSelect(i) : handleSelectGallery(i))}
              onSetFavourite={(currentValue) => handleSetFavourite(item.id.toString(), currentValue)}
              isFavourite={favourites.indexOf(+item.id) !== -1}
            />
          ))}
        </Box>
        {emptyText && !items.length && (
          <Box>
            <Typography variant="subtitle1">{emptyText}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GaleriesGrid;
