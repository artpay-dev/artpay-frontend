import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
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
import { Gallery } from "../types/gallery.ts";
import ArtworksGrid from "../components/ArtworksGrid.tsx";
import { ArtistArtwork } from "../types/artist.ts";


type Artist = {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  template: string;
  categoria_artisti: number[];
  meta: [];
  artworks?: ArtistArtwork[];
  featured_img?: [string, number, number, boolean];
  full_img?: [string, number, number, boolean];
  medium_img?: [string, number, number, boolean];
  thumb_img?: [string, number, number, boolean];
  acf: {
    birth_nation: string;
    birth_year: string;
    location: string;
  };
  _links: {
    self: {
      href: string;
    }[];
    collection: {
      href: string;
    }[];
    about: {
      href: string;
    }[];
    author: {
      embeddable: boolean;
      href: string;
    }[];
    "wp:attachment": {
      href: string;
    }[];
    curies: {
      name: string;
      href: string;
      templated: boolean;
    }[];
  };
};

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

  console.log(artist)

  const navigate = useNavigate();

  const handleAssociateGallery = async (artist: Artist): Promise<string | null> => {
    try {
      const res: Gallery = await data.getGallery(artist.author.toString());
      return res.nice_name;
    } catch (e) {
      console.log(e);
      return null;
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

        setIsArtistFavourite(favouriteArtists.some((artist) => artist.id === resp?.id));
      }),
      data.listFeaturedArtists().then((resp) => {
        setFeaturedArtists(artistsToGalleryItems(resp));
      }),
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

  console.log(featuredArtists);

  const px = getDefaultPaddingX();

  return (
    <DefaultLayout pageLoading={!isReady}>
      <Box
        mt={12}
        sx={{
          pb: 1,
          mt: { md: 16, lg: 18 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "start" },
        }}
        gap={2}
        display="flex">
        {artistImage && (
          <Box
            sx={{
              minWidth: { xs: "100%", md: "420px", lg: "396px" },
              height: { xs: "100%", md: "420px", lg: "294px" },
              maxHeight: { xs: "100%", md: "420px", lg: "294px" },
              marginBottom: { xs: "48px" , md: "96px" }
            }}>
            <img
              src={artistImage}
              className="object-cover w-full min-h-96 max-h-96 lg:max-h-none lg:h-[294px] lg:w-[396px] rounded-b-2xl md:rounded-2xl "
            />
          </Box>
        )}
        <Box display="flex" flexDirection="column" justifyContent="start" sx={{ maxWidth: "100%" , px: {xs: 4, md: 0}}}>
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
              <Button
                variant={"outlined"}
                onClick={handleBackToGallery}
                sx={{ width: { xs: "100%", sm: "fit-content" } }}>
                Torna alla Galleria
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 3, md: 6 } }} mt={8} pb={6}>
        <Typography sx={{ mb: { xs: 3, md: 6 }, px: isMobile ? px : 0 }} variant="h2" className={'mb-6 md:12'}>
          {"Opere dello stesso artista"}
        </Typography>
        {isMobile ? <ArtworksList disablePadding items={artworks} /> : <ArtworksGrid disablePadding items={artworks} />}
      </Box>
    </DefaultLayout>
  );
};

export default Artist;
