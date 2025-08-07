import React, { useEffect, useState } from "react";
import { CardSize } from "../types";
import { useNavigate } from "../utils.ts";
import { Box, Typography, Grid } from "@mui/material";
import GalleryCard, { GalleryCardProps } from "./GalleryCard.tsx";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface GalleriesListProps {
  items: GalleryCardProps[];
  title?: string;
  subtitle?: string;
  disablePadding?: boolean;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  emptyText?: string;
  onLoadMore?: () => Promise<void>;
  loading?: boolean;
}



const GalleriesList: React.FC<GalleriesListProps> = ({
  title,
  subtitle,
  disablePadding = false,
  items,
  onSelect,
  loading = false
}) => {
  const navigate = useNavigate();
  const data = useData();
  const auth = useAuth();
  const snackbars = useSnackbars();

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
        console.error(e);
        snackbars.error(e);
      }
    }
  };

  const handleSelectGallery = (index: number) => {
    const selectedGallery = items[index];
    navigate(`/gallerie/${selectedGallery.slug}`);
  };

  const displayItems = items.slice(0, 6);

  if (!items.length && !loading) return null;

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
      
      <Grid px={0} container>
        <Grid xs={12} sx={{ maxWidth: "100%", overflow: "hidden", py: 0, px: { xs: 0, md: 0 } }}>
          <div 
            className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <ul className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
              {displayItems.map((item, i) => (
                  <li key={i} className="min-w-80 max-w-80">
                    <GalleryCard
                      fitWidth
                      {...item}
                      mode="list"
                      onClick={() => (onSelect ? onSelect(i) : handleSelectGallery(i))}
                      onSetFavourite={(currentValue) => handleSetFavourite(item.id.toString(), currentValue)}
                      isFavourite={favourites.indexOf(+item.id) !== -1}
                    />
                  </li>
                ))}
            </ul>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GalleriesList;
