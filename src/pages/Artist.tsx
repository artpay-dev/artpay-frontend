import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Artist } from "../types/artist.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useParams } from "react-router-dom";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import sanitizeHtml from "sanitize-html";
import ReadMoreTypography from "../components/ReadMoreTypography.tsx";
import ArtworksGrid from "../components/ArtworksGrid.tsx";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import FavouriteFilledIcon from "../components/icons/FavouriteFilledIcon.tsx";
import FavouriteIcon from "../components/icons/FavouriteIcon.tsx";
import { Share } from "@mui/icons-material";
import { useDialogs } from "../hoc/DialogProvider.tsx";

export interface ArtistProps {}

const Artist: React.FC<ArtistProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [artist, setArtist] = useState<Artist>();
  const [artistCategories, setArtistCategories] = useState<string[]>([]);
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);
  const [isArtistFavourite, setIsArtistFavourite] = useState(false);

  const data = useData();
  const dialogs = useDialogs()
  const snackbar = useSnackbars();
  const urlParams = useParams<{ slug?: string }>();

  const artistImage = artist?.medium_img?.length ? artist?.medium_img[0] : "";

  const handleShare = async () => {
    await dialogs.share(window.location.href);
  };
  const handleSetArtistFavourite = async () => {
    if (!artist?.id) {
      return
    }
    setIsLoading(true)
    if (isArtistFavourite) {
      await data.removeFavouriteArtist(artist.id.toString())
      setIsArtistFavourite(false)
    } else {
      await data.addFavouriteArtist(artist.id.toString())
      setIsArtistFavourite(true)
    }
    setIsLoading(false)
  };

  useEffect(() => {
    if (!urlParams.slug) {
      return;
    }
    data
      .getArtistBySlug(urlParams.slug)
      .then(async (resp) => {
        setArtist(resp);
        const artistCategories = data.getArtistCategories(resp);
        // const artworks = data.getArt
        setArtistCategories(artistCategories);
        // console.log("resp.artworks", resp.artworks);

        const artworksIds = (resp.artworks || []).map((a) => +a.ID);
        const artistArtworks = await data.getArtworks(artworksIds);
        setArtworks(artworksToGalleryItems(artistArtworks));
        const favouriteArtists = await data.getFavouriteArtists()

        setIsArtistFavourite(favouriteArtists.indexOf(resp?.id||0) !== -1 );

        setIsReady(true);
      })
      .catch((e) => {
        console.error(e);
        snackbar.error("Si è verificato un errore");
        setIsReady(true);
      });
  }, [data, snackbar, urlParams?.slug]);


  return (
    <DefaultLayout pageLoading={!isReady}>
      <Box
        mt={12}
        sx={{
          px: { xs: 3, sm: 6, md: 8 },
          pb: 1,
          mt: { xs: 8, sm: 12, md: 14 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "start" },
        }}
        gap={2}
        display="flex">
        <Box>
          <img className="borderRadius" src={artistImage} style={{ width: "320px" }} />
          <Box display="flex" pt={1} gap={1}>
            <IconButton disabled={isLoading} onClick={() => handleSetArtistFavourite()}>
              {isArtistFavourite ? (
                <FavouriteFilledIcon color={isLoading ? "disabled" : "primary"} fontSize="small" />
              ) : (
                <FavouriteIcon color={isLoading ? "disabled" : "primary"} fontSize="small" />
              )}
            </IconButton>
            <IconButton disabled={isLoading} onClick={handleShare}>
              <Share color={isLoading ? "disabled" : "primary"} />
            </IconButton>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="start">
          <Typography variant="h1" style={{ cursor: "pointer" }}>
            {artist?.title?.rendered}
          </Typography>
          <Typography sx={{ mt: 2 }} variant="h4" color="textSecondary">
            {artist?.acf?.birth_nation}, {artist?.acf?.birth_year}
          </Typography>
          <Box mt={2} display="flex" gap={1}>
            {artistCategories.map((c) => (
              <Chip color="secondary" key={c} label={c} />
            ))}
          </Box>
          <Typography sx={{ mt: 2 }} variant="body2" color="textSecondary">
            {artist?.artworks?.length || 0} opere presenti su artpay
          </Typography>
          <ReadMoreTypography heightLimit={100} sx={{ mt: 3 }} variant="subtitle1">
            {sanitizeHtml(artist?.content.rendered || "", { allowedTags: [] }) || 0}
          </ReadMoreTypography>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 3, sm: 6, md: 0 }, mt: { xs: 3, md: 6 } }} mt={8} pb={6}>
        <ArtworksGrid title="Opere dello stesso artista" items={artworks} />
      </Box>
    </DefaultLayout>
  );
};

export default Artist;
