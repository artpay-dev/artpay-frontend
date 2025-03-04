import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Artist } from "../types/artist.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Chip, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import sanitizeHtml from "sanitize-html";
import ReadMoreTypography from "../components/ReadMoreTypography.tsx";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { artistsToGalleryItems, artworksToGalleryItems, getDefaultPaddingX } from "../utils.ts";
import FavouriteFilledIcon from "../components/icons/FavouriteFilledIcon.tsx";
import FavouriteIcon from "../components/icons/FavouriteIcon.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import ShareIcon from "../components/icons/ShareIcon.tsx";
import ArtworksList from "../components/ArtworksList.tsx";
import { ArtistCardProps } from "../components/ArtistCard.tsx";
import ArtistsList from "../components/ArtistsList.tsx";
import { Gallery } from "../types/gallery.ts";
import ArtworksGrid from "../components/ArtworksGrid.tsx";

export interface ArtistProps {}

const Artist: React.FC<ArtistProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [artist, setArtist] = useState<Artist>();
  const [artistCategories, setArtistCategories] = useState<string[]>([]);
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<ArtistCardProps[]>([]);
  const [isArtistFavourite, setIsArtistFavourite] = useState(false);
  const [associateGallerySlug, setAssociateGallerySlug] = useState<string | null>(null);

  const data = useData();
  const auth = useAuth();
  const dialogs = useDialogs();
  const snackbar = useSnackbars();
  const urlParams = useParams<{ slug?: string }>();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const artistImage = artist?.medium_img?.length ? artist?.medium_img[0] : "";

  const navigate = useNavigate();

  const handleAssociateGallery = async (artist : Artist  ) : Promise<string | null> => {
    try {
      const res: Gallery = await data.getGallery(artist.author.toString());
      return res.nice_name
    } catch (e) {
      console.log(e);
      return null
    }
  };

  const handleBackToGallery = () => {
    navigate(`/gallerie/${associateGallerySlug}`);
  };

  const handleShare = async () => {
    await dialogs.share(window.location.href);
  };
  const handleSetArtistFavourite = async () => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (!artist?.id) {
      return;
    }
    setIsLoading(true);
    if (isArtistFavourite) {
      await data.removeFavouriteArtist(artist.id.toString());
      setIsArtistFavourite(false);
    } else {
      await data.addFavouriteArtist(artist.id.toString());
      setIsArtistFavourite(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!urlParams.slug) {
      return;
    }
    Promise.all([
      data.getArtistBySlug(urlParams.slug).then(async (resp) => {
        setArtist(resp);

        handleAssociateGallery(resp).then(setAssociateGallerySlug);

        const artistCategories = data.getArtistCategories(resp);
        // const artworks = data.getArt
        setArtistCategories(artistCategories);
        // console.log("resp.artworks", resp.artworks);

        const artworksIds = (resp.artworks || []).map((a) => +a.ID);
        const artistArtworks = await data.getArtworks(artworksIds);
        setArtworks(artworksToGalleryItems(artistArtworks));
        const favouriteArtists = await data.getFavouriteArtists();

        setIsArtistFavourite(favouriteArtists.some(artist => artist.id === resp?.id));
      }),
      data.listFeaturedArtists().then((resp) => setFeaturedArtists(artistsToGalleryItems(resp))),
    ])
      .then(() => {
        setIsReady(true);

      })
      .catch((e) => {
        console.error(e);
        snackbar.error("Si è verificato un errore");
        setIsReady(true);
      });


  }, [data, urlParams?.slug]);

  const px = getDefaultPaddingX();


  return (
    <DefaultLayout pageLoading={!isReady}>
      <Box
        mt={12}
        sx={{
          px: px,
          pb: 1,
          mt: { xs: 12, sm: 12, md: 16, lg: 18 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "start" },
        }}
        gap={2}
        display="flex">
        <Box>
          <img className="borderRadius" src={artistImage} style={{ width: "320px" }} />
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="start" sx={{ maxWidth: "100%" }}>
          <Box display="flex">
            <Typography variant="h1" style={{ cursor: "pointer", flexGrow: 1 }}>
              {artist?.title?.rendered}
            </Typography>
            <Box display="flex" gap={0}>
              <IconButton disabled={isLoading} onClick={() => handleSetArtistFavourite()}>
                {isArtistFavourite ? (
                  <FavouriteFilledIcon color={isLoading ? "disabled" : "primary"} fontSize="small" />
                ) : (
                  <FavouriteIcon color={isLoading ? "disabled" : "primary"} fontSize="small" />
                )}
              </IconButton>
              <IconButton disabled={isLoading} onClick={handleShare}>
                <ShareIcon color={isLoading ? "disabled" : "primary"} />
              </IconButton>
            </Box>
          </Box>
          <Typography sx={{ mt: 2 }} variant="h4" color="textSecondary">
            {artist?.acf?.birth_nation}, {artist?.acf?.birth_year}
          </Typography>
          <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
            {artistCategories.map((c) => (
              <Chip color="primary" key={c} label={c} />
            ))}
          </Box>
          <Typography sx={{ mt: 2 }} variant="body2" color="textSecondary">
            {artist?.artworks?.length || 0} opere presenti su artpay
          </Typography>
          <ReadMoreTypography heightLimit={100} sx={{ mt: 3 }} variant="subtitle1">
            {sanitizeHtml(artist?.content.rendered || "", { allowedTags: [] }) || ""}
          </ReadMoreTypography>
          {associateGallerySlug && (
            <Box mt={4}>
              <Button variant={"outlined"} onClick={handleBackToGallery} sx={{ width: { xs: "100%", sm: "fit-content" } }}>
                Torna alla Galleria
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{mt: { xs: 3, md: 6 }, px: isMobile ? 0 : px}} mt={8} pb={6}>
        <Typography sx={{ mb: { xs: 3, md: 6 }, px: isMobile ? px : 0 }} variant="h2">
          {"Opere dello stesso artista"}
        </Typography>
        {isMobile ? (
          <ArtworksList disablePadding items={artworks} />
        ) : (
          <ArtworksGrid disablePadding items={artworks} />
        )}
      </Box>
      <Box sx={{mt: { xs: 3, md: 6 }, px: isMobile ? 0 : px }} mt={8} pb={6}>
        <Typography sx={{ mb: { xs: 3, md: 6 }, px: isMobile ? px : 0 }} variant="h2">
          {"Artisti in evidenza"}
        </Typography>
        <ArtistsList disablePadding size="medium" items={featuredArtists} />
      </Box>
    </DefaultLayout>
  );
};

export default Artist;
