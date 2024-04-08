import React, { useEffect, useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import DisplayImage from "./DisplayImage.tsx";
import { artistToGalleryItem } from "../utils.ts";
import { Artist } from "../types/artist.ts";
import sanitizeHtml from "sanitize-html";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import FollowButton from "./FollowButton.tsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface ArtistDetailsProps {
  artist: Artist;
}

//TODO: descrizione galleria

const ArtistDetails: React.FC<ArtistDetailsProps> = ({ artist }) => {
  const artistContent = artistToGalleryItem(artist);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const data = useData();
  const auth = useAuth();

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
  const handleSetFavourite = async (isFavourite: boolean) => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (artist?.id) {
      setIsLoading(true);
      try {
        if (isFavourite) {
          await data.removeFavouriteArtist(artist.id.toString()).then((resp) => {
            setFavourites(resp);
          });
        } else {
          await data.addFavouriteArtist(artist.id.toString()).then((resp) => {
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

  return (
    <Box
      sx={{
        maxWidth: "612px",
        width: "100%",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, md: 0 },
        alignItems: { xs: "center" }
      }}
      display="flex">
      <DisplayImage borderRadius="4px" src={artistContent.imgUrl}
                    onClick={() => navigate(`/artisti/${artistContent.slug}`)} width={320}
                    height={isMobile ? 320 : 254} />
      <Box flexGrow={1} px={3}>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box flexGrow={1}>
            <Typography variant="subtitle1">{artistContent.title}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {artistContent.subtitle}
            </Typography>
          </Box>
          <Box>
            <FollowButton
              isLoading={isLoading}
              isFavourite={favourites.indexOf(+artistContent.id) !== -1}
              onClick={handleSetFavourite}
            />
          </Box>
        </Box>
        <Typography sx={{ mt: 2 }} variant="subtitle1" color="textSecondary">
          {artistContent.artworksCount} {artistContent.artworksCount === 1 ? "Opera" : "Opere"}
        </Typography>
        <Typography
          sx={{ mt: 3 }}
          variant="body1"
          color="textSecondary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(artistContent.description || "", { allowedAttributes: false }) }}
        />
      </Box>
    </Box>
  );
};

export default ArtistDetails;
