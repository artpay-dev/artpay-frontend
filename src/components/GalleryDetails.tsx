import React, { useEffect, useState } from "react";
import { Gallery } from "../types/gallery";
import { Box, Typography } from "@mui/material";
import DisplayImage from "./DisplayImage.tsx";
import { galleryToGalleryContent } from "../utils.ts";
import { useNavigate } from "react-router-dom";
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
        console.log(e);
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
        maxWidth: "612px",
        width: "100%",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start" }
      }}
      display="flex">
      <DisplayImage borderRadius="4px" src={galleryContent.coverImage} onClick={handleClick} width={188} height={188} />
      <Box flexGrow={1} px={3} sx={{ mt: { xs: 2, md: 0 }, width: "100%" }}>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box flexGrow={1}>
            <Typography variant="subtitle1">{galleryContent.title}</Typography>
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
