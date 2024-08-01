import React, { useEffect, useState } from "react";
import { Gallery } from "../types/gallery";
import { Box, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import DisplayImage from "./DisplayImage.tsx";
import { galleryToGalleryContent } from "../utils.ts";
import { useNavigate } from "../utils.ts";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import FollowButton from "./FollowButton.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface GalleryDetailsProps {
  gallery: Gallery;
}

const GalleryDetails: React.FC<GalleryDetailsProps> = ({ gallery }) => {
  const galleryContent = galleryToGalleryContent(gallery);
  const navigate = useNavigate();
  const data = useData();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [favourites, setFavourites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const handleSetFavourite = async (isFavourite: boolean) => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (galleryContent?.id) {
      setIsLoading(true);
      try {
        if (isFavourite) {
          await data.removeFavouriteGallery(galleryContent.id.toString()).then((resp) => {
            setFavourites(resp);
          });
        } else {
          await data.addFavouriteGallery(galleryContent.id.toString()).then((resp) => {
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

  const handleClick = () => {
    if (gallery?.shop.slug) {
      navigate(`/gallerie/${gallery.shop?.slug}`);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: undefined, md: "612px" },
        width: "100%",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "center", sm: "flex-start" },
      }}
      display="flex">
      <DisplayImage
        borderRadius="4px"
        src={galleryContent.coverImage}
        onClick={handleClick}
        width={isMobile ? "100%" : 188}
        height={isMobile ? "auto" : 188}
      />
      <Box flexGrow={1} pl={{ xs: 0, sm: 3 }} pr={{ xs: 0, md: 3 }} sx={{ mt: { xs: 2, sm: 0 }, width: "100%" }}>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box flexGrow={1}>
            <Typography variant="subtitle1">
              <Link href={`/gallerie/${gallery.shop?.slug}`}>{galleryContent.title}</Link>
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {galleryContent.subtitle}
            </Typography>
          </Box>
          <Box>
            <FollowButton
              isLoading={isLoading}
              isFavourite={favourites.indexOf(+galleryContent.id) !== -1}
              onClick={handleSetFavourite}
            />
          </Box>
        </Box>
        <Typography sx={{ mt: 3 }} color="textSecondary" variant="subtitle1">
          {galleryContent.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default GalleryDetails;
